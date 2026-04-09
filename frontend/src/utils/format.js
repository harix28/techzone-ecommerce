const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const formatCurrency = (value = 0) => currencyFormatter.format(Number(value || 0));

export const formatCompactNumber = (value = 0) =>
  compactNumberFormatter.format(Number(value || 0));

export const formatDate = (value, options = {}) => {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(value));
};

export const formatDateTime = (value) =>
  formatDate(value, {
    hour: 'numeric',
    minute: '2-digit',
  });
