<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\LoginRequest;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {

        $data = $request->validated();

        $student = Student::where('email', $data['email'])->first();

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


        $expiresAt = $request->boolean('remember')
            ? now()->addDays(30)
            : now()->addDay();

        $token = $student->createToken('student-login', ['student'], $expiresAt);


        return response()->json([
            'message'    => 'تم تسجيل الدخول بنجاح',
            'token'      => $token->plainTextToken,
            'expires_at' => $expiresAt->toIso8601String(),
            'student'    => $student->only([
                'id', 'name', 'email', 'phone',
                'university_number', 'major', 'study_year', 'skills',
            ]),
        ]);
    }
}

