<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\LoginRequest;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        // 1) البيانات بعد نجاح الفحص
        $data = $request->validated();

        // 2) البحث عن الطالب بالإيميل
        $student = Student::where('email', $data['email'])->first();

        // 3) الطالب غير موجود أو كلمة المرور خاطئة → نفس الرسالة
        if (! $student || ! Hash::check($data['password'], $student->password)) {
            return response()->json([
                'message' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
            ], 401);
        }

        // 4) الحساب معطّل
        if (! $student->is_active) {
            return response()->json([
                'message' => 'الحساب معطّل، يرجى مراجعة الإدارة',
            ], 403);
        }

        // 5) مدة الـ token: 30 يوم مع "تذكّرني"، يوم واحد بدونها
        $expiresAt = $request->boolean('remember')
            ? now()->addDays(30)
            : now()->addDay();

        $token = $student->createToken('student-login', ['student'], $expiresAt);

        // 6) الرد
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

    public function me(Request $request): JsonResponse
    {
        $student = $request->user();

        return response()->json([
            'student' => $student->only([
                'id', 'name', 'email', 'phone',
                'university_number', 'major', 'study_year', 'skills',
            ]),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'تم تسجيل الخروج بنجاح',
        ]);
    }
}
