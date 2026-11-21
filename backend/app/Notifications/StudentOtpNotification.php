<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class StudentOtpNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $otp)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('رمز التحقق لاستعادة كلمة المرور — Capstone')
            ->view('emails.student.otp', [
                'studentName' => $notifiable->name,
                'otp'         => $this->otp,
            ]);
    }
}
