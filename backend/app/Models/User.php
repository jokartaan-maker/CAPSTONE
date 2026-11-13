<?php

namespace App\Models;

use App\Enums\RegistrationStatus;
use App\Enums\RequestedRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_STUDENT = 'student';
    public const ROLE_SUPERVISOR = 'supervisor';
    public const ROLE_COMMITTEE = 'committee';
    public const ROLE_ADMIN = 'admin';

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'is_active',
        'registration_status',
        'requested_role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /** كاش داخلي للصلاحيات حتى لا تُستعلم في كل فحص */
    private ?array $permissionCache = null;

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
            'email_verified_at' => 'datetime',
            'registration_status' => RegistrationStatus::class,
            'requested_role' => RequestedRole::class,
        ];
    }

    /* ------------------------- الأدوار والصلاحيات ------------------------- */

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    public function hasRole(string ...$roles): bool
    {
        return $this->roles->whereIn('name', $roles)->isNotEmpty();
    }

    public function permissionNames(): array
    {
        return $this->permissionCache ??= Permission::whereHas('roles.users', fn ($q) => $q->where('users.id', $this->id))
            ->pluck('name')
            ->all();
    }

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissionNames(), true);
    }

    /* ------------------------------ العلاقات ------------------------------ */

    public function teamMemberships(): HasMany
    {
        return $this->hasMany(TeamMember::class, 'student_id');
    }

    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'team_members', 'student_id', 'team_id');
    }

    public function supervisedTeams(): HasMany
    {
        return $this->hasMany(Team::class, 'supervisor_id');
    }

    public function proposedIdeas(): HasMany
    {
        return $this->hasMany(Idea::class, 'proposed_by');
    }

    public function supervisedIdeas(): HasMany
    {
        return $this->hasMany(Idea::class, 'supervisor_id');
    }

    public function assignedTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function joinRequests(): HasMany
    {
        return $this->hasMany(JoinRequest::class, 'student_id');
    }

    /** إشعارات المنصة (الاسم مختلف عن notifications() الخاصة بـ Laravel) */
    public function appNotifications(): HasMany
    {
        return $this->hasMany(AppNotification::class);
    }

    public function notificationPreferences(): HasMany
    {
        return $this->hasMany(NotificationPreference::class);
    }

    /** فريق الطالب في فصل معين */
    public function teamInTerm(int $termId): ?Team
    {
        return $this->teams()->where('teams.academic_term_id', $termId)->first();
    }
}
