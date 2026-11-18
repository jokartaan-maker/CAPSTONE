<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\ForgotPasswordRequest;
use App\Http\Requests\Student\ResetPasswordRequest;
use App\Models\Student;
use App\Notifications\StudentPasswordChangedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    // POST /api/student/forgot-password
    public function forgot(ForgotPasswordRequest $request): JsonResponse
    {
        $email = $request->validated()['email'];

        $student = Student::where('email', $email)->first();

        // نرسل فقط إذا كان الحساب موجوداً ومفعّلاً
        if ($student && $student->is_active) {
            Password::broker('students')->sendResetLink(['email' => $email]);
        }

        // نفس الرد دائماً: لا نكشف هل الإيميل مسجّل أم لا
        return response()->json([
            'message' => 'إذا كان البريد مسجّلاً لدينا، ستصلك رسالة فيها رابط إعادة تعيين كلمة المرور خلال دقائق',
        ]);
    }

    // POST /api/student/reset-password
    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $data = $request->validated();

        $status = Password::broker('students')->reset(
            [
                'email'                 => $data['email'],
                'password'              => $data['password'],
                'password_confirmation' => $request->input('password_confirmation'),
                'token'                 => $data['token'],
            ],
            function (Student $student, string $password) {
                // 1) كلمة المرور الجديدة (تُشفَّر تلقائياً)
                $student->forceFill([
                    'password'       => $password,
                    'remember_token' => Str::random(60),
                ])->save();

                // 2) خروج من كل الأجهزة: حذف كل الـ tokens القديمة
                $student->tokens()->delete();

                // 3) إيميل التنبيه الأمني
                $student->notify(new StudentPasswordChangedNotification());
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            // token خطأ، أو منتهي (أكثر من 30 دقيقة)، أو استُخدم مسبقاً، أو إيميل غير مطابق
            return response()->json([
                'message' => 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية، اطلب رابطاً جديداً',
            ], 422);
        }

        return response()->json([
            'message' => 'تم تغيير كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن',
        ]);
    }
}
