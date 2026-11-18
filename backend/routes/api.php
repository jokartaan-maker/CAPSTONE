<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Student\AuthController;

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

    // محمي: يحتاج token طالب صالح
    Route::middleware(['auth:sanctum', 'abilities:student'])->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});
