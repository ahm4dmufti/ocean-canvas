<?php

use App\Services\Ocean\OceanConditions;
use App\Services\Ocean\PaletteGenerator;
use Carbon\CarbonImmutable;

function makeConditions(float $waveHeightMax, float $seaSurfaceTemperatureMax): OceanConditions
{
    return new OceanConditions(
        date: CarbonImmutable::parse('2026-09-09'),
        waveHeightMax: $waveHeightMax,
        wavePeriodMax: 5.0,
        waveDirectionDominant: 26.0,
        seaSurfaceTemperatureMax: $seaSurfaceTemperatureMax,
        windSpeedMax: 15.0,
        windDirectionDominant: 345.0,
    );
}

test('it produces a well-formed palette', function () {
    $palette = (new PaletteGenerator)->generate(makeConditions(0.8, 22.0));

    expect($palette['background'])->toMatch('/^#[0-9a-f]{6}$/')
        ->and($palette['strokes'])->toHaveCount(4)
        ->and($palette['foam'])->toMatch('/^#[0-9a-f]{6}$/')
        ->and($palette['hue'])->toBeFloat()
        ->and($palette['saturation'])->toBeFloat();

    foreach ($palette['strokes'] as $stroke) {
        expect($stroke)->toMatch('/^#[0-9a-f]{6}$/');
    }
});

test('it is a pure deterministic function of the conditions', function () {
    $generator = new PaletteGenerator;

    $first = $generator->generate(makeConditions(1.2, 24.5));
    $second = $generator->generate(makeConditions(1.2, 24.5));

    expect($first)->toBe($second);
});

test('bigger waves produce a bolder, more saturated palette', function () {
    $generator = new PaletteGenerator;

    $calm = $generator->generate(makeConditions(0.1, 22.0));
    $stormy = $generator->generate(makeConditions(2.5, 22.0));

    expect($stormy['saturation'])->toBeGreaterThan($calm['saturation']);
});

test('warmer sea temperatures bias the hue toward warm tones', function () {
    $generator = new PaletteGenerator;

    $cold = $generator->generate(makeConditions(0.8, 15.0));
    $warm = $generator->generate(makeConditions(0.8, 29.0));

    expect($warm['hue'])->toBeLessThan($cold['hue']);
});

test('extreme values are clamped instead of producing invalid colors', function () {
    $palette = (new PaletteGenerator)->generate(makeConditions(50.0, -10.0));

    expect($palette['background'])->toMatch('/^#[0-9a-f]{6}$/')
        ->and($palette['saturation'])->toBeLessThanOrEqual(100.0)
        ->and($palette['saturation'])->toBeGreaterThanOrEqual(0.0);
});
