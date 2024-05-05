import { formatDistanceToNow } from 'date-fns';
import { nb, enUS } from 'date-fns/locale';

const date = new Date(2024, 0, 1); // Replace with your specific date
export const getFormattedDate = (date: Date) => formatDistanceToNow(date, { addSuffix: true, locale: enUS });

export const getFormattedDateFromString = (dateStr: string) => {
    const date = new Date(dateStr);
    return formatDistanceToNow(date, { addSuffix: true, locale: nb });
}