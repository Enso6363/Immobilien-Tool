import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

export function formatDate(iso: string, pattern = 'dd.MM.yyyy'): string {
  return format(parseISO(iso), pattern, { locale: de });
}

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'dd.MM.yyyy HH:mm', { locale: de });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function formatMonthLabel(date: Date): string {
  return format(date, 'LLLL yyyy', { locale: de });
}
