<?php

namespace Database\Factories;

use App\Models\BeachPhoto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BeachPhoto>
 */
class BeachPhotoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $date = fake()->dateTimeBetween('-14 days', 'now')->format('Y-m-d');

        return [
            'date' => $date,
            'path' => 'beach-photos/'.$date.'/'.fake()->uuid().'.jpg',
            'original_filename' => fake()->word().'.jpg',
        ];
    }
}
