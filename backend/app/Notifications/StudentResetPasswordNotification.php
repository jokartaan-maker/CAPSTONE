<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class StudentResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $token)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = config('students.reset_password_url')
            . '?token=' . $this->token
            . '&email=' . urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('إعادة تعيين كلمة المرور — Capstone')
            ->view('emails.student.reset-password', [
                'studentName' => $notifiable->name,
                'resetUrl'    => $resetUrl,
            ]);
    }
}
