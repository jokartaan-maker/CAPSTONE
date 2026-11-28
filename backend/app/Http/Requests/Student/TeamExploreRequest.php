<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TeamExploreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'field'  => ['nullable', 'string', Rule::in(config('students.majors'))],
            'status' => ['nullable', Rule::in(['open', 'full'])],
        ];
    }

    public function messages(): array
    {
        return [
            'search.max' => 'نص البحث طويل جداً',
            'field.in'   => 'المجال غير صالح',
            'status.in'  => 'الحالة يجب أن تكون open أو full',
        ];
    }
}
