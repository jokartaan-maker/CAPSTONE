<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JoinRequest extends Model
{
    protected $fillable = [
        'team_id',
        'student_id',
        'academic_term_id',
        'type',
        'status',
        'message',
        'responded_at',
    ];

    protected function casts(): array
    {
        return [
            'responded_at' => 'datetime',
        ];
    }

    // ---------- العلاقات ----------

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    // ---------- Scopes ----------

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeRequests(Builder $query): Builder
    {
        return $query->where('type', 'request');
    }

    public function scopeInvitations(Builder $query): Builder
    {
        return $query->where('type', 'invitation');
    }

    // ---------- دوال مساعدة ----------

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    // الحالة بالعربي
    public function statusLabel(): string
    {
        return [
            'pending'   => 'قيد الانتظار',
            'accepted'  => 'مقبول',
            'rejected'  => 'مرفوض',
            'cancelled' => 'ملغى',
        ][$this->status] ?? $this->status;
    }

    // إغلاق الطلب بحالة نهائية
    public function close(string $status): void
    {
        $this->update(['status' => $status, 'responded_at' => now()]);
    }
}
