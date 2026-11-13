<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Models\PasswordResetToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function forgot(ForgotPasswordRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)
            ->where('is_active', true)
            ->first();

        if ($user) {
            PasswordResetToken::where('user_id', $user->id)
                ->whereNull('used_at')
                ->delete();

            $plain = Str::random(64);

            PasswordResetToken::create([
                'user_id' => $user->id,
                'token' => hash('sha256', $plain),
                'expires_at' => now()->addMinutes(60),
            ]);

            Mail::raw(
                "رمز استعادة كلمة المرور:\n{$plain}\n\nالرمز صالح لمدة ساعة واحدة.",
                fn ($message) => $message->to($user->email)->subject('استعادة كلمة المرور')
            );
        }

        return response()->json([
            'message' => 'إذا كان البريد مسجلاً فسيصلك رمز الاستعادة',
        ]);
    }

    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)
            ->where('is_active', true)
            ->first();

        $record = $user
            ? PasswordResetToken::where('user_id', $user->id)
                ->where('token', hash('sha256', $request->token))
                ->whereNull('used_at')
                ->where('expires_at', '>', now())
                ->first()
            : null;

        if (! $record) {
            return response()->json([
                'message' => 'الرمز غير صالح أو منتهي الصلاحية',
            ], 422);
        }

        DB::transaction(function () use ($user, $record, $request) {
            $user->update(['password' => $request->password]);
            $record->update(['used_at' => now()]);
            $user->tokens()->delete();
        });

        return response()->json(['message' => 'تم تغيير كلمة المرور بنجاح']);
    }
}
