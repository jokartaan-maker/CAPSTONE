<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StudentPasswordChangedNotification extends Notification
{
    // true: التغيير من داخل الحساب (يبقى الجهاز الحالي داخلاً)
    // false: التغيير عبر رابط "نسيت كلمة المرور" (خروج من كل الأجهزة)
    public function __construct(public bool $keptCurrentDevice = false)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $devicesLine = $this->keptCurrentDevice
            ? 'تم تسجيل خروجك من جميع الأجهزة الأخرى، ويبقى الجهاز الذي غيّرت منه كلمة المرور داخلاً.'
            : 'تم تسجيل خروجك من جميع الأجهزة، وتحتاج إلى تسجيل الدخول من جديد بكلمة المرور الجديدة.';

        return (new MailMessage)
            ->subject('تنبيه أمني: تم تغيير كلمة المرور')
            ->greeting('مرحباً ' . $notifiable->name)
            ->line('تم تغيير كلمة المرور لحسابك بنجاح بتاريخ ' . now()->timezone('Asia/Damascus')->format('Y-m-d H:i') . '.')
            ->line($devicesLine)
            ->line('إذا لم تقم بهذا التغيير، تواصل مع إدارة النظام فوراً.')
            ->salutation('نظام إدارة مشاريع التخرج');
    }
}
