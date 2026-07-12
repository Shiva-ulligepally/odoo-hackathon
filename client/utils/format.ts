export function formatCO2e(value: number, includeUnit = true): string {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
  }).format(value);
  return includeUnit ? `${formatted} tCO2e` : formatted;
}

export function formatPercent(value: number, isFractional = false): string {
  const multiplier = isFractional ? 100 : 1;
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format((value * multiplier) / 100);
}

export function formatCurrency(value: number): string {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatNumber(value: number, maxDigits = 2): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: maxDigits,
  }).format(value);
}
