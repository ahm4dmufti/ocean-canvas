import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCalendarWeeks } from '@/lib/calendar-grid';
import { cn } from '@/lib/utils';

type Props = {
    paintingDates: Set<string>;
    photoDates: Set<string>;
    selectedDate: string;
    todayDate: string;
    onSelectDate: (date: string) => void;
};

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function BeachCalendar({
    paintingDates,
    photoDates,
    selectedDate,
    todayDate,
    onSelectDate,
}: Props) {
    const [cursor, setCursor] = useState(() => {
        const [year, month] = selectedDate.split('-').map(Number);
        return { year, month: month - 1 };
    });

    const weeks = useMemo(
        () => getCalendarWeeks(cursor.year, cursor.month),
        [cursor],
    );

    const monthLabel = useMemo(
        () =>
            new Date(cursor.year, cursor.month, 1).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
            }),
        [cursor],
    );

    function goToPreviousMonth() {
        setCursor((current) =>
            current.month === 0
                ? { year: current.year - 1, month: 11 }
                : { year: current.year, month: current.month - 1 },
        );
    }

    function goToNextMonth() {
        setCursor((current) =>
            current.month === 11
                ? { year: current.year + 1, month: 0 }
                : { year: current.year, month: current.month + 1 },
        );
    }

    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border bg-card/60 rounded-xl border p-4 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
                <button
                    type="button"
                    onClick={goToPreviousMonth}
                    className="hover:bg-accent rounded-md p-1.5"
                    aria-label="Previous month"
                >
                    <ChevronLeft className="size-4" />
                </button>
                <span className="text-sm font-semibold">{monthLabel}</span>
                <button
                    type="button"
                    onClick={goToNextMonth}
                    className="hover:bg-accent rounded-md p-1.5"
                    aria-label="Next month"
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>

            <div className="text-muted-foreground mb-1 grid grid-cols-7 gap-1 text-center text-xs">
                {WEEKDAY_LABELS.map((label, index) => (
                    <div key={index}>{label}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {weeks.flatMap((week) =>
                    week.map((cell) => {
                        const hasPainting = paintingDates.has(cell.date);
                        const hasPhotos = photoDates.has(cell.date);
                        const isFuture = cell.date > todayDate;
                        const isSelected = cell.date === selectedDate;
                        const isToday = cell.date === todayDate;
                        const isClickable = cell.inCurrentMonth && !isFuture;

                        return (
                            <motion.button
                                key={cell.date}
                                type="button"
                                disabled={!isClickable}
                                onClick={() =>
                                    isClickable && onSelectDate(cell.date)
                                }
                                whileHover={
                                    isClickable
                                        ? { scale: 1.12, rotateX: -10, y: -1 }
                                        : undefined
                                }
                                whileTap={
                                    isClickable ? { scale: 0.94 } : undefined
                                }
                                style={{ transformPerspective: 400 }}
                                className={cn(
                                    'relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-colors',
                                    !cell.inCurrentMonth &&
                                        'text-muted-foreground/30',
                                    cell.inCurrentMonth &&
                                        !isClickable &&
                                        'text-muted-foreground/60',
                                    isClickable &&
                                        'text-foreground hover:bg-accent cursor-pointer',
                                    isToday && 'ring-1 ring-amber-500/70',
                                    isSelected &&
                                        'bg-gradient-to-br from-amber-400/30 to-rose-400/30 font-semibold',
                                )}
                            >
                                {cell.day}
                                {(hasPainting || hasPhotos) && (
                                    <span className="mt-0.5 flex gap-0.5">
                                        {hasPainting && (
                                            <span className="size-1 rounded-full bg-amber-500" />
                                        )}
                                        {hasPhotos && (
                                            <span className="size-1 rounded-full bg-teal-500" />
                                        )}
                                    </span>
                                )}
                            </motion.button>
                        );
                    }),
                )}
            </div>

            <div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    Painting
                </span>
                <span className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-teal-500" />
                    Photos
                </span>
            </div>
        </div>
    );
}
