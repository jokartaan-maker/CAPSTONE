<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Supervisor extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'academic_title',
        'department',
        'specialization',
        'max_teams',
        'registration_status',
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
            'max_teams'         => 'integer',
            'is_active'         => 'boolean',
            'email_verified_at' => 'datetime',
        ];
    }

    // اللقب بالعربي: professor => أستاذ
    public function academicTitleLabel(): string
    {
        return config('staff.academic_titles')[$this->academic_title] ?? $this->academic_title;
    }

    public function ideas(): HasMany
    {
        return $this->hasMany(Idea::class);
    }

    public function teams(): HasMany
    {
        return $this->hasMany(Team::class);
    }

    // عدد فرق المشرف في فصل معيّن (للتحقق من max_teams)
    public function teamsCountInTerm(int $termId): int
    {
        return $this->teams()->where('academic_term_id', $termId)->count();
    }
}
