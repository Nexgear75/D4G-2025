export const getSingleValueFromSearchParam = (value: string | string[] | undefined): string | undefined => {
  if (typeof value === 'string') return value;
  return undefined;
};

export const getSingleNumberValueFromSearchParam = (value: string | string[] | undefined): number | undefined => {
  const singleValue = getSingleValueFromSearchParam(value);
  if (!singleValue) return;

  const parsed = Number(value);
  if (isNaN(parsed)) return;

  return parsed;
};
