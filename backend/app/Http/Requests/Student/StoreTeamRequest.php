<?php

namespace App\Http\Requests\Student;

use App\Models\AcademicTerm;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    // حذف المسافات الزائدة من اسم الفريق
    protected function prepareForValidation(): void
    {
        if (is_string($this->name)) {
            $this->merge(['name' => preg_replace('/\s+/u', ' ', trim($this->name))]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required', 'string', 'min:3', 'max:50',
                // لا يتكرر اسم الفريق في الفصل الحالي
                Rule::unique('teams', 'name')->where('academic_term_id', AcademicTerm::current()?->id),
            ],
            'idea_id' => ['required', 'integer', Rule::exists('ideas', 'id')],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'    => 'اسم الفريق مطلوب',
            'name.string'      => 'اسم الفريق يجب أن يكون نصاً',
            'name.min'         => 'اسم الفريق يجب ألا يقل عن 3 أحرف',
            'name.max'         => 'اسم الفريق يجب ألا يزيد عن 50 حرفاً',
            'name.unique'      => 'اسم الفريق مستخدم في هذا الفصل، اختر اسماً آخر',
            'idea_id.required' => 'يجب اختيار فكرة للفريق',
            'idea_id.integer'  => 'رقم الفكرة غير صالح',
            'idea_id.exists'   => 'الفكرة غير موجودة',
        ];
    }
}
