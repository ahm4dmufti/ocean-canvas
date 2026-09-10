import { Head, router } from '@inertiajs/react';
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useSpring,
} from 'motion/react';
import type { MouseEvent } from 'react';
import { useMemo, useRef, useState } from 'react';
import {
    CalendarDays,
    CloudDrizzle,
    Compass,
    Download,
    Flame,
    MoonStar,
    Navigation,
    Quote as QuoteIcon,
    Sparkles,
    Thermometer,
    ThumbsUp,
    Timer,
    Waves,
    Wind,
    WindArrowDown,
} from 'lucide-react';
import * as BeachPhotoController from '@/actions/App/Http/Controllers/BeachPhotoController';
import { BeachCalendar } from '@/components/beach-calendar';
import { DayGalleryViewer } from '@/components/day-gallery-viewer';
import { OceanCanvas } from '@/components/ocean-canvas';
import { Button } from '@/components/ui/button';
import { pickRandomQuote } from '@/lib/beach-quotes';
import { renderOceanPaintingToBlob } from '@/lib/ocean-painting';
import type { SurfRating, SurfRecommendation } from '@/lib/surf-recommendation';
import { getSurfRecommendation } from '@/lib/surf-recommendation';
import { cn } from '@/lib/utils';
import { beach } from '@/routes';
import type { GalleryEntry, Painting, Photo } from '@/types/beach';

type Props = {
    painting: Painting;
    paintings: Painting[];
    photos: Record<string, Photo[]>;
};

const PREVIEW_WIDTH = 720;
const PREVIEW_HEIGHT = 405;
const DOWNLOAD_WIDTH = 2560;
const DOWNLOAD_HEIGHT = 1440;

const STAT_ICONS = {
    waveHeight: Waves,
    wavePeriod: Timer,
    waveDirection: Compass,
    windSpeed: Wind,
    windDirection: Navigation,
    seaTemperature: Thermometer,
} as const;

export default function Beach({ painting, paintings, photos }: Props) {
    const [downloading, setDownloading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(painting.date);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
    const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });
    const glowX = useSpring(50, { stiffness: 150, damping: 20 });
    const glowY = useSpring(50, { stiffness: 150, damping: 20 });
    const glowBackground = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.35), transparent 60%)`;

    function handleCardMouseMove(event: MouseEvent<HTMLDivElement>) {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) {
            return;
        }

        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;

        rotateY.set((px - 0.5) * 20);
        rotateX.set((0.5 - py) * 20);
        glowX.set(px * 100);
        glowY.set(py * 100);
    }

    function handleCardMouseLeave() {
        rotateX.set(0);
        rotateY.set(0);
        glowX.set(50);
        glowY.set(50);
    }

    async function handleDownload() {
        setDownloading(true);

        try {
            const blob = await renderOceanPaintingToBlob(
                painting.seed,
                painting.conditions,
                painting.palette,
                DOWNLOAD_WIDTH,
                DOWNLOAD_HEIGHT,
            );

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ocean-painting-${painting.date}.png`;
            link.click();
            URL.revokeObjectURL(url);
        } finally {
            setDownloading(false);
        }
    }

    const stats = useMemo(
        () => [
            {
                label: 'Wave height',
                value: `${painting.conditions.wave_height_max} m`,
                icon: STAT_ICONS.waveHeight,
            },
            {
                label: 'Wave period',
                value: `${painting.conditions.wave_period_max} s`,
                icon: STAT_ICONS.wavePeriod,
            },
            {
                label: 'Wave direction',
                value: `${painting.conditions.wave_direction_dominant}°`,
                icon: STAT_ICONS.waveDirection,
            },
            {
                label: 'Wind speed',
                value: `${painting.conditions.wind_speed_max} km/h`,
                icon: STAT_ICONS.windSpeed,
            },
            {
                label: 'Wind direction',
                value: `${painting.conditions.wind_direction_dominant}°`,
                icon: STAT_ICONS.windDirection,
            },
            {
                label: 'Sea temperature',
                value: `${painting.conditions.sea_surface_temperature_max}°C`,
                icon: STAT_ICONS.seaTemperature,
            },
        ],
        [painting.conditions],
    );

    const recommendation = useMemo(
        () => getSurfRecommendation(painting.conditions),
        [painting.conditions],
    );

    const quote = useMemo(() => pickRandomQuote(), []);

    const paintingsByDate = useMemo(
        () => new Map(paintings.map((item) => [item.date, item])),
        [paintings],
    );

    const paintingDates = useMemo(
        () => new Set(paintingsByDate.keys()),
        [paintingsByDate],
    );

    const photoDates = useMemo(
        () =>
            new Set(
                Object.keys(photos).filter((date) => photos[date].length > 0),
            ),
        [photos],
    );

    const galleryEntries = useMemo((): GalleryEntry[] => {
        const entries: GalleryEntry[] = [];
        const dayPainting = paintingsByDate.get(selectedDate);

        if (dayPainting) {
            entries.push({ kind: 'painting', painting: dayPainting });
        }

        for (const photo of photos[selectedDate] ?? []) {
            entries.push({ kind: 'photo', photo });
        }

        return entries;
    }, [paintingsByDate, photos, selectedDate]);

    function handleSelectDate(date: string) {
        setSelectedDate(date);
        setGalleryOpen(true);
    }

    async function handleUpload(files: FileList) {
        setUploading(true);

        try {
            for (const file of Array.from(files)) {
                await new Promise<void>((resolve, reject) => {
                    router.post(
                        BeachPhotoController.store.url(),
                        { date: selectedDate, photo: file },
                        {
                            forceFormData: true,
                            preserveScroll: true,
                            preserveState: true,
                            onSuccess: () => resolve(),
                            onError: () =>
                                reject(new Error('Photo upload failed')),
                        },
                    );
                });
            }
        } finally {
            setUploading(false);
        }
    }

    function handleDeletePhoto(photoId: number) {
        router.delete(
            BeachPhotoController.destroy.url({ beachPhoto: photoId }),
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    }

    return (
        <>
            <Head title="The Beach That Paints Itself" />

            <div className="relative flex h-full flex-1 flex-col gap-8 overflow-x-hidden overflow-y-auto rounded-xl p-4 sm:p-8">
                <SummerBackdrop hue={painting.palette.hue} />

                <motion.header
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="relative z-10 space-y-2"
                >
                    <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                        <Sparkles className="size-4 text-amber-500 dark:text-amber-300" />
                        {painting.date}
                    </div>
                    <h1 className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl dark:from-amber-300 dark:via-orange-400 dark:to-rose-400">
                        The beach that paints itself
                    </h1>
                    <p className="text-muted-foreground max-w-xl text-base">
                        A new piece every day, generated from live ocean
                        conditions at Benghazi.
                    </p>
                </motion.header>

                <SurfCallBanner recommendation={recommendation} />

                <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <motion.div
                        ref={cardRef}
                        onMouseMove={handleCardMouseMove}
                        onMouseLeave={handleCardMouseLeave}
                        style={{
                            rotateX: springRotateX,
                            rotateY: springRotateY,
                            transformPerspective: 1000,
                        }}
                        initial={{ opacity: 0, scale: 0.92, rotateX: -8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="relative isolate overflow-hidden rounded-2xl border border-white/20 shadow-2xl shadow-orange-900/10 dark:border-white/10 dark:shadow-black/40"
                    >
                        <motion.div
                            style={{ background: glowBackground }}
                            className="pointer-events-none absolute inset-0 z-10"
                        />
                        <OceanCanvas
                            seed={painting.seed}
                            conditions={painting.conditions}
                            palette={painting.palette}
                            width={PREVIEW_WIDTH}
                            height={PREVIEW_HEIGHT}
                            className="block h-auto w-full"
                        />
                    </motion.div>

                    <motion.dl
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: {},
                            show: {
                                transition: {
                                    staggerChildren: 0.06,
                                    delayChildren: 0.35,
                                },
                            },
                        }}
                        className="grid grid-cols-2 gap-3 self-start lg:grid-cols-1"
                    >
                        {stats.map((stat) => (
                            <StatCard key={stat.label} {...stat} />
                        ))}
                    </motion.dl>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="relative z-10"
                >
                    <Button
                        onClick={handleDownload}
                        disabled={downloading}
                        size="lg"
                        className="bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-orange-900/20 transition-shadow hover:from-amber-500/90 hover:to-rose-500/90 hover:shadow-orange-900/30"
                    >
                        <Download className="size-4" />
                        {downloading ? 'Rendering wallpaper…' : 'Download PNG'}
                    </Button>
                </motion.div>

                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.6 }}
                    className="relative z-10 space-y-3"
                >
                    <div className="flex items-center gap-2">
                        <CalendarDays className="size-5 text-amber-500 dark:text-amber-300" />
                        <h2 className="text-lg font-semibold">
                            Your beach journal
                        </h2>
                    </div>
                    <p className="text-muted-foreground max-w-xl text-sm">
                        Pick any day to see its painting and drop in your own
                        photos from the beach.
                    </p>
                    <BeachCalendar
                        paintingDates={paintingDates}
                        photoDates={photoDates}
                        selectedDate={selectedDate}
                        todayDate={painting.date}
                        onSelectDate={handleSelectDate}
                    />
                </motion.section>

                <BeachQuoteBlock quote={quote} />

                <DayGalleryViewer
                    open={galleryOpen}
                    onOpenChange={setGalleryOpen}
                    date={selectedDate}
                    entries={galleryEntries}
                    onUpload={handleUpload}
                    onDeletePhoto={handleDeletePhoto}
                    uploading={uploading}
                />
            </div>
        </>
    );
}

const SURF_RATING_STYLES: Record<
    SurfRating,
    { icon: typeof Flame; classes: string }
> = {
    flat: {
        icon: MoonStar,
        classes:
            'from-slate-400/20 to-slate-500/10 text-slate-600 dark:text-slate-300',
    },
    marginal: {
        icon: CloudDrizzle,
        classes:
            'from-amber-400/20 to-amber-500/10 text-amber-600 dark:text-amber-300',
    },
    fun: {
        icon: ThumbsUp,
        classes:
            'from-teal-400/20 to-emerald-500/10 text-teal-600 dark:text-teal-300',
    },
    firing: {
        icon: Flame,
        classes:
            'from-orange-400/30 to-rose-500/20 text-orange-600 dark:text-orange-300',
    },
    'blown-out': {
        icon: WindArrowDown,
        classes: 'from-red-400/20 to-red-500/10 text-red-600 dark:text-red-300',
    },
};

function SurfCallBanner({
    recommendation,
}: {
    recommendation: SurfRecommendation;
}) {
    const { icon: Icon, classes } = SURF_RATING_STYLES[recommendation.rating];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
            whileHover={{ y: -2 }}
            style={{ transformPerspective: 800 }}
            className={cn(
                'border-sidebar-border/70 dark:border-sidebar-border relative z-10 flex flex-col gap-2 rounded-xl border bg-gradient-to-br p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-4',
                classes,
            )}
        >
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase opacity-80">
                <Icon className="size-4" />
                Surf call · {recommendation.label}
            </div>
            <div className="sm:border-l sm:border-current/20 sm:pl-4">
                <p className="text-foreground text-base font-semibold">
                    {recommendation.headline}
                </p>
                <p className="text-muted-foreground text-sm">
                    {recommendation.detail}
                </p>
            </div>
        </motion.div>
    );
}

function BeachQuoteBlock({
    quote,
}: {
    quote: { text: string; author: string };
}) {
    return (
        <motion.blockquote
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="relative z-10 mx-auto max-w-2xl space-y-2 pb-4 text-center"
        >
            <QuoteIcon className="mx-auto size-5 text-amber-500/60 dark:text-amber-300/50" />
            <p className="text-foreground/90 text-lg font-medium italic">
                “{quote.text}”
            </p>
            <footer className="text-muted-foreground text-sm">
                — {quote.author}
            </footer>
        </motion.blockquote>
    );
}

type StatCardProps = {
    label: string;
    value: string;
    icon: typeof Waves;
};

function StatCard({ label, value, icon: Icon }: StatCardProps) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 16, rotateX: -15 },
                show: { opacity: 1, y: 0, rotateX: 0 },
            }}
            whileHover={{ y: -4, scale: 1.03 }}
            style={{ transformPerspective: 800 }}
            className="border-sidebar-border/70 dark:border-sidebar-border bg-card/60 flex items-center gap-3 rounded-xl border p-3 backdrop-blur-sm"
        >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400/20 to-rose-400/20 text-amber-600 dark:text-amber-300">
                <Icon className="size-4" />
            </div>
            <div>
                <dt className="text-muted-foreground text-xs tracking-wide uppercase">
                    {label}
                </dt>
                <dd className="text-sm font-semibold">{value}</dd>
            </div>
        </motion.div>
    );
}

function SummerBackdrop({ hue }: { hue: number }) {
    const particles = useMemo(
        () =>
            Array.from({ length: 16 }, (_, i) => ({
                id: i,
                left: (i * 37) % 100,
                delay: (i % 8) * 0.6,
                duration: 6 + (i % 5),
                size: 2 + (i % 3),
            })),
        [],
    );

    return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-xl">
            <div
                className="absolute -top-1/3 -right-1/4 h-[60%] w-[60%] rounded-full opacity-30 blur-3xl dark:opacity-20"
                style={{
                    background: `radial-gradient(circle, hsl(${hue} 90% 65%), transparent 70%)`,
                }}
            />
            <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.4, 0.25] }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="absolute top-10 right-10 h-40 w-40 rounded-full bg-amber-300/40 blur-2xl dark:bg-amber-400/20"
            />
            {particles.map((particle) => (
                <motion.span
                    key={particle.id}
                    className="absolute bottom-0 rounded-full bg-white/70 dark:bg-white/30"
                    style={{
                        left: `${particle.left}%`,
                        width: particle.size,
                        height: particle.size,
                    }}
                    animate={{ y: ['0%', '-120%'], opacity: [0, 0.8, 0] }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
}

Beach.layout = {
    breadcrumbs: [
        {
            title: 'Beach',
            href: beach(),
        },
    ],
};
