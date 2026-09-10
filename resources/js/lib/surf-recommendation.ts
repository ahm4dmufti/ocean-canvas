import type { OceanConditions } from '@/lib/ocean-painting';

export type SurfRating = 'flat' | 'marginal' | 'fun' | 'firing' | 'blown-out';

export type SurfRecommendation = {
    rating: SurfRating;
    label: string;
    headline: string;
    detail: string;
};

/**
 * Turns today's raw conditions into a plain-language surf call.
 *
 * Heuristic, not a forecast service: wave height sets the size bracket,
 * wave period rewards organized groundswell over short-period wind chop,
 * and strong wind drags the call down regardless of swell size.
 */
export function getSurfRecommendation(
    conditions: OceanConditions,
): SurfRecommendation {
    const height = conditions.wave_height_max;
    const period = conditions.wave_period_max;
    const wind = conditions.wind_speed_max;

    const heightText = `${height.toFixed(1)} m`;
    const periodText = `${period.toFixed(1)} s`;
    const windText = `${wind.toFixed(0)} km/h`;

    if (height < 0.3) {
        return {
            rating: 'flat',
            label: 'Flat',
            headline: 'Flat as a lake',
            detail: `Only ${heightText} of wave height out there today — good day to wax the board and wait it out.`,
        };
    }

    if (wind >= 28) {
        return {
            rating: 'blown-out',
            label: 'Blown out',
            headline: 'The wind is wrecking it',
            detail: `${windText} wind is chopping up a ${heightText} swell. Better suited to kitesurfing than surfing today.`,
        };
    }

    const sizeScore =
        height >= 1.8 ? 3 : height >= 1 ? 2 : height >= 0.5 ? 1 : 0;
    const qualityScore = period >= 8 ? 2 : period >= 6 ? 1 : 0;
    const windPenalty = wind >= 20 ? 2 : wind >= 12 ? 1 : 0;
    const score = sizeScore + qualityScore - windPenalty;

    if (score >= 4) {
        return {
            rating: 'firing',
            label: 'Firing',
            headline: 'Get in the water',
            detail: `${heightText} at a ${periodText} period with manageable wind — about as good as Benghazi gets.`,
        };
    }

    if (score >= 1) {
        return {
            rating: 'fun',
            label: 'Fun',
            headline: 'Worth a paddle out',
            detail: `${heightText} swell at ${periodText}. Not epic, but a fun session if you're keen.`,
        };
    }

    return {
        rating: 'marginal',
        label: 'Marginal',
        headline: 'Only if you’re desperate',
        detail: `${heightText} at ${periodText} is mostly short-period wind chop, nothing very organized.`,
    };
}
