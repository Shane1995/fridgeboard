const FORMAT = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export const formatAddedAt = (timestamp: number): string => FORMAT.format(timestamp);
