/**
 * Formatea un precio en euros.
 * @example formatPrice(25) → "25,00 €"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

/**
 * Formatea una fecha ISO (YYYY-MM-DD) a formato legible en español.
 * @example formatDate('2026-05-15') → "15 de mayo de 2026"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Formatea una duración en minutos a texto legible.
 * @example formatDuration(75) → "1h 15min"
 * @example formatDuration(30) → "30 min"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}min` : `${hours}h`;
}

/**
 * Devuelve la fecha de hoy en formato YYYY-MM-DD (para inputs date).
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}
