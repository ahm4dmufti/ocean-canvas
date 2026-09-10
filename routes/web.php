<?php

use App\Http\Controllers\BeachController;
use App\Http\Controllers\BeachPhotoController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('beach', [BeachController::class, 'show'])->name('beach');
    Route::post('beach/photos', [BeachPhotoController::class, 'store'])->name('beach.photos.store');
    Route::delete('beach/photos/{beachPhoto}', [BeachPhotoController::class, 'destroy'])->name('beach.photos.destroy');
});

require __DIR__.'/settings.php';
