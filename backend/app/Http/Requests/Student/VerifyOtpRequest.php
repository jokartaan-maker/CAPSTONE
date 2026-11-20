<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class VerifyOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => is_string($this->email) ? strtolower(trim($this->email)) : $this->email,
            'otp'   => is_string($this->otp)   ? trim($this->otp)               : $this->otp,
        ]);
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:100'],
            'otp'   => ['required', 'string', 'size:6', 'regex:/^\d{6}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email'    => 'صيغة البريد الإلكتروني غير صحيحة',
            'otp.required'   => 'رمز التحقق مطلوب',
            'otp.size'       => 'رمز التحقق يجب أن يكون 6 أرقام',
            'otp.regex'      => 'رمز التحقق يجب أن يكون أرقاماً فقط',
        ];
    }
}
