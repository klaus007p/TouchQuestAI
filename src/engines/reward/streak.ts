const TZ = process.env.APP_TIMEZONE ?? "UTC";


function dayKey(date: Date): string {
    return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(date);
}


function dayDiff(fromKey: string, toKey: string): number {
    return Math.round((Date.parse(toKey) - Date.parse(fromKey)) / 86_400_000);
}


export function nextStreak(
    current: number,
    lastCompleted: Date | null,
    now: Date
): number {
    if (!lastCompleted) return 1;

    const diff = dayDiff(dayKey(lastCompleted), dayKey(now));

    if(diff <= 0) return Math.max(current, 1);
    if(diff === 1) return current + 1;
    return 1;
}