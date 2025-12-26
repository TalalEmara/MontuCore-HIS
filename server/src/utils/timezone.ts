/**
 * Timezone Utility Functions
 * Converts between UTC and user's local timezone
 */

/**
 * Convert local time string to UTC
 * @param localTimeString ISO string in local timezone (without timezone info)
 * @param timezoneOffset Offset in minutes from UTC (e.g., 180 for UTC+3)
 * @returns Date object in UTC
 */
export const localToUTC = (localTimeString: string, timezoneOffset: number): Date => {
  const localDate = new Date(localTimeString);
  // Adjust: subtract the offset to convert from local to UTC
  return new Date(localDate.getTime() - timezoneOffset * 60 * 1000);
};

/**
 * Convert UTC date to local time string
 * @param utcDate Date object in UTC
 * @param timezoneOffset Offset in minutes from UTC (e.g., 180 for UTC+3)
 * @returns ISO string in local timezone
 */
export const utcToLocal = (utcDate: Date, timezoneOffset: number): string => {
  // Add the offset to convert from UTC to local time
  const localDate = new Date(utcDate.getTime() + timezoneOffset * 60 * 1000);
  return localDate.toISOString().split('T').slice(0, 2).join('T') + 'T' + localDate.toISOString().split('T')[1];
};

/**
 * Get timezone offset from timezone name (e.g., "Europe/Berlin")
 * Returns offset in minutes from UTC
 * Note: This is a simple version; for DST-aware conversion, use a library like date-fns or moment-timezone
 */
export const getTimezoneOffset = (date: Date, timezone: string): number => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const formatted = parts.reduce((acc, part) => {
    if (part.type === 'literal') return acc;
    return { ...acc, [part.type]: part.value };
  }, {} as Record<string, string>);

  const localDate = new Date(
    `${formatted.year}-${formatted.month}-${formatted.day}T${formatted.hour}:${formatted.minute}:${formatted.second}`
  );

  // Calculate offset
  return Math.round((date.getTime() - localDate.getTime()) / (1000 * 60));
};

/**
 * Convert UTC date to local timezone string representation
 * @param utcDate Date in UTC
 * @param timezone Timezone name (e.g., "Europe/Berlin")
 * @returns ISO string representing local time
 */
export const utcToLocalByTimezone = (utcDate: Date, timezone: string): string => {
  const offset = getTimezoneOffset(utcDate, timezone);
  const localDate = new Date(utcDate.getTime() + offset * 60 * 1000);
  return localDate.toISOString().replace('Z', '');
};
