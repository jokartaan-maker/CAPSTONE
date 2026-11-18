<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],

            'password' => [
                'required', 'string', 'min:8', 'max:72', 'confirmed',
                'different:current_password',
                // نفس قواعد التسجيل: حرف صغير + حرف كبير + رقم + رمز
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required' => 'كلمة المرور الحالية مطلوبة',

            'password.required'  => 'كلمة المرور الجديدة مطلوبة',
            'password.min'       => 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل',
            'password.max'       => 'كلمة المرور الجديدة طويلة جداً',
            'password.confirmed' => 'تأكيد كلمة المرور غير مطابق',
            'password.different' => 'كلمة المرور الجديدة يجب أن تختلف عن الحالية',
            'password.regex'     => 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز',
        ];
    }
}
