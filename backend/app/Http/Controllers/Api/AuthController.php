<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $isStudent = $request->role === 'student';

        DB::transaction(function () use ($request, $isStudent) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => $request->password,
                'phone' => $request->phone,
                'is_active' => $isStudent,
                'registration_status' => $isStudent ? 'approved' : 'pending',
                'requested_role' => $request->role,
            ]);

            // الطالب فقط يحصل على دوره فوراً
            if ($isStudent) {
                $user->roles()->attach(Role::where('name', 'student')->firstOrFail()->id);
            }
        });

        return response()->json([
            'message' => $isStudent
                ? 'تم إنشاء حسابك، يمكنك تسجيل الدخول الآن'
                : 'تم استلام طلبك وهو بانتظار موافقة الإدارة',
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
            ], 401);
        }

        if (! $user->is_active) {
            $message = match ($user->registration_status) {
                'pending' => 'حسابك بانتظار موافقة الإدارة',
                'rejected' => 'تم رفض طلب تسجيلك، تواصل مع الإدارة',
                default => 'هذا الحساب معطّل، تواصل مع الإدارة',
            };

            return response()->json(['message' => $message], 403);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'message' => 'تم تسجيل الدخول بنجاح',
            'data' => [
                'token' => $token,
                'user' => new UserResource($user),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'تم تسجيل الخروج']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()),
        ]);
    }
}