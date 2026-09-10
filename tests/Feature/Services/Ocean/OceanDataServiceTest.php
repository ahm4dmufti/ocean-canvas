<?php

use App\Services\Ocean\OceanDataService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Http;

function fakeOceanResponses(string $date): void
{
    Http::fake([
        'https://marine-api.open-meteo.com/*' => Http::response([
            'daily' => [
                'time' => [$date],
                'wave_height_max' => [0.8],
                'wave_period_max' => [5.85],
                'wave_direction_dominant' => [26],
                'sea_surface_temperature_max' => [28.1],
            ],
        ]),
        'https://api.open-meteo.com/*' => Http::response([
            'daily' => [
                'time' => [$date],
                'wind_speed_10m_max' => [15.0],
                'wind_direction_10m_dominant' => [345],
            ],
        ]),
    ]);
}

test('it fetches and normalizes ocean conditions for a given date', function () {
    $date = CarbonImmutable::parse('2026-09-09');
    fakeOceanResponses($date->toDateString());

    $conditions = (new OceanDataService)->forDate($date);

    expect($conditions->date->toDateString())->toBe('2026-09-09')
        ->and($conditions->waveHeightMax)->toBe(0.8)
        ->and($conditions->wavePeriodMax)->toBe(5.85)
        ->and($conditions->waveDirectionDominant)->toBe(26.0)
        ->and($conditions->seaSurfaceTemperatureMax)->toBe(28.1)
        ->and($conditions->windSpeedMax)->toBe(15.0)
        ->and($conditions->windDirectionDominant)->toBe(345.0);

    Http::assertSent(fn ($request) => str_contains($request->url(), 'marine-api.open-meteo.com')
        && $request['latitude'] === 32.12
        && $request['longitude'] === 20.07);

    Http::assertSent(fn ($request) => str_contains($request->url(), 'api.open-meteo.com')
        && ! str_contains($request->url(), 'marine-api'));
});

test('it caches conditions per date and does not refetch', function () {
    $date = CarbonImmutable::parse('2026-09-09');
    fakeOceanResponses($date->toDateString());

    $service = new OceanDataService;
    $service->forDate($date);
    $service->forDate($date);

    Http::assertSentCount(2);
});

test('it throws when the upstream data has no entry for the requested date', function () {
    fakeOceanResponses('2026-09-01');

    (new OceanDataService)->forDate(CarbonImmutable::parse('2026-09-09'));
})->throws(RuntimeException::class);
