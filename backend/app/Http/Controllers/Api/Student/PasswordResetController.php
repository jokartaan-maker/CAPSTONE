<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\ForgotPasswordRequest;
use App\Http\Requests\Student\ResetPasswordRequest;
use App\Http\Requests\Student\VerifyOtpRequest;
use App\Models\Student;
use App\Notifications\StudentOtpNotification;
use App\Notifications\StudentPasswordChangedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    private const OTP_MINUTES = 10;            // صلاحية الرمز
    private const MAX_ATTEMPTS = 5;            // محاولات خاطئة قبل إلغاء الرمز
    private const RESEND_COOLDOWN_SECONDS = 60; // أقل مدة بين رمزين لنفس الإيميل

    // POST /api/student/forgot-password
    // يولّد OTP ويرسله بالإيميل
    public function forgot(ForgotPasswordRequest $request): JsonResponse
    {
        $email = $request->validated()['email'];

        $student = Student::where('email', $email)->first();

        if ($student && $student->is_active) {
            $existing = DB::table('student_otp_tokens')->where('email', $email)->first();

            // إعادة الإرسال: رمز واحد كل 60 ثانية لنفس الإيميل
            $tooSoon = $existing
                && now()->diffInSeconds($existing->created_at, true) < self::RESEND_COOLDOWN_SECONDS;

            if (! $tooSoon) {
                $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

                DB::table('student_otp_tokens')->updateOrInsert(
                    ['email' => $email],
                    [
                        'otp'         => Hash::make($otp), // يُخزَّن كـ hash، لا كنص
                        'attempts'    => 0,
                        'reset_token' => null,
                        'expires_at'  => now()->addMinutes(self::OTP_MINUTES),
                        'verified_at' => null,
                        'created_at'  => now(),
                        'updated_at'  => now(),
                    ]
                );

                try {
                    $student->notify(new StudentOtpNotification($otp));
                } catch (\Throwable $e) {
                    // فشل الإرسال لا يغيّر الرد، حتى لا نكشف أن الإيميل مسجّل
                    Log::error('OTP mail failed', ['email' => $email, 'error' => $e->getMessage()]);
                }
            }
        }

        return response()->json([
            'message' => 'إذا كان البريد مسجّلاً لدينا، ستصلك رسالة تحتوي رمز التحقق خلال دقائق',
        ]);
    }

    // POST /api/student/verify-otp
    // يتحقق من الكود ويعيد reset_token مؤقت
    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
        $data  = $request->validated();
        $email = $data['email'];
        $otp   = $data['otp'];

        $record = DB::table('student_otp_tokens')
            ->where('email', $email)
            ->first();

        $invalid = response()->json([
            'message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية',
        ], 422);

        // لا يوجد رمز، أو منتهٍ، أو استُخدم، أو استُنفدت المحاولات
        if (
            ! $record
            || now()->isAfter($record->expires_at)
            || $record->verified_at !== null
            || $record->attempts >= self::MAX_ATTEMPTS
        ) {
            return $invalid;
        }

        // رمز خاطئ: نزيد عدد المحاولات
        if (! Hash::check($otp, $record->otp)) {
            DB::table('student_otp_tokens')->where('email', $email)->increment('attempts');

            return $invalid;
        }

        $resetToken = Str::random(64);

        DB::table('student_otp_tokens')
            ->where('email', $email)
            ->update([
                'reset_token' => Hash::make($resetToken),
                'verified_at' => now(),
                'updated_at'  => now(),
            ]);

        return response()->json([
            'message'     => 'تم التحقق من الرمز بنجاح',
            'reset_token' => $resetToken,
            'email'       => $email,
        ]);
    }

    // POST /api/student/reset-password
    // يستقبل reset_token + كلمة المرور الجديدة
    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $data  = $request->validated();
        $email = $data['email'];

        $record = DB::table('student_otp_tokens')
            ->where('email', $email)
            ->whereNotNull('verified_at')
            ->first();

        if (
            ! $record
            || ! Hash::check($data['token'], $record->reset_token)
            || now()->isAfter(\Illuminate\Support\Carbon::parse($record->expires_at)->addMinutes(self::OTP_MINUTES))
        ) {
            return response()->json([
                'message' => 'جلسة إعادة التعيين غير صالحة، ابدأ من جديد',
            ], 422);
        }

        $student = Student::where('email', $email)->first();

        if (! $student || ! $student->is_active) {
            return response()->json(['message' => 'الحساب غير موجود'], 422);
        }

        $student->forceFill([
            'password'       => $data['password'],
            'remember_token' => Str::random(60),
        ])->save();

        $student->tokens()->delete();

        DB::table('student_otp_tokens')->where('email', $email)->delete();

        $student->notify(new StudentPasswordChangedNotification());

        return response()->json([
            'message' => 'تم تغيير كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن',
        ]);
    }
}
