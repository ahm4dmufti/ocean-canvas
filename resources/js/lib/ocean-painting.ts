import { createNoise2D } from 'simplex-noise';
import { mulberry32 } from '@/lib/random';

export type OceanConditions = {
    date: string;
    wave_height_max: number;
    wave_period_max: number;
    wave_direction_dominant: number;
    sea_surface_temperature_max: number;
    wind_speed_max: number;
    wind_direction_dominant: number;
};

export type OceanPalette = {
    background: string;
    strokes: string[];
    foam: string;
    hue: number;
    saturation: number;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

/**
 * Paints a day's ocean conditions as a flow-field of brush strokes.
 *
 * Mapping (the "art brain"):
 * - wave height  -> stroke boldness (width/alpha) and foam density
 * - wave period  -> layer count and spacing (longer period = calmer, more spaced)
 * - wind speed   -> turbulence/jitter of each stroke's path
 * - wind dir     -> the dominant flow angle strokes are drawn along
 * - sea temp     -> already baked into the palette's hue (warm/cool bias)
 *
 * Deterministic: the same seed + conditions always produce the same pixels.
 */
export function paintOcean(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    seed: number,
    conditions: OceanConditions,
    palette: OceanPalette,
): void {
    const rng = mulberry32(seed);
    const noise2D = createNoise2D(rng);

    const energy = clamp01(conditions.wave_height_max / 2.5);
    const calm = clamp01(conditions.wave_period_max / 10);
    const turbulence = clamp01(conditions.wind_speed_max / 40);
    const windAngle = (conditions.wind_direction_dominant * Math.PI) / 180;

    ctx.clearRect(0, 0, width, height);

    const wash = ctx.createLinearGradient(0, 0, 0, height);
    wash.addColorStop(0, palette.background);
    wash.addColorStop(1, shade(palette.background, -14));
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, width, height);

    const layers = Math.round(lerp(8, 3, calm));
    const spacing = lerp(width / 40, width / 14, calm);
    const jitter = lerp(0.15, 0.9, turbulence);
    const noiseFrequency = lerp(1.5, 4, turbulence);

    for (let layer = 0; layer < layers; layer++) {
        const color = palette.strokes[layer % palette.strokes.length];
        const depth = layers <= 1 ? 1 : layer / (layers - 1);
        const lineWidth = lerp(1.5, lerp(4, 10, energy), depth);
        const alpha = lerp(0.25, 0.55, energy) * lerp(0.6, 1, depth);
        const rowOffset = rng() * spacing;

        for (let y = -spacing + rowOffset; y < height + spacing; y += spacing) {
            const strokesInRow = Math.round(width / spacing) + 2;

            for (let i = 0; i < strokesInRow; i++) {
                const startX =
                    i * spacing + (rng() - 0.5) * spacing * 0.6 - spacing;
                const startY = y + (rng() - 0.5) * spacing * 0.4;

                traceStroke(ctx, noise2D, startX, startY, width, height, {
                    baseAngle: windAngle,
                    steps: Math.round(lerp(18, 40, energy)),
                    stepLength: spacing / 6,
                    jitter,
                    noiseFrequency,
                    lineWidth,
                    color,
                    alpha,
                });
            }
        }
    }

    const foamCount = Math.round(lerp(20, 140, energy));
    ctx.fillStyle = palette.foam;

    for (let i = 0; i < foamCount; i++) {
        const x = rng() * width;
        const y = rng() * height;
        const radius = lerp(0.5, 2.2, rng());

        ctx.globalAlpha = lerp(0.15, 0.5, rng());
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1;
}

type StrokeOptions = {
    baseAngle: number;
    steps: number;
    stepLength: number;
    jitter: number;
    noiseFrequency: number;
    lineWidth: number;
    color: string;
    alpha: number;
};

function traceStroke(
    ctx: CanvasRenderingContext2D,
    noise2D: (x: number, y: number) => number,
    startX: number,
    startY: number,
    width: number,
    height: number,
    options: StrokeOptions,
): void {
    let x = startX;
    let y = startY;

    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let step = 0; step < options.steps; step++) {
        const n = noise2D(
            (x / width) * options.noiseFrequency,
            (y / height) * options.noiseFrequency,
        );
        const angle = options.baseAngle + n * Math.PI * options.jitter;

        x += Math.cos(angle) * options.stepLength;
        y += Math.sin(angle) * options.stepLength;
        ctx.lineTo(x, y);

        if (x < -50 || x > width + 50 || y < -50 || y > height + 50) {
            break;
        }
    }

    ctx.strokeStyle = options.color;
    ctx.globalAlpha = options.alpha;
    ctx.lineWidth = options.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function shade(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amount = Math.round(2.55 * percent);

    const r = clampByte((num >> 16) + amount);
    const g = clampByte(((num >> 8) & 0x00ff) + amount);
    const b = clampByte((num & 0x0000ff) + amount);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function clampByte(value: number): number {
    return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * Renders the painting at an arbitrary resolution and returns it as a PNG
 * blob, for a crisp wallpaper-quality download independent of the on-screen
 * preview size.
 */
export async function renderOceanPaintingToBlob(
    seed: number,
    conditions: OceanConditions,
    palette: OceanPalette,
    width: number,
    height: number,
): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Canvas 2D context is not available.');
    }

    paintOcean(ctx, width, height, seed, conditions, palette);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Failed to encode painting as PNG.'));
            }
        }, 'image/png');
    });
}
