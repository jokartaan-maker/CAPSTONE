<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\LoginRequest;
use App\Http\Requests\Student\RegisterRequest;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // GET /api/student/register-options
    public function registerOptions(): JsonResponse
    {
        return response()->json([
            'majors'      => config('students.majors'),
            'study_years' => config('students.study_years'),
            'max_skills'  => config('students.max_skills'),
        ]);
    }

    // POST /api/student/register
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $student = Student::create([
            'name'              => $data['name'],
            'email'             => $data['email'],
            'password'          => $data['password'], // يُشفَّر تلقائياً (cast: hashed)
            'university_number' => $data['university_number'],
            'major'             => $data['major'],
            'study_year'        => $data['study_year'],
            'skills'            => $data['skills'] ?? [],
        ]);

        // دخول تلقائي بعد التسجيل
        return $this->tokenResponse($student, false, 'تم إنشاء الحساب بنجاح', 201);
    }

    // POST /api/student/login
    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();

        $student = Student::where('email', strtolower(trim($data['email'])))->first();

        if (! $student || ! Hash::check($data['password'], $student->password)) {
            return response()->json([
                'message' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
            ], 401);
        }

        if (! $student->is_active) {
            return response()->json([
                'message' => 'الحساب معطّل، يرجى مراجعة الإدارة',
            ], 403);
        }

        return $this->tokenResponse($student, $request->boolean('remember'), 'تم تسجيل الدخول بنجاح');
    }

    // GET /api/student/me
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'student' => $this->studentData($request->user()),
        ]);
    }

    // POST /api/student/logout
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'تم تسجيل الخروج بنجاح',
        ]);
    }

    // ---------- دوال مساعدة ----------

    private function tokenResponse(Student $student, bool $remember, string $message, int $status = 200): JsonResponse
    {
        $expiresAt = $remember ? now()->addDays(30) : now()->addDay();

        $token = $student->createToken('student-login', ['student'], $expiresAt);

        return response()->json([
            'message'    => $message,
            'token'      => $token->plainTextToken,
            'expires_at' => $expiresAt->toIso8601String(),
            'student'    => $this->studentData($student),
        ], $status);
    }

    private function studentData(Student $student): array
    {
        return $student->only([
            'id', 'name', 'email', 'phone',
            'university_number', 'major', 'study_year', 'skills',
        ]);
    }
}
