<?php

namespace App\Services\Ocean;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class OceanDataService
{
    private const LATITUDE = 32.12;

    private const LONGITUDE = 20.07;

    private const TIMEZONE = 'Africa/Tripoli';

    private const MARINE_ENDPOINT = 'https://marine-api.open-meteo.com/v1/marine';

    private const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

    /**
     * Fetch the normalized ocean conditions for a given day, cached for an hour.
     */
    public function forDate(?CarbonImmutable $date = null): OceanConditions
    {
        $date = ($date ?? CarbonImmutable::now(self::TIMEZONE))->startOfDay();

        // Cache the plain array, not the DTO: the default cache config disallows
        // unserializing arbitrary objects (config/cache.php serializable_classes).
        $data = Cache::remember(
            "ocean-conditions:{$date->toDateString()}",
            now()->addHour(),
            fn () => $this->fetch($date)->toArray(),
        );

        return OceanConditions::fromArray($data);
    }

    private function fetch(CarbonImmutable $date): OceanConditions
    {
        $marine = $this->fetchDaily(self::MARINE_ENDPOINT, [
            'daily' => 'wave_height_max,wave_period_max,wave_direction_dominant,sea_surface_temperature_max',
        ]);

        $wind = $this->fetchDaily(self::FORECAST_ENDPOINT, [
            'daily' => 'wind_speed_10m_max,wind_direction_10m_dominant',
        ]);

        $marineIndex = $this->indexForDate($marine, $date);
        $windIndex = $this->indexForDate($wind, $date);

        return new OceanConditions(
            date: $date,
            waveHeightMax: (float) $marine['wave_height_max'][$marineIndex],
            wavePeriodMax: (float) $marine['wave_period_max'][$marineIndex],
            waveDirectionDominant: (float) $marine['wave_direction_dominant'][$marineIndex],
            seaSurfaceTemperatureMax: (float) $marine['sea_surface_temperature_max'][$marineIndex],
            windSpeedMax: (float) $wind['wind_speed_10m_max'][$windIndex],
            windDirectionDominant: (float) $wind['wind_direction_10m_dominant'][$windIndex],
        );
    }

    /**
     * @param  array<string, string>  $params
     * @return array<string, array<int, int|float|string>>
     */
    private function fetchDaily(string $endpoint, array $params): array
    {
        return Http::get($endpoint, [
            ...$params,
            'latitude' => self::LATITUDE,
            'longitude' => self::LONGITUDE,
            'timezone' => 'auto',
        ])->throw()->json('daily');
    }

    /**
     * @param  array<string, array<int, int|float|string>>  $daily
     */
    private function indexForDate(array $daily, CarbonImmutable $date): int
    {
        $index = array_search($date->toDateString(), $daily['time'], strict: true);

        if ($index === false) {
            throw new RuntimeException("No ocean data available for {$date->toDateString()}.");
        }

        return $index;
    }
}
