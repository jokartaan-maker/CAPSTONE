<?php

namespace App\Http\Requests\Student;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TaskIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status'   => ['nullable', Rule::in(Task::STATUSES)],
            // me = مهامي، none = بلا مسؤول، أو رقم عضو
            'assignee' => ['nullable', 'string', 'regex:/^(me|none|\d+)$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.in'      => 'الحالة يجب أن تكون todo أو in_progress أو done',
            'assignee.regex' => 'قيمة assignee يجب أن تكون me أو none أو رقم عضو',
        ];
    }
}
