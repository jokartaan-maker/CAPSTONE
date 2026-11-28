<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

// دعوة من قائد الفريق لطالب
class InviteStudentRequest extends FormRequest
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
            // طالب موجود وحسابه فعّال
            'student_id' => ['required', 'integer', Rule::exists('students', 'id')->where('is_active', true)],
            'message'    => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'student_id.required' => 'يجب اختيار الطالب المدعو',
            'student_id.integer'  => 'رقم الطالب غير صالح',
            'student_id.exists'   => 'الطالب غير موجود',
            'message.string'      => 'الرسالة يجب أن تكون نصاً',
            'message.max'         => 'الرسالة يجب ألا تزيد عن 500 حرف',
        ];
    }
}
