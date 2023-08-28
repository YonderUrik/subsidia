import { format, getTime, formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

// ----------------------------------------------------------------------

export function fDate(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy';

  return date ? format(new Date(date), fm) : '';
}

export function fDateTime(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}

export function fTimestamp(date) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date) {
  if (!date) {
    return '';
  }

  try {
    const parsedDate = new Date(`${date} UTC`);
    if (Number.isNaN(parsedDate)) {
      // Handle the case when the date parameter is not a valid date string
      // You can throw an error or return a message to indicate the issue
      throw new Error('Invalid date string');
    }

    return formatDistanceToNow(parsedDate, {
      addSuffix: true,
      locale: it,
    });
  } catch (error) {
    return date;
  }
}
