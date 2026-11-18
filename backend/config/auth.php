<?php

use App\Models\Student;
use App\Models\User;

return [

    'defaults' => [
        'guard' => env('AUTH_GUARD', 'web'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'users'),
    ],

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
    ],

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => env('AUTH_MODEL', User::class),
        ],

        // مزوّد الطلاب: يخبر Laravel أين يبحث عن الطالب بالإيميل
        'students' => [
            'driver' => 'eloquent',
            'model' => Student::class,
        ],
    ],

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire' => 60,
            'throttle' => 60,
        ],

        // استعادة كلمة مرور الطلاب
        'students' => [
            'provider' => 'students',
            'table' => 'student_password_reset_tokens',
            'expire' => 30,   // الرابط صالح 30 دقيقة
            'throttle' => 60, // لا يُرسل رابط جديد لنفس الإيميل قبل 60 ثانية
        ],
    ],

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

];
