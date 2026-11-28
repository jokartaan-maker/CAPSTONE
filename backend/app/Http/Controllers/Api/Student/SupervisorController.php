<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Supervisor;
use Illuminate\Http\JsonResponse;

class SupervisorController extends Controller
{
    // GET /api/student/supervisors
    // المشرفون المعتمدون والمفعّلون، لقائمة "المشرف المقترح"
    public function index(): JsonResponse
    {
        $supervisors = Supervisor::query()
            ->where('registration_status', 'approved')
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (Supervisor $s) => [
                'id'             => $s->id,
                'name'           => $s->name,
                'academic_title' => $s->academicTitleLabel(),
                'department'     => $s->department,
                'specialization' => $s->specialization,
            ]);

        return response()->json([
            'supervisors' => $supervisors,
        ]);
    }
}
