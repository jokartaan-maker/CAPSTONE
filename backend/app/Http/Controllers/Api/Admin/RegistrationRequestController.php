<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class RegistrationRequestController extends Controller
{
    // الدور المطلوب عند التسجيل -> الدور الفعلي في النظام
    private const ROLE_MAP = [
        'student' => 'student',
        'supervisor' => 'supervisor',
        'committee' => 'admin',
    ];

    public function index(): JsonResponse
    {
        $requests = User::where('registration_status', 'pending')
            ->orderBy('created_at')
            ->paginate(20)
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'requested_role' => $user->requested_role,
                'created_at' => $user->created_at,
            ]);

        return response()->json($requests);
    }

    public function approve(User $user): JsonResponse
    {
        if ($user->registration_status !== 'pending') {
            return response()->json(['message' => 'هذا الطلب ليس قيد الانتظار'], 422);
        }

        $roleName = self::ROLE_MAP[$user->requested_role] ?? null;

        if (! $roleName) {
            return response()->json(['message' => 'الدور المطلوب غير معروف'], 422);
        }

        DB::transaction(function () use ($user, $roleName) {
            $user->update([
                'is_active' => true,
                'registration_status' => 'approved',
            ]);

            $user->roles()->syncWithoutDetaching([
                Role::where('name', $roleName)->firstOrFail()->id,
            ]);
        });

        return response()->json(['message' => 'تمت الموافقة على الحساب']);
    }

    public function reject(User $user): JsonResponse
    {
        if ($user->registration_status !== 'pending') {
            return response()->json(['message' => 'هذا الطلب ليس قيد الانتظار'], 422);
        }

        $user->update(['registration_status' => 'rejected']);

        return response()->json(['message' => 'تم رفض الطلب']);
    }
}