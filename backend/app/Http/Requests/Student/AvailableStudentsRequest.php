<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AvailableStudentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'major'  => ['nullable', 'string', Rule::in(config('students.majors'))],
        ];
    }

    public function messages(): array
    {
        return [
            'search.max' => 'نص البحث طويل جداً',
            'major.in'   => 'القسم غير صالح',
        ];
    }
}
