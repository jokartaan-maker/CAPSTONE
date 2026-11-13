<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemSetting extends Model
{
    const CREATED_AT = null;

    protected $fillable = [
        'updated_by',
        'group',
        'name',
        'value',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'array',
        ];
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /** قراءة إعداد بالاسم مع قيمة افتراضية */
    public static function get(string $name, mixed $default = null): mixed
    {
        return static::where('name', $name)->value('value') ?? $default;
    }
}
