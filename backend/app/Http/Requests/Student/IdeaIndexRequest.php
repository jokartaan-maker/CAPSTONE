<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IdeaIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search'        => ['sometimes', 'nullable', 'string', 'max:100'],
            'field'         => ['sometimes', 'nullable', 'string', Rule::in(config('students.majors'))],
            'supervisor_id' => ['sometimes', 'nullable', 'integer', 'exists:supervisors,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'search.max'            => 'نص البحث طويل جداً',
            'field.in'              => 'المجال المختار غير موجود',
            'supervisor_id.integer' => 'رقم المشرف غير صحيح',
            'supervisor_id.exists'  => 'المشرف غير موجود',
        ];
    }
}
