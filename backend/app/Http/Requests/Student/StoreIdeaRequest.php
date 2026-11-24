<?php

namespace App\Http\Requests\Student;

use App\Models\AcademicTerm;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreIdeaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    // تنظيف المدخلات: حذف المسافات، وحذف العناصر الفارغة من القوائم
    protected function prepareForValidation(): void
    {
        $clean = fn ($value) => is_string($value) ? trim($value) : $value;

        $cleanList = fn ($list) => is_array($list)
            ? array_values(array_filter(array_map($clean, $list), fn ($item) => $item !== '' && $item !== null))
            : $list;

        $this->merge([
            'title'        => $clean($this->title),
            'description'  => $clean($this->description),
            'problem'      => $clean($this->problem),
            'features'     => $cleanList($this->features),
            'requirements' => $cleanList($this->requirements),
            'tech_stack'   => $cleanList($this->tech_stack),
        ]);
    }

    public function rules(): array
    {
        return [
            'title' => [
                'required', 'string', 'min:5', 'max:200',
                // لا تتكرر نفس الفكرة في الفصل الحالي
                Rule::unique('ideas', 'title')->where('academic_term_id', AcademicTerm::current()?->id),
            ],
            'field'       => ['required', 'string', Rule::in(config('students.majors'))],
            'description' => ['required', 'string', 'min:30', 'max:5000'],
            'problem'     => ['required', 'string', 'min:10', 'max:3000'],

            'features'     => ['required', 'array', 'min:2', 'max:15'],
            'features.*'   => ['string', 'distinct', 'max:200'],
            'requirements' => ['required', 'array', 'min:1', 'max:15'],
            'requirements.*' => ['string', 'distinct', 'max:200'],
            'tech_stack'   => ['required', 'array', 'min:1', 'max:15'],
            'tech_stack.*' => ['string', 'distinct', 'max:50'],

            // المشرف المقترح: يجب أن يكون معتمداً ومفعّلاً
            'supervisor_id' => [
                'required', 'integer',
                Rule::exists('supervisors', 'id')
                    ->where('registration_status', 'approved')
                    ->where('is_active', true),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'عنوان الفكرة مطلوب',
            'title.min'      => 'العنوان يجب أن يكون 5 أحرف على الأقل',
            'title.max'      => 'العنوان طويل جداً',
            'title.unique'   => 'توجد فكرة بنفس العنوان في هذا الفصل',

            'field.required' => 'المجال مطلوب',
            'field.in'       => 'المجال المختار غير موجود',

            'description.required' => 'وصف الفكرة مطلوب',
            'description.min'      => 'الوصف يجب أن يكون 30 حرفاً على الأقل',
            'description.max'      => 'الوصف طويل جداً',

            'problem.required' => 'وصف المشكلة مطلوب',
            'problem.min'      => 'وصف المشكلة يجب أن يكون 10 أحرف على الأقل',
            'problem.max'      => 'وصف المشكلة طويل جداً',

            'features.required' => 'أدخل وظيفتين على الأقل',
            'features.min'      => 'أدخل وظيفتين على الأقل',
            'features.max'      => 'لا يمكن إضافة أكثر من 15 وظيفة',
            'features.*.distinct' => 'لا يمكن تكرار نفس الوظيفة',
            'features.*.max'      => 'نص الوظيفة طويل جداً',

            'requirements.required' => 'أدخل متطلباً واحداً على الأقل',
            'requirements.min'      => 'أدخل متطلباً واحداً على الأقل',
            'requirements.max'      => 'لا يمكن إضافة أكثر من 15 متطلباً',
            'requirements.*.distinct' => 'لا يمكن تكرار نفس المتطلب',

            'tech_stack.required' => 'أدخل تقنية واحدة على الأقل',
            'tech_stack.min'      => 'أدخل تقنية واحدة على الأقل',
            'tech_stack.max'      => 'لا يمكن إضافة أكثر من 15 تقنية',
            'tech_stack.*.distinct' => 'لا يمكن تكرار نفس التقنية',
            'tech_stack.*.max'      => 'اسم التقنية طويل جداً',

            'supervisor_id.required' => 'المشرف المقترح مطلوب',
            'supervisor_id.integer'  => 'رقم المشرف غير صحيح',
            'supervisor_id.exists'   => 'المشرف المختار غير متاح',
        ];
    }
}
