const numberFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 2,
});

export const formatNumber = (value: number): string => {
  return numberFormatter.format(value);
};

export const safeFormatNumber = (value?: number): string => {
  return value ? numberFormatter.format(value) : "";
};
