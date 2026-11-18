<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Laravel\Sanctum\Exceptions\MissingAbilityException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'abilities' => \Laravel\Sanctum\Http\Middleware\CheckAbilities::class,
            'ability'   => \Laravel\Sanctum\Http\Middleware\CheckForAnyAbility::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // كل أخطاء الـ API ترجع JSON
        $exceptions->shouldRenderJsonWhen(
            fn ($request) => $request->is('api/*')
        );

        // 429: محاولات كثيرة
        $exceptions->render(function (ThrottleRequestsException $e, $request) {
            if ($request->is('api/*')) {
                $seconds = $e->getHeaders()['Retry-After'] ?? 60;

                return response()->json([
                    'message' => "محاولات كثيرة، حاول مرة أخرى بعد {$seconds} ثانية",
                ], 429, $e->getHeaders());
            }
        });

        // 401: لا يوجد token، أو مزيّف، أو منتهي الصلاحية
        $exceptions->render(function (AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'غير مصرّح، يرجى تسجيل الدخول',
                ], 401);
            }
        });

        // 403: الـ token صحيح لكنه لا يملك الصلاحية (مثلاً token مشرف على رابط طالب)
        $exceptions->render(function (MissingAbilityException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'ليس لديك صلاحية للوصول إلى هذا المورد',
                ], 403);
            }
        });
    })
    ->create();



