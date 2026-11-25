<?php

namespace App\Models;

use App\Notifications\StudentResetPasswordNotification;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Student extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'university_number',
        'major',
        'study_year',
        'skills',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password'          => 'hashed',
            'skills'            => 'array',
            'study_year'        => 'integer',
            'is_active'         => 'boolean',
            'email_verified_at' => 'datetime',
        ];
    }

    // إيميل "نسيت كلمة المرور" الخاص بالطلاب (بالعربي ورابط React)
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new StudentResetPasswordNotification($token));
    }

    // كل عضويات الطالب في الفرق (عبر كل الفصول)
    public function teamMemberships(): HasMany
    {
        return $this->hasMany(TeamMember::class);
    }

    // عضوية الطالب في فصل معيّن، أو null إن لم يكن في فريق
    public function membershipInTerm(int $termId): ?TeamMember
    {
        return $this->teamMemberships()->where('academic_term_id', $termId)->first();
    }

    public function joinRequests(): HasMany
    {
        return $this->hasMany(JoinRequest::class);
    }

    // الفريق الذي يقوده الطالب في فصل معيّن، أو null إن لم يكن قائداً
    public function ledTeamInTerm(int $termId): ?Team
    {
        return $this->teamMemberships()
            ->where('academic_term_id', $termId)
            ->where('role', 'leader')
            ->first()
            ?->team;
    }
}
