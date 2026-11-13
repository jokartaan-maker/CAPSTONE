<?php

/*
| القيم الافتراضية لقواعد العمل في المنصة.
| تُنسخ إلى جدول system_settings عند التشغيل الأول (SystemSettingsSeeder)،
| ثم يمكن تعديلها من لوحة الإدارة / اللجنة دون تعديل الكود.
| للقراءة استخدم: Settings::get('files.max_size_mb')
*/

return [

    'teams' => [
        'max_members' => 5,                // الحد الأقصى لأعضاء الفريق (UC-08، UC-42)
        'supervisor_max_teams' => 6,       // الحد الأقصى لفرق المشرف الواحد (UC-17، UC-37)
    ],

    'files' => [
        'max_size_mb' => 20,               // NFR-02
        'allowed_extensions' => ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'zip', 'rar', 'png', 'jpg', 'jpeg'],
        'disk' => 'local',                 // storage/app/private — خارج المجلد العام
    ],

    'submissions' => [
        'late_policy' => 'mark_late',      // mark_late: يُقبل ويُعلَّم متأخرًا | block: يُرفض بعد الموعد (UC-13 A1)
    ],

    'reminders' => [
        'hours_before' => [48, 24],        // نوافذ تذكير المواعيد النهائية (UC-05)
    ],

    'discussions' => [
        'default_duration_minutes' => 30,
    ],

    'similarity' => [
        // قيم أولية تُضبط بعد تجربة التحقق (3-5-7) من شاشة إعدادات التشابه (UC-32)
        'semantic_threshold' => 0.80,
        'lexical_threshold' => 0.60,
        'top_k' => 5,
        'model' => 'paraphrase-multilingual-MiniLM-L12-v2',
        'service_url' => env('EMBEDDING_SERVICE_URL', 'http://127.0.0.1:8001'),
        'service_timeout' => 5,
    ],

    'auth' => [
        'reset_token_minutes' => 60,
    ],
];
