<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StudentPasswordChangedNotification extends Notification
{
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('تنبيه أمني: تم تغيير كلمة المرور')
            ->greeting('مرحباً ' . $notifiable->name)
            ->line('تم تغيير كلمة المرور لحسابك بنجاح بتاريخ ' . now()->timezone('Asia/Damascus')->format('Y-m-d H:i') . '.')
            ->line('تم تسجيل خروجك من جميع الأجهزة، وتحتاج إلى تسجيل الدخول من جديد بكلمة المرور الجديدة.')
            ->line('إذا لم تقم بهذا التغيير، تواصل مع إدارة النظام فوراً.')
            ->salutation('نظام إدارة مشاريع التخرج');
    }
}
