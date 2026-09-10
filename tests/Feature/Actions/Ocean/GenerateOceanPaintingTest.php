<?php

use App\Actions\Ocean\GenerateOceanPainting;
use App\Models\OceanPainting;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

function fakeOceanResponsesFor(string $date): void
{
    Http::fake([
        'https://marine-api.open-meteo.com/*' => Http::response([
            'daily' => [
                'time' => [$date],
                'wave_height_max' => [1.4],
                'wave_period_max' => [6.2],
                'wave_direction_dominant' => [40],
                'sea_surface_temperature_max' => [26.5],
            ],
        ]),
        'https://api.open-meteo.com/*' => Http::response([
            'daily' => [
                'time' => [$date],
                'wind_speed_10m_max' => [22.0],
                'wind_direction_10m_dominant' => [88],
            ],
        ]),
    ]);
}

test('it persists a new ocean painting for the day', function () {
    $date = CarbonImmutable::parse('2026-09-09');
    fakeOceanResponsesFor($date->toDateString());

    $painting = app(GenerateOceanPainting::class)->handle($date);

    expect(OceanPainting::count())->toBe(1)
        ->and($painting->date->toDateString())->toBe('2026-09-09')
        ->and($painting->seed)->toBe(crc32('2026-09-09'))
        ->and($painting->conditions['wave_height_max'])->toBe(1.4)
        ->and($painting->palette)->toHaveKeys(['background', 'strokes', 'foam', 'hue', 'saturation']);
});

test('re-running for the same day updates the row instead of duplicating it', function () {
    $date = CarbonImmutable::parse('2026-09-09');
    fakeOceanResponsesFor($date->toDateString());

    $action = app(GenerateOceanPainting::class);
    $first = $action->handle($date);
    $second = $action->handle($date);

    expect(OceanPainting::count())->toBe(1)
        ->and($second->id)->toBe($first->id);
});

test('different days produce different rows and seeds', function () {
    Http::fake([
        'https://marine-api.open-meteo.com/*' => Http::sequence()
            ->push(['daily' => [
                'time' => ['2026-09-09'],
                'wave_height_max' => [1.4],
                'wave_period_max' => [6.2],
                'wave_direction_dominant' => [40],
                'sea_surface_temperature_max' => [26.5],
            ]])
            ->push(['daily' => [
                'time' => ['2026-09-10'],
                'wave_height_max' => [0.5],
                'wave_period_max' => [4.0],
                'wave_direction_dominant' => [100],
                'sea_surface_temperature_max' => [25.0],
            ]]),
        'https://api.open-meteo.com/*' => Http::sequence()
            ->push(['daily' => [
                'time' => ['2026-09-09'],
                'wind_speed_10m_max' => [22.0],
                'wind_direction_10m_dominant' => [88],
            ]])
            ->push(['daily' => [
                'time' => ['2026-09-10'],
                'wind_speed_10m_max' => [10.0],
                'wind_direction_10m_dominant' => [200],
            ]]),
    ]);

    $action = app(GenerateOceanPainting::class);
    $today = $action->handle(CarbonImmutable::parse('2026-09-09'));
    $tomorrow = $action->handle(CarbonImmutable::parse('2026-09-10'));

    expect(OceanPainting::count())->toBe(2)
        ->and($today->seed)->not->toBe($tomorrow->seed);
});
