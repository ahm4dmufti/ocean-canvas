<?php

namespace App\Http\Controllers;

use App\Models\BeachPhoto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BeachPhotoController extends Controller
{
    /**
     * Upload a photo for a given day.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'photo' => ['required', 'image', 'max:10240'],
        ]);

        $photo = $request->file('photo');
        $path = $photo->storeAs(
            'beach-photos/'.$validated['date'],
            Str::uuid().'.'.$photo->extension(),
            'public',
        );

        BeachPhoto::create([
            'date' => $validated['date'],
            'path' => $path,
            'original_filename' => $photo->getClientOriginalName(),
        ]);

        return back();
    }

    /**
     * Delete an uploaded photo.
     */
    public function destroy(BeachPhoto $beachPhoto): RedirectResponse
    {
        Storage::disk('public')->delete($beachPhoto->path);
        $beachPhoto->delete();

        return back();
    }
}
