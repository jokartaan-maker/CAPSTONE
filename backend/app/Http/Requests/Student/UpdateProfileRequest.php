<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->name)) {
            $this->merge(['name' => trim($this->name)]);
        }

        if (is_string($this->phone)) {
            // إزالة المسافات والشرطات: "0933 123-456" → "0933123456"
            $this->merge(['phone' => preg_replace('/[\s\-]/', '', $this->phone)]);
        }
    }

    public function rules(): array
    {
        // sometimes = الحقل اختياري، لكن إذا أُرسل يجب أن يكون صحيحاً
        return [
            'name'       => ['sometimes', 'required', 'string', 'min:3', 'max:100'],
            'phone'      => ['sometimes', 'nullable', 'regex:/^\+?[0-9]{7,15}$/'],
            'study_year' => ['sometimes', 'required', 'integer', Rule::in(config('students.study_years'))],
            'skills'     => ['sometimes', 'array', 'max:' . config('students.max_skills')],
            'skills.*'   => ['string', 'distinct', 'min:1', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'الاسم لا يمكن أن يكون فارغاً',
            'name.min'      => 'الاسم يجب أن يكون 3 أحرف على الأقل',
            'name.max'      => 'الاسم طويل جداً',

            'phone.regex' => 'رقم الهاتف غير صحيح (أرقام فقط، 7 إلى 15 رقماً، ويمكن أن يبدأ بـ +)',

            'study_year.required' => 'السنة الدراسية لا يمكن أن تكون فارغة',
            'study_year.integer'  => 'السنة الدراسية يجب أن تكون رقماً',
            'study_year.in'       => 'السنة الدراسية المختارة غير صحيحة',

            'skills.array'      => 'المهارات يجب أن تكون قائمة',
            'skills.max'        => 'لا يمكن إضافة أكثر من ' . config('students.max_skills') . ' مهارات',
            'skills.*.string'   => 'كل مهارة يجب أن تكون نصاً',
            'skills.*.distinct' => 'لا يمكن تكرار نفس المهارة',
            'skills.*.max'      => 'اسم المهارة طويل جداً',
        ];
    }
}
