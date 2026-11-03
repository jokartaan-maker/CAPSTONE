<?php

use App\Http\Controllers\Api\Admin\RegistrationRequestController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:5,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::prefix('admin')->middleware(['auth:sanctum', 'permission:users.manage'])->group(function () {
    Route::get('registrations', [RegistrationRequestController::class, 'index']);
    Route::post('registrations/{user}/approve', [RegistrationRequestController::class, 'approve']);
    Route::post('registrations/{user}/reject', [RegistrationRequestController::class, 'reject']);
});