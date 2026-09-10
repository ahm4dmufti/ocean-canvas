<?php

namespace App\Actions\Ocean;

use App\Models\OceanPainting;
use App\Services\Ocean\OceanDataService;
use App\Services\Ocean\PaletteGenerator;
use Carbon\CarbonImmutable;

class GenerateOceanPainting
{
    public function __construct(
        private readonly OceanDataService $oceanData,
        private readonly PaletteGenerator $paletteGenerator,
    ) {}

    /**
     * Fetch, derive, and persist the ocean painting for a given day.
     *
     * Safe to call repeatedly: the row is keyed by date, so re-running for a
     * day that's already been generated updates it in place instead of
     * creating a duplicate.
     */
    public function handle(?CarbonImmutable $date = null): OceanPainting
    {
        $conditions = $this->oceanData->forDate($date);
        $dateString = $conditions->date->toDateString();

        $attributes = [
            'date' => $dateString,
            'seed' => crc32($dateString),
            'conditions' => $conditions->toArray(),
            'palette' => $this->paletteGenerator->generate($conditions),
        ];

        $painting = OceanPainting::whereDate('date', $dateString)->first();

        if ($painting) {
            $painting->update($attributes);

            return $painting;
        }

        return OceanPainting::create($attributes);
    }
}
