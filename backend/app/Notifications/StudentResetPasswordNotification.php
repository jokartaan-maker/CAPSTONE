<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StudentResetPasswordNotification extends Notification
{
    public function __construct(public string $token)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = config('students.reset_password_url')
            . '?token=' . $this->token
            . '&email=' . urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('إعادة تعيين كلمة المرور')
            ->greeting('مرحباً ' . $notifiable->name)
            ->line('وصلنا طلب لإعادة تعيين كلمة المرور لحسابك.')
            ->action('تعيين كلمة مرور جديدة', $url)
            ->line('هذا الرابط صالح لمدة 30 دقيقة ويُستخدم مرة واحدة فقط.')
            ->line('إذا لم تطلب ذلك، تجاهل هذه الرسالة وكلمة مرورك لن تتغير.')
            ->salutation('نظام إدارة مشاريع التخرج');
    }
}
