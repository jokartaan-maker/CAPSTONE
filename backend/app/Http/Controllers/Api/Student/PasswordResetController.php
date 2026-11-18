<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\ForgotPasswordRequest;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;

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
}
