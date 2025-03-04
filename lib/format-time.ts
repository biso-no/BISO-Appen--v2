import { formatDistanceToNow } from 'date-fns';
import { nb, enUS } from 'date-fns/locale';

export const getFormattedDate = (date: Date) => formatDistanceToNow(date, { addSuffix: true, locale: enUS });

export const getFormattedDateFromString = (dateStr?: string) => {
    if (!dateStr) return "Date not available"; // Handle missing date string

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Invalid date"; // Handle invalid date format

    return formatDistanceToNow(date, { addSuffix: true, locale: nb });
};

//Format to dd.mm.yyyy
export const formatDate = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = date.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
}