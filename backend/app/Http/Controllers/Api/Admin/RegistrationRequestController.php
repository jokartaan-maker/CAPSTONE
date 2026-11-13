<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\RegistrationStatus;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** UC-47: الموافقة على طلبات تسجيل المشرفين وأعضاء اللجنة العلمية */
class RegistrationRequestController extends Controller
{
    public function index(): JsonResponse
    {
        $requests = User::where('registration_status', RegistrationStatus::Pending)
            ->orderBy('created_at')
            ->paginate(20)
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'requested_role' => $user->requested_role?->value,
                'requested_role_label' => $user->requested_role?->label(),
                'created_at' => $user->created_at,
            ]);

        return response()->json($requests);
    }

    public function approve(User $user): JsonResponse
    {
        if ($user->registration_status !== RegistrationStatus::Pending) {
            return response()->json(['message' => 'هذا الطلب ليس قيد الانتظار'], 422);
        }

        // الدور المطلوب يطابق اسم الدور في جدول roles مباشرة: student / supervisor / committee
        $role = Role::where('name', $user->requested_role?->value)->first();

        if (! $role) {
            return response()->json(['message' => 'الدور المطلوب غير معروف'], 422);
        }

        DB::transaction(function () use ($user, $role) {
            $user->update([
                'is_active' => true,
                'registration_status' => RegistrationStatus::Approved,
            ]);

            $user->roles()->syncWithoutDetaching([$role->id]);

            AuditLog::record('registration.approved', $user, ['registration_status' => 'pending'], ['registration_status' => 'approved', 'role' => $role->name]);
        });

        return response()->json(['message' => 'تمت الموافقة على الحساب']);
    }

    public function reject(Request $request, User $user): JsonResponse
    {
        $data = $request->validate(['reason' => ['required', 'string', 'max:500']]);

        if ($user->registration_status !== RegistrationStatus::Pending) {
            return response()->json(['message' => 'هذا الطلب ليس قيد الانتظار'], 422);
        }

        DB::transaction(function () use ($user, $data) {
            $user->update(['registration_status' => RegistrationStatus::Rejected]);

            AuditLog::record('registration.rejected', $user, ['registration_status' => 'pending'], ['registration_status' => 'rejected', 'reason' => $data['reason']]);
        });

        return response()->json(['message' => 'تم رفض الطلب']);
    }
}
