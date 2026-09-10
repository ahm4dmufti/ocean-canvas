<?php

use App\Models\BeachPhoto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('guests cannot upload a photo', function () {
    $response = $this->post(route('beach.photos.store'), [
        'date' => '2026-09-09',
        'photo' => UploadedFile::fake()->create('beach.jpg', 100, 'image/jpeg'),
    ]);

    $response->assertRedirect(route('login'));
});

test('authenticated users can upload a photo for a day', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('beach.photos.store'), [
        'date' => '2026-09-09',
        'photo' => UploadedFile::fake()->create('beach.jpg', 100, 'image/jpeg'),
    ]);

    $response->assertRedirect();

    expect(BeachPhoto::count())->toBe(1);

    $photo = BeachPhoto::first();
    expect($photo->date->toDateString())->toBe('2026-09-09')
        ->and($photo->original_filename)->toBe('beach.jpg');

    Storage::disk('public')->assertExists($photo->path);
});

test('multiple photos can be uploaded for the same day', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $this->actingAs($user);

    $this->post(route('beach.photos.store'), [
        'date' => '2026-09-09',
        'photo' => UploadedFile::fake()->create('first.jpg', 100, 'image/jpeg'),
    ]);
    $this->post(route('beach.photos.store'), [
        'date' => '2026-09-09',
        'photo' => UploadedFile::fake()->create('second.jpg', 100, 'image/jpeg'),
    ]);

    expect(BeachPhoto::whereDate('date', '2026-09-09')->count())->toBe(2);
});

test('upload requires a valid date and an image file', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->post(route('beach.photos.store'), [
        'date' => 'not-a-date',
        'photo' => UploadedFile::fake()->create('not-an-image.txt', 10),
    ]);

    $response->assertSessionHasErrors(['date', 'photo']);
    expect(BeachPhoto::count())->toBe(0);
});

test('authenticated users can delete a photo', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $this->actingAs($user);

    Storage::disk('public')->put('beach-photos/2026-09-09/test.jpg', 'fake-content');
    $photo = BeachPhoto::create([
        'date' => '2026-09-09',
        'path' => 'beach-photos/2026-09-09/test.jpg',
        'original_filename' => 'test.jpg',
    ]);

    $response = $this->delete(route('beach.photos.destroy', $photo));

    $response->assertRedirect();
    expect(BeachPhoto::count())->toBe(0);
    Storage::disk('public')->assertMissing('beach-photos/2026-09-09/test.jpg');
});

test('guests cannot delete a photo', function () {
    Storage::fake('public');

    $photo = BeachPhoto::create([
        'date' => '2026-09-09',
        'path' => 'beach-photos/2026-09-09/test.jpg',
        'original_filename' => 'test.jpg',
    ]);

    $response = $this->delete(route('beach.photos.destroy', $photo));

    $response->assertRedirect(route('login'));
    expect(BeachPhoto::count())->toBe(1);
});
