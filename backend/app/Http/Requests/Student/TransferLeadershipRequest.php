<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

// نقل قيادة الفريق لعضو آخر
class TransferLeadershipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_id' => ['required', 'integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'student_id.required' => 'يجب اختيار العضو الذي ستنتقل إليه القيادة',
            'student_id.integer'  => 'رقم الطالب غير صالح',
        ];
    }
}
