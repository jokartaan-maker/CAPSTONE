<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\ChangePasswordRequest;
use App\Http\Requests\Student\UpdateProfileRequest;
use App\Models\Student;
use App\Notifications\StudentPasswordChangedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    // GET /api/student/profile
    public function show(): JsonResponse
    {
        return response()->json([
            'student' => $this->profileData(request()->user()),
        ]);
    }

    // PATCH /api/student/profile
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $student = $request->user();

        // فقط الحقول المسموح بها (name, phone, study_year, skills)
        $student->update($request->validated());

        return response()->json([
            'message' => 'تم تحديث الملف الشخصي بنجاح',
            'student' => $this->profileData($student->fresh()),
        ]);
    }

    // PUT /api/student/profile/password
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $student = $request->user();
        $data    = $request->validated();

        // 1) التحقق من كلمة المرور الحالية
        if (! Hash::check($data['current_password'], $student->password)) {
            return response()->json([
                'message' => 'كلمة المرور الحالية غير صحيحة',
                'errors'  => ['current_password' => ['كلمة المرور الحالية غير صحيحة']],
            ], 422);
        }

        // 2) حفظ كلمة المرور الجديدة (تُشفَّر تلقائياً)
        $student->update(['password' => $data['password']]);

        // 3) خروج من كل الأجهزة الأخرى، ويبقى هذا الجهاز داخلاً
        $currentTokenId = $student->currentAccessToken()->id;
        $student->tokens()->where('id', '!=', $currentTokenId)->delete();

        // 4) إيميل التنبيه الأمني
        $student->notify(new StudentPasswordChangedNotification(keptCurrentDevice: true));

        return response()->json([
            'message' => 'تم تغيير كلمة المرور بنجاح، وتم تسجيل الخروج من الأجهزة الأخرى',
        ]);
    }

    private function profileData(Student $student): array
    {
        return [
            'id'                => $student->id,
            'name'              => $student->name,
            'email'             => $student->email,
            'phone'             => $student->phone,
            'university_number' => $student->university_number,
            'major'             => $student->major,
            'study_year'        => $student->study_year,
            'skills'            => $student->skills ?? [],
            'member_since'      => $student->created_at?->toDateString(),
        ];
    }
}
