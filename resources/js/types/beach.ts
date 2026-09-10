import type { OceanConditions, OceanPalette } from '@/lib/ocean-painting';

export type Painting = {
    date: string;
    seed: number;
    conditions: OceanConditions;
    palette: OceanPalette;
};

export type Photo = {
    id: number;
    url: string;
    original_filename: string | null;
};

export type GalleryEntry =
    | { kind: 'painting'; painting: Painting }
    | { kind: 'photo'; photo: Photo };
