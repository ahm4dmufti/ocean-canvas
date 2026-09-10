<?php

namespace Database\Factories;

use App\Models\OceanPainting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OceanPainting>
 */
class OceanPaintingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $date = fake()->unique()->dateTimeBetween('-14 days', 'now')->format('Y-m-d');

        return [
            'date' => $date,
            'seed' => crc32($date),
            'conditions' => [
                'date' => $date,
                'wave_height_max' => fake()->randomFloat(2, 0.1, 2.5),
                'wave_period_max' => fake()->randomFloat(2, 3, 9),
                'wave_direction_dominant' => fake()->numberBetween(0, 359),
                'sea_surface_temperature_max' => fake()->randomFloat(1, 15, 29),
                'wind_speed_max' => fake()->randomFloat(1, 3, 35),
                'wind_direction_dominant' => fake()->numberBetween(0, 359),
            ],
            'palette' => [
                'background' => fake()->hexColor(),
                'strokes' => [fake()->hexColor(), fake()->hexColor(), fake()->hexColor(), fake()->hexColor()],
                'foam' => fake()->hexColor(),
                'hue' => fake()->randomFloat(1, 0, 360),
                'saturation' => fake()->randomFloat(1, 0, 100),
            ],
        ];
    }
}
