<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Team extends Model
{
    protected $fillable = [
        'name',
        'idea_id',
        'supervisor_id',
        'academic_term_id',
        'capacity',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
        ];
    }

    // ---------- العلاقات ----------

    public function idea(): BelongsTo
    {
        return $this->belongsTo(Idea::class);
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(Supervisor::class);
    }

    public function academicTerm(): BelongsTo
    {
        return $this->belongsTo(AcademicTerm::class);
    }

    // عضويات الفريق (القائد أولاً ثم حسب تاريخ الانضمام)
    public function members(): HasMany
    {
        return $this->hasMany(TeamMember::class)->orderByRaw("role = 'leader' desc")->orderBy('joined_at');
    }

    public function joinRequests(): HasMany
    {
        return $this->hasMany(JoinRequest::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function leader(): HasOne
    {
        return $this->hasOne(TeamMember::class)->where('role', 'leader');
    }

    // ---------- Scopes ----------

    public function scopeInCurrentTerm(Builder $query): Builder
    {
        return $query->whereHas('academicTerm', fn (Builder $q) => $q->where('is_current', true));
    }

    // الفرق التي فيها مكان شاغر / الممتلئة (العدّ داخل قاعدة البيانات)
    public function scopeOpen(Builder $query): Builder
    {
        return $query->whereRaw('(select count(*) from team_members where team_members.team_id = teams.id) < teams.capacity');
    }

    public function scopeFull(Builder $query): Builder
    {
        return $query->whereRaw('(select count(*) from team_members where team_members.team_id = teams.id) >= teams.capacity');
    }

    // ---------- دوال مساعدة ----------

    public function isFull(): bool
    {
        return $this->members()->count() >= $this->capacity;
    }

    public function freeSeats(): int
    {
        return max(0, $this->capacity - $this->members()->count());
    }

    // نسبة الإنجاز: المهام المنجزة ÷ كل المهام (0 إذا لا توجد مهام)
    public function progress(): int
    {
        $total = $this->tasks()->count();

        return $total === 0 ? 0 : (int) round($this->tasks()->where('status', 'done')->count() * 100 / $total);
    }

    // حالة الفريق كما يراها طالب معيّن: your_team / full / open
    // تعتمد على members المحمّلة مسبقاً، فلا تنفّذ استعلاماً إضافياً
    public function statusFor(?Student $student): string
    {
        if ($student && $this->members->contains('student_id', $student->id)) {
            return 'your_team';
        }

        return $this->members->count() >= $this->capacity ? 'full' : 'open';
    }
}
