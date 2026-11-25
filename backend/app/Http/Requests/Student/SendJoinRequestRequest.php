<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

// طلب انضمام من الطالب لفريق: رسالة اختيارية فقط
class SendJoinRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $message = is_string($this->message) ? trim($this->message) : $this->message;
        $this->merge(['message' => $message === '' ? null : $message]);
    }

    public function rules(): array
    {
        return [
            'message' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'message.string' => 'الرسالة يجب أن تكون نصاً',
            'message.max'    => 'الرسالة يجب ألا تزيد عن 500 حرف',
        ];
    }
}
