<?php

use App\Models\BeachPhoto;
use App\Models\OceanPainting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function fakeBeachOceanResponses(): void
{
    $today = now()->toDateString();

    Http::fake([
        'https://marine-api.open-meteo.com/*' => Http::response([
            'daily' => [
                'time' => [$today],
                'wave_height_max' => [0.9],
                'wave_period_max' => [5.1],
                'wave_direction_dominant' => [30],
                'sea_surface_temperature_max' => [27.0],
            ],
        ]),
        'https://api.open-meteo.com/*' => Http::response([
            'daily' => [
                'time' => [$today],
                'wind_speed_10m_max' => [18.0],
                'wind_direction_10m_dominant' => [200],
            ],
        ]),
    ]);
}

test('guests are redirected to the login page', function () {
    $response = $this->get(route('beach'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the beach page', function () {
    fakeBeachOceanResponses();

    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('beach'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('beach')
        ->has('painting.date')
        ->has('painting.seed')
        ->where('painting.conditions.wave_height_max', 0.9)
        ->has('painting.palette.background')
        ->has('paintings', 1)
        ->where('photos', [])
    );
});

test('the beach page groups uploaded photos by date', function () {
    Storage::fake('public');
    fakeBeachOceanResponses();

    $user = User::factory()->create();
    $this->actingAs($user);

    Storage::disk('public')->put('beach-photos/2026-09-01/a.jpg', 'fake');
    Storage::disk('public')->put('beach-photos/2026-09-01/b.jpg', 'fake');
    BeachPhoto::create(['date' => '2026-09-01', 'path' => 'beach-photos/2026-09-01/a.jpg', 'original_filename' => 'a.jpg']);
    BeachPhoto::create(['date' => '2026-09-01', 'path' => 'beach-photos/2026-09-01/b.jpg', 'original_filename' => 'b.jpg']);

    $response = $this->get(route('beach'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('beach')
        ->has('photos.2026-09-01', 2)
        ->where('photos.2026-09-01.0.original_filename', 'a.jpg')
    );
});

test('visiting the beach page persists today\'s painting idempotently', function () {
    fakeBeachOceanResponses();

    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('beach'))->assertOk();
    $this->get(route('beach'))->assertOk();

    expect(OceanPainting::count())->toBe(1);
});
