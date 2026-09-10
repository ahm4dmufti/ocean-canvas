import { AnimatePresence, motion } from 'motion/react';
import type { PanInfo } from 'motion/react';
import type { DragEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, ImagePlus, Trash2 } from 'lucide-react';
import { OceanCanvas } from '@/components/ocean-canvas';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { GalleryEntry } from '@/types/beach';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: string;
    entries: GalleryEntry[];
    onUpload: (files: FileList) => void;
    onDeletePhoto: (photoId: number) => void;
    uploading: boolean;
};

const swipeVariants = {
    enter: (direction: number) => ({
        y: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.82,
        rotateX: direction > 0 ? 30 : -30,
    }),
    center: {
        y: 0,
        opacity: 1,
        scale: 1,
        rotateX: 0,
    },
    exit: (direction: number) => ({
        y: direction > 0 ? '-100%' : '100%',
        opacity: 0,
        scale: 0.82,
        rotateX: direction > 0 ? -30 : 30,
    }),
};

export function DayGalleryViewer({
    open,
    onOpenChange,
    date,
    entries,
    onUpload,
    onDeletePhoto,
    uploading,
}: Props) {
    const [[index, direction], setIndex] = useState<[number, number]>([0, 0]);
    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setIndex([0, 0]);
        }
    }, [open, date]);

    useEffect(() => {
        if (index >= entries.length && entries.length > 0) {
            setIndex([entries.length - 1, 0]);
        }
    }, [entries.length, index]);

    function paginate(step: number) {
        setIndex(([current]) => {
            const next = current + step;
            if (next < 0 || next >= entries.length) {
                return [current, 0];
            }
            return [next, step];
        });
    }

    useEffect(() => {
        if (!open) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                paginate(1);
            } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                paginate(-1);
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, entries.length]);

    function handleDragEnd(
        _event: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo,
    ) {
        const swipePower = Math.abs(info.offset.y) * info.velocity.y;

        if (swipePower < -8000) {
            paginate(1);
        } else if (swipePower > 8000) {
            paginate(-1);
        }
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDraggingFile(false);

        if (event.dataTransfer.files.length > 0) {
            onUpload(event.dataTransfer.files);
        }
    }

    const entry = entries[index] as GalleryEntry | undefined;
    const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="inset-0 top-0 left-0 h-dvh max-h-none w-screen max-w-none translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-none border-none bg-black p-0 text-white sm:max-w-none [&_svg]:text-white">
                <DialogTitle className="sr-only">
                    Gallery for {date}
                </DialogTitle>

                <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-4 pr-14">
                    <span className="text-sm font-medium">{dateLabel}</span>
                    <span className="text-xs text-white/70">
                        {entries.length > 0 ? index + 1 : 0} / {entries.length}
                    </span>
                </div>

                <div
                    className="relative h-full w-full overflow-hidden"
                    style={{ perspective: 1200 }}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setIsDraggingFile(true);
                    }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={handleDrop}
                >
                    <AnimatePresence
                        initial={false}
                        custom={direction}
                        mode="popLayout"
                    >
                        {entry && (
                            <motion.div
                                key={entryKey(entry)}
                                custom={direction}
                                variants={swipeVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    y: {
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 32,
                                    },
                                    opacity: { duration: 0.2 },
                                    scale: { duration: 0.3 },
                                    rotateX: { duration: 0.3 },
                                }}
                                drag={entries.length > 1 ? 'y' : false}
                                dragConstraints={{ top: 0, bottom: 0 }}
                                dragElastic={0.7}
                                onDragEnd={handleDragEnd}
                                className="absolute inset-0 flex items-center justify-center p-6 pt-16 pb-24"
                            >
                                <GalleryEntryView
                                    entry={entry}
                                    onDeletePhoto={onDeletePhoto}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {isDraggingFile && (
                        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center border-4 border-dashed border-amber-400 bg-black/60">
                            <p className="text-lg font-semibold text-amber-300">
                                Drop to add to {date}
                            </p>
                        </div>
                    )}
                </div>

                {entries.length > 1 && (
                    <div className="absolute top-1/2 right-4 z-20 flex -translate-y-1/2 flex-col gap-2">
                        <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="rounded-full bg-white/10 hover:bg-white/20"
                            disabled={index === 0}
                            onClick={() => paginate(-1)}
                            aria-label="Previous item"
                        >
                            <ChevronUp className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="rounded-full bg-white/10 hover:bg-white/20"
                            disabled={index === entries.length - 1}
                            onClick={() => paginate(1)}
                            aria-label="Next item"
                        >
                            <ChevronDown className="size-4" />
                        </Button>
                    </div>
                )}

                <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(event) => {
                            if (event.target.files?.length) {
                                onUpload(event.target.files);
                                event.target.value = '';
                            }
                        }}
                    />
                    <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="gap-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-500/90 hover:to-rose-500/90"
                    >
                        <ImagePlus className="size-4" />
                        {uploading ? 'Uploading…' : 'Add photos'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function entryKey(entry: GalleryEntry): string {
    return entry.kind === 'painting'
        ? `painting-${entry.painting.date}`
        : `photo-${entry.photo.id}`;
}

function GalleryEntryView({
    entry,
    onDeletePhoto,
}: {
    entry: GalleryEntry;
    onDeletePhoto: (photoId: number) => void;
}) {
    if (entry.kind === 'painting') {
        return (
            <div className="flex max-h-full max-w-full flex-col items-center gap-3">
                <div className="max-h-[75dvh] max-w-[92vw] overflow-hidden rounded-xl shadow-2xl">
                    <OceanCanvas
                        seed={entry.painting.seed}
                        conditions={entry.painting.conditions}
                        palette={entry.painting.palette}
                        width={1280}
                        height={720}
                        className="block"
                    />
                </div>
                <p className="text-sm text-white/70">
                    Generated ocean painting
                </p>
            </div>
        );
    }

    return (
        <div className="group relative flex max-h-full max-w-full items-center justify-center">
            <img
                src={entry.photo.url}
                alt={entry.photo.original_filename ?? 'Beach photo'}
                className="max-h-[80dvh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
            />
            <button
                type="button"
                onClick={() => onDeletePhoto(entry.photo.id)}
                className={cn(
                    'absolute top-2 right-2 rounded-full bg-black/60 p-2 text-white/90 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80',
                )}
                aria-label="Delete photo"
            >
                <Trash2 className="size-4" />
            </button>
        </div>
    );
}
