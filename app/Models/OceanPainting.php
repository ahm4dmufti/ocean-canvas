<?php

namespace App\Models;

use Database\Factories\OceanPaintingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property Carbon $date
 * @property int $seed
 * @property array<string, mixed> $conditions
 * @property array<string, mixed> $palette
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['date', 'seed', 'conditions', 'palette'])]
class OceanPainting extends Model
{
    /** @use HasFactory<OceanPaintingFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'conditions' => 'array',
            'palette' => 'array',
        ];
    }
}
