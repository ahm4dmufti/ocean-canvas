import { useEffect, useRef } from 'react';
import type { OceanConditions, OceanPalette } from '@/lib/ocean-painting';
import { paintOcean } from '@/lib/ocean-painting';

type Props = {
    seed: number;
    conditions: OceanConditions;
    palette: OceanPalette;
    width: number;
    height: number;
    className?: string;
};

export function OceanCanvas({
    seed,
    conditions,
    palette,
    width,
    height,
    className,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        paintOcean(ctx, width, height, seed, conditions, palette);
    }, [seed, conditions, palette, width, height]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: '100%',
                height: 'auto',
                maxWidth: width,
                aspectRatio: `${width} / ${height}`,
            }}
            className={className}
        />
    );
}
