export function formatAmount(value: string | number, maxFractionDigits: number) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return String(value);
  }

  const [whole, fraction = ''] = numeric.toFixed(maxFractionDigits).split('.');
  const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const trimmedFraction = fraction.replace(/0+$/, '');

  return trimmedFraction.length > 0 ? `${groupedWhole}.${trimmedFraction}` : groupedWhole;
}

export function parseAmount(value: string) {
  const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : 0;
}
