<?php

namespace App\Services\Ocean;

class PaletteGenerator
{
    private const COOL_HUE = 202.0;

    private const WARM_HUE = 18.0;

    private const MAX_WAVE_HEIGHT = 2.5;

    private const MIN_SEA_TEMP = 15.0;

    private const MAX_SEA_TEMP = 29.0;

    /**
     * Derive a deterministic color palette from a day's ocean conditions.
     *
     * Wave height drives boldness (saturation, depth of the background); sea
     * temperature biases the hue from cool blues toward warm corals.
     *
     * @return array{background: string, strokes: array<int, string>, foam: string, hue: float, saturation: float}
     */
    public function generate(OceanConditions $conditions): array
    {
        $energy = self::normalize($conditions->waveHeightMax, 0.0, self::MAX_WAVE_HEIGHT);
        $warmth = self::normalize($conditions->seaSurfaceTemperatureMax, self::MIN_SEA_TEMP, self::MAX_SEA_TEMP);

        $hue = self::lerp(self::COOL_HUE, self::WARM_HUE, $warmth);
        $saturation = self::lerp(40.0, 90.0, $energy);
        $backgroundLightness = self::lerp(22.0, 8.0, $energy);

        return [
            'background' => self::hslToHex($hue, $saturation, $backgroundLightness),
            'strokes' => [
                self::hslToHex($hue - 12, $saturation, self::lerp(30.0, 45.0, $energy)),
                self::hslToHex($hue, min($saturation + 10, 95.0), self::lerp(45.0, 58.0, $energy)),
                self::hslToHex($hue + 14, $saturation, self::lerp(60.0, 68.0, $energy)),
                self::hslToHex($hue + 26, max($saturation - 15, 20.0), self::lerp(75.0, 80.0, $energy)),
            ],
            'foam' => self::hslToHex($hue, max($saturation - 55, 5.0), 95.0),
            'hue' => round($hue, 1),
            'saturation' => round($saturation, 1),
        ];
    }

    private static function normalize(float $value, float $min, float $max): float
    {
        return max(0.0, min(1.0, ($value - $min) / ($max - $min)));
    }

    private static function lerp(float $from, float $to, float $t): float
    {
        return $from + ($to - $from) * $t;
    }

    private static function hslToHex(float $hue, float $saturation, float $lightness): string
    {
        $h = fmod(fmod($hue, 360) + 360, 360) / 360;
        $s = max(0.0, min(100.0, $saturation)) / 100;
        $l = max(0.0, min(100.0, $lightness)) / 100;

        if ($s === 0.0) {
            $r = $g = $b = $l;
        } else {
            $q = $l < 0.5 ? $l * (1 + $s) : $l + $s - $l * $s;
            $p = 2 * $l - $q;
            $r = self::hueToRgb($p, $q, $h + 1 / 3);
            $g = self::hueToRgb($p, $q, $h);
            $b = self::hueToRgb($p, $q, $h - 1 / 3);
        }

        return sprintf('#%02x%02x%02x', (int) round($r * 255), (int) round($g * 255), (int) round($b * 255));
    }

    private static function hueToRgb(float $p, float $q, float $t): float
    {
        if ($t < 0) {
            $t += 1;
        }

        if ($t > 1) {
            $t -= 1;
        }

        if ($t < 1 / 6) {
            return $p + ($q - $p) * 6 * $t;
        }

        if ($t < 1 / 2) {
            return $q;
        }

        if ($t < 2 / 3) {
            return $p + ($q - $p) * (2 / 3 - $t) * 6;
        }

        return $p;
    }
}
