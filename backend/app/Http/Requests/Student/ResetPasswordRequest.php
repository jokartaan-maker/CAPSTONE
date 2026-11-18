<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => is_string($this->email) ? strtolower(trim($this->email)) : $this->email,
        ]);
    }

    public function rules(): array
    {
        return [
            'token' => ['required', 'string'],

            'email' => ['required', 'email', 'max:100'],

            'password' => [
                'required', 'string', 'min:8', 'max:72', 'confirmed',
                // نفس قواعد التسجيل: حرف صغير + حرف كبير + رقم + رمز
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'token.required' => 'رابط إعادة التعيين غير صالح',

            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email'    => 'صيغة البريد الإلكتروني غير صحيحة',
            'email.max'      => 'البريد الإلكتروني طويل جداً',

            'password.required'  => 'كلمة المرور مطلوبة',
            'password.min'       => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
            'password.max'       => 'كلمة المرور طويلة جداً',
            'password.confirmed' => 'تأكيد كلمة المرور غير مطابق',
            'password.regex'     => 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز',
        ];
    }
}
