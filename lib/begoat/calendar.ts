const REFERENCE_ZONE = "America/Sao_Paulo";
const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: REFERENCE_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function localDay(now = new Date()) {
  const parts = dayFormatter.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((value) => value.type === type)!.value;
  return [part("year"), part("month"), part("day")].join("-");
}

/** UTC is only a carrier for civil calendar arithmetic. Air times are Brasília wall times. */
export function dateInWeek(today: string, weekOffset: number, weekday: number) {
  const day = new Date(today + "T12:00:00Z");
  const sinceMonday = (day.getUTCDay() + 6) % 7;
  day.setUTCDate(day.getUTCDate() - sinceMonday + 7 * weekOffset + weekday);
  return day;
}

export function printDay(day: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("pt-BR", {
    ...options,
    timeZone: "UTC",
  }).format(day);
}

export interface WeeklySlot {
  day: number;
  time: string;
}
const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: REFERENCE_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function timeInBrasilia(now: Date) {
  return clock.format(now);
}

export function nextSlot<T extends WeeklySlot>(
  slots: T[],
  today: string,
  currentTime: string,
) {
  const dates = slots.map((slot) => {
    let date = dateInWeek(today, 0, slot.day).toISOString().slice(0, 10);
    if (date < today || (date === today && slot.time < currentTime))
      date = dateInWeek(today, 1, slot.day).toISOString().slice(0, 10);
    return { slot, date };
  });
  return (
    dates.sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.slot.time.localeCompare(b.slot.time),
    )[0] ?? null
  );
}

export function hourLabel(time: string) {
  return time.replace(":", "h");
}
