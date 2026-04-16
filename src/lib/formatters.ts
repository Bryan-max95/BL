/**
 * Formatea un número a formato de moneda con validación
 */
export function formatCurrency(value: number | undefined | null, currency = 'HNL'): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '$0.00';
  }
  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return formatter.format(value);
}

/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('es-ES').format(Math.round(value));
}

/**
 * Formatea un porcentaje
 */
export function formatPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0%';
  }
  return value.toFixed(1) + '%';
}
