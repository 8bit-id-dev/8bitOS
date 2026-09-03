const TZ = 'Asia/Jakarta';

export const daysOfWeek = [
  'MINGGU',
  'SENIN',
  'SELASA',
  'RABU',
  'KAMIS',
  'JUMAT',
  'SABTU',
] as const;

const partsInJakarta = (d: Date, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormatPart[] => {
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: TZ }).formatToParts(d);
};

const weekdayLookup: Record<string, string> = {
  Sunday: 'MINGGU',
  Monday: 'SENIN',
  Tuesday: 'SELASA',
  Wednesday: 'RABU',
  Thursday: 'KAMIS',
  Friday: 'JUMAT',
  Saturday: 'SABTU',
};

export const todayInJakarta = (now: Date): { dateKey: string; dayOfWeek: number } => {
  const parts = partsInJakarta(now, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });
  const lookup: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const year = parts.find((p) => p.type === 'year')!.value;
  const month = parts.find((p) => p.type === 'month')!.value;
  const day = parts.find((p) => p.type === 'day')!.value;
  const weekday = parts.find((p) => p.type === 'weekday')!.value;
  return {
    dateKey: `${year}-${month}-${day}`,
    dayOfWeek: lookup[weekday] ?? 0,
  };
};

export const formatJakartaTime = (iso: string): string => {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
};

const englishToIndonesianMonth: Record<string, string> = {
  January: 'Januari',
  February: 'Februari',
  March: 'Maret',
  April: 'April',
  May: 'Mei',
  June: 'Juni',
  July: 'Juli',
  August: 'Agustus',
  September: 'September',
  October: 'Oktober',
  November: 'November',
  December: 'Desember',
};

export const formatJakartaDate = (iso: string): string => {
  const d = new Date(iso);
  const parts = partsInJakarta(d, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const weekday = (parts.find((p) => p.type === 'weekday')?.value ?? '').replace(/^./, (c) => c.toUpperCase());
  const day = parts.find((p) => p.type === 'day')!.value;
  const monthRaw = parts.find((p) => p.type === 'month')!.value;
  const year = parts.find((p) => p.type === 'year')!.value;
  const monthId = (englishToIndonesianMonth[monthRaw] ?? monthRaw).toUpperCase();
  const weekdayId = weekdayLookup[weekday] ?? weekday.toUpperCase();
  return `${weekdayId}, ${day} ${monthId} ${year}`;
};
