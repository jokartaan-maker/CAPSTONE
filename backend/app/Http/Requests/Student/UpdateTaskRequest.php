<?php

namespace App\Http\Requests\Student;

use App\Models\Task;
use Illuminate\Validation\Rule;

// تعديل مهمة (قائد الفريق): كل الحقول اختيارية، يُعدَّل ما يُرسل فقط
class UpdateTaskRequest extends StoreTaskRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->has('title') && is_string($this->title)) {
            $this->merge(['title' => trim($this->title)]);
        }

        if ($this->has('description')) {
            $this->merge([
                'description' => is_string($this->description) && trim($this->description) !== '' ? trim($this->description) : null,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'title'       => ['sometimes', 'required', 'string', 'min:3', 'max:150'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'assigned_to' => ['sometimes', 'nullable', 'integer', Rule::exists('team_members', 'student_id')->where('team_id', $this->myTeamId())],
            'priority'    => ['sometimes', 'required', Rule::in(Task::PRIORITIES)],
            'due_date'    => ['sometimes', 'nullable', 'date', 'after_or_equal:today'],
        ];
    }
}
