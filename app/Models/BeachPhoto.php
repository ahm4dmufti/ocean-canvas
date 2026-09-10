<?php

namespace App\Models;

use Database\Factories\BeachPhotoFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property Carbon $date
 * @property string $path
 * @property string|null $original_filename
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read string $url
 */
#[Fillable(['date', 'path', 'original_filename'])]
class BeachPhoto extends Model
{
    /** @use HasFactory<BeachPhotoFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $appends = ['url'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    /**
     * @return Attribute<string, never>
     */
    protected function url(): Attribute
    {
        return Attribute::make(
            get: fn () => Storage::disk('public')->url($this->path),
        );
    }
}
