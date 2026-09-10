export type CalendarCell = {
    date: string;
    day: number;
    inCurrentMonth: boolean;
};

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Builds a 7-column month grid (weeks of Sun–Sat), padded with the
 * trailing days of the previous/next month so every week is complete.
 * `month` is 0-indexed (0 = January), matching the native Date API.
 */
export function getCalendarWeeks(
    year: number,
    month: number,
): CalendarCell[][] {
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: CalendarCell[] = [];

    for (let i = startWeekday - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        cells.push({
            date: formatDate(new Date(year, month - 1, day)),
            day,
            inCurrentMonth: false,
        });
    }

    for (let day = 1; day <= daysInMonth; day++) {
        cells.push({
            date: formatDate(new Date(year, month, day)),
            day,
            inCurrentMonth: true,
        });
    }

    let trailingDay = 1;
    while (cells.length % 7 !== 0) {
        cells.push({
            date: formatDate(new Date(year, month + 1, trailingDay)),
            day: trailingDay,
            inCurrentMonth: false,
        });
        trailingDay++;
    }

    const weeks: CalendarCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }

    return weeks;
}

export function todayDateString(): string {
    return formatDate(new Date());
}
