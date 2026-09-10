<?php

namespace App\Services\Ocean;

use Carbon\CarbonImmutable;

final readonly class OceanConditions
{
    public function __construct(
        public CarbonImmutable $date,
        public float $waveHeightMax,
        public float $wavePeriodMax,
        public float $waveDirectionDominant,
        public float $seaSurfaceTemperatureMax,
        public float $windSpeedMax,
        public float $windDirectionDominant,
    ) {}

    /**
     * @return array{date: string, wave_height_max: float, wave_period_max: float, wave_direction_dominant: float, sea_surface_temperature_max: float, wind_speed_max: float, wind_direction_dominant: float}
     */
    public function toArray(): array
    {
        return [
            'date' => $this->date->toDateString(),
            'wave_height_max' => $this->waveHeightMax,
            'wave_period_max' => $this->wavePeriodMax,
            'wave_direction_dominant' => $this->waveDirectionDominant,
            'sea_surface_temperature_max' => $this->seaSurfaceTemperatureMax,
            'wind_speed_max' => $this->windSpeedMax,
            'wind_direction_dominant' => $this->windDirectionDominant,
        ];
    }

    /**
     * @param  array{date: string, wave_height_max: float|int, wave_period_max: float|int, wave_direction_dominant: float|int, sea_surface_temperature_max: float|int, wind_speed_max: float|int, wind_direction_dominant: float|int}  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            date: CarbonImmutable::parse($data['date']),
            waveHeightMax: (float) $data['wave_height_max'],
            wavePeriodMax: (float) $data['wave_period_max'],
            waveDirectionDominant: (float) $data['wave_direction_dominant'],
            seaSurfaceTemperatureMax: (float) $data['sea_surface_temperature_max'],
            windSpeedMax: (float) $data['wind_speed_max'],
            windDirectionDominant: (float) $data['wind_direction_dominant'],
        );
    }
}
