<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    // تنظيف المدخلات قبل الفحص
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name'  => is_string($this->name) ? trim($this->name) : $this->name,
            'email' => is_string($this->email) ? strtolower(trim($this->email)) : $this->email,
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:100'],

            'email' => ['required', 'email', 'max:100', 'unique:students,email'],

            'password' => [
                'required', 'string', 'min:8', 'max:72', 'confirmed',
                // حرف صغير + حرف كبير + رقم + رمز
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/',
            ],

            'university_number' => [
                'required', 'digits_between:6,20', 'unique:students,university_number',
            ],

            'major' => ['required', 'string', Rule::in(config('students.majors'))],

            'study_year' => ['required', 'integer', Rule::in(config('students.study_years'))],

            'skills'   => ['sometimes', 'array', 'max:' . config('students.max_skills')],
            'skills.*' => ['string', 'distinct', 'min:1', 'max:50'],

            'terms' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'الاسم مطلوب',
            'name.min'      => 'الاسم يجب أن يكون 3 أحرف على الأقل',
            'name.max'      => 'الاسم طويل جداً',

            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email'    => 'صيغة البريد الإلكتروني غير صحيحة',
            'email.max'      => 'البريد الإلكتروني طويل جداً',
            'email.unique'   => 'هذا البريد الإلكتروني مسجّل مسبقاً',

            'password.required'  => 'كلمة المرور مطلوبة',
            'password.min'       => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
            'password.max'       => 'كلمة المرور طويلة جداً',
            'password.confirmed' => 'تأكيد كلمة المرور غير مطابق',
            'password.regex'     => 'كلمة المرور يجب أن تحتوي على حرف كبير وحرف صغير ورقم ورمز',

            'university_number.required'       => 'الرقم الجامعي مطلوب',
            'university_number.digits_between' => 'الرقم الجامعي يجب أن يكون أرقاماً فقط (6 إلى 20 رقماً)',
            'university_number.unique'         => 'هذا الرقم الجامعي مسجّل مسبقاً',

            'major.required' => 'القسم مطلوب',
            'major.in'       => 'القسم المختار غير موجود في القائمة',

            'study_year.required' => 'السنة الدراسية مطلوبة',
            'study_year.integer'  => 'السنة الدراسية يجب أن تكون رقماً',
            'study_year.in'       => 'السنة الدراسية المختارة غير صحيحة',

            'skills.array'      => 'المهارات يجب أن تكون قائمة',
            'skills.max'        => 'لا يمكن إضافة أكثر من ' . config('students.max_skills') . ' مهارات',
            'skills.*.string'   => 'كل مهارة يجب أن تكون نصاً',
            'skills.*.distinct' => 'لا يمكن تكرار نفس المهارة',
            'skills.*.max'      => 'اسم المهارة طويل جداً',

            'terms.accepted' => 'يجب الموافقة على الشروط والأحكام',
        ];
    }
}
