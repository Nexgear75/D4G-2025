import { describe, expect, it } from 'vitest';

import { getSingleNumberValueFromSearchParam, getSingleValueFromSearchParam } from '@/utils/string';

describe('getSingleValueFromSearchParam', () => {
  it('returns the string when a single string is provided', () => {
    expect(getSingleValueFromSearchParam('hello')).toBe('hello');
  });

  it('returns undefined when an array is provided', () => {
    expect(getSingleValueFromSearchParam(['a', 'b'])).toBeUndefined();
  });

  it('returns undefined when undefined is provided', () => {
    expect(getSingleValueFromSearchParam(undefined)).toBeUndefined();
  });
});

describe('getSingleNumberValueFromSearchParam', () => {
  it('parses a numeric string to a number', () => {
    expect(getSingleNumberValueFromSearchParam('42')).toBe(42);
  });

  it('returns undefined for non-numeric strings', () => {
    expect(getSingleNumberValueFromSearchParam('abc')).toBeUndefined();
  });

  it('returns undefined for undefined input', () => {
    expect(getSingleNumberValueFromSearchParam(undefined)).toBeUndefined();
  });
});
