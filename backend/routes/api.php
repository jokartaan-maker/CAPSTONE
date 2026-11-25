<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Student\AuthController;
use App\Http\Controllers\Api\Student\IdeaController;
use App\Http\Controllers\Api\Student\JoinRequestController;
use App\Http\Controllers\Api\Student\PasswordResetController;
use App\Http\Controllers\Api\Student\ProfileController;
use App\Http\Controllers\Api\Student\SupervisorController;
use App\Http\Controllers\Api\Student\TeamController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('student')->group(function () {
    // عام: أي زائر
    Route::get('register-options', [AuthController::class, 'registerOptions']);

    Route::post('register', [AuthController::class, 'register'])
        ->middleware('throttle:5,1');

    Route::post('login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1');

    Route::post('forgot-password', [PasswordResetController::class, 'forgot'])
        ->middleware('throttle:5,1');

    Route::post('verify-otp', [PasswordResetController::class, 'verifyOtp'])
        ->middleware('throttle:10,1');

    Route::post('reset-password', [PasswordResetController::class, 'reset'])
        ->middleware('throttle:5,1');

    // محمي: يحتاج token طالب صالح
    Route::middleware(['auth:sanctum', 'abilities:student'])->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);

        // الملف الشخصي
        Route::get('profile', [ProfileController::class, 'show']);
        Route::patch('profile', [ProfileController::class, 'update']);
        Route::put('profile/password', [ProfileController::class, 'changePassword'])
            ->middleware('throttle:5,1');

        // بنك الأفكار
        Route::get('ideas', [IdeaController::class, 'index']);
        Route::get('ideas/{id}', [IdeaController::class, 'show'])->whereNumber('id');

        // اقتراح فكرة
        Route::get('supervisors', [SupervisorController::class, 'index']);
        Route::post('ideas', [IdeaController::class, 'store'])->middleware('throttle:10,1');
        Route::get('my-ideas', [IdeaController::class, 'myIdeas']);

        // الفرق
        Route::get('teams/explore', [TeamController::class, 'explore']);
        Route::post('teams', [TeamController::class, 'store'])->middleware('throttle:10,1');

        // طلبات الانضمام والدعوات
        Route::post('teams/{id}/join-requests', [JoinRequestController::class, 'send'])
            ->whereNumber('id')->middleware('throttle:10,1');
        Route::get('my-join-requests', [JoinRequestController::class, 'mine']);

        Route::get('students/available', [JoinRequestController::class, 'availableStudents']);
        Route::post('team/invitations', [JoinRequestController::class, 'invite'])->middleware('throttle:10,1');
        Route::get('team/join-requests', [JoinRequestController::class, 'teamRequests']);

        Route::post('join-requests/{id}/accept', [JoinRequestController::class, 'accept'])->whereNumber('id');
        Route::post('join-requests/{id}/reject', [JoinRequestController::class, 'reject'])->whereNumber('id');
        Route::delete('join-requests/{id}', [JoinRequestController::class, 'cancel'])->whereNumber('id');
    });
});
