<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

// رفع ملف تسليم (multipart/form-data): file + notes اختيارية
class StoreSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $extensions = implode(',', config('students.submission_extensions'));

        return [
            'file'  => [
                'required',
                'file',
                'extensions:' . $extensions,   // امتداد اسم الملف
                'mimes:' . $extensions,        // النوع الحقيقي من محتوى الملف
                'max:' . config('students.submission_max_kb'),
            ],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        $types = implode(', ', array_map('strtoupper', config('students.submission_extensions')));
        $maxMb = config('students.submission_max_kb') / 1024;

        return [
            'file.required'   => 'يجب اختيار ملف التسليم',
            'file.file'       => 'فشل رفع الملف، حاول مرة أخرى',
            'file.uploaded'   => 'فشل رفع الملف، قد يكون حجمه أكبر من المسموح',
            'file.extensions' => "نوع الملف غير مسموح، الأنواع المسموحة: {$types}",
            'file.mimes'      => "محتوى الملف لا يطابق نوعه، الأنواع المسموحة: {$types}",
            'file.max'        => "حجم الملف يجب ألا يزيد عن {$maxMb} MB",
            'notes.max'       => 'الملاحظة يجب ألا تزيد عن 1000 حرف',
        ];
    }
}
