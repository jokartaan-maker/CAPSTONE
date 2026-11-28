<?php

namespace App\Http\Requests\Student;

use App\Models\AcademicTerm;
use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

// إنشاء مهمة (قائد الفريق)
class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'title'       => is_string($this->title) ? trim($this->title) : $this->title,
            'description' => is_string($this->description) && trim($this->description) !== '' ? trim($this->description) : null,
        ]);
    }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'min:3', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            // المسؤول يجب أن يكون عضواً في فريق الطالب نفسه
            'assigned_to' => ['nullable', 'integer', Rule::exists('team_members', 'student_id')->where('team_id', $this->myTeamId())],
            'priority'    => ['nullable', Rule::in(Task::PRIORITIES)],
            'due_date'    => ['nullable', 'date', 'after_or_equal:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'          => 'عنوان المهمة مطلوب',
            'title.min'               => 'عنوان المهمة يجب ألا يقل عن 3 أحرف',
            'title.max'               => 'عنوان المهمة يجب ألا يزيد عن 150 حرفاً',
            'description.max'         => 'الوصف يجب ألا يزيد عن 2000 حرف',
            'assigned_to.integer'     => 'رقم العضو غير صالح',
            'assigned_to.exists'      => 'العضو المسؤول ليس من أعضاء فريقك',
            'priority.in'             => 'الأولوية يجب أن تكون low أو medium أو high',
            'due_date.date'           => 'تاريخ التسليم غير صالح',
            'due_date.after_or_equal' => 'تاريخ التسليم يجب أن يكون اليوم أو بعده',
        ];
    }

    // رقم فريق الطالب في الفصل الحالي
    protected function myTeamId(): ?int
    {
        $term = AcademicTerm::current();

        return $term ? $this->user()->membershipInTerm($term->id)?->team_id : null;
    }
}
