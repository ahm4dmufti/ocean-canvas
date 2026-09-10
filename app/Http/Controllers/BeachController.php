<?php

namespace App\Http\Controllers;

use App\Actions\Ocean\GenerateOceanPainting;
use App\Models\BeachPhoto;
use App\Models\OceanPainting;
use Inertia\Inertia;
use Inertia\Response;

class BeachController extends Controller
{
    /**
     * Show today's ocean painting, the full painting history, and the
     * photo gallery grouped by day.
     */
    public function show(GenerateOceanPainting $action): Response
    {
        $painting = $action->handle();

        return Inertia::render('beach', [
            'painting' => [
                'date' => $painting->date->toDateString(),
                'seed' => $painting->seed,
                'conditions' => $painting->conditions,
                'palette' => $painting->palette,
            ],
            'paintings' => OceanPainting::query()
                ->orderByDesc('date')
                ->get()
                ->map(fn (OceanPainting $item) => [
                    'date' => $item->date->toDateString(),
                    'seed' => $item->seed,
                    'conditions' => $item->conditions,
                    'palette' => $item->palette,
                ])
                ->values(),
            'photos' => $this->photosByDate(),
        ]);
    }

    /**
     * @return array<string, list<array{id: int, url: string, original_filename: string|null}>>
     */
    private function photosByDate(): array
    {
        $photosByDate = [];

        foreach (BeachPhoto::query()->orderBy('date')->orderBy('id')->get() as $photo) {
            $photosByDate[$photo->date->toDateString()][] = [
                'id' => $photo->id,
                'url' => $photo->url,
                'original_filename' => $photo->original_filename,
            ];
        }

        return $photosByDate;
    }
}
