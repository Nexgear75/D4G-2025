import { describe, expect, it } from 'vitest';

import { GetSummarySchema } from '@/utils/schemas';

describe('GetSummarySchema', () => {
  it('accepts valid data', () => {
    const { success, data } = GetSummarySchema.safeParse({ prompt: 'hello', optimized: 'on' });
    expect(success).toBe(true);
    // @ts-expect-error data is typed when success is true
    expect(data.optimized).toBe(true);
  });

  it('rejects empty prompt', () => {
    const { success, error } = GetSummarySchema.safeParse({ prompt: '', optimized: 'false' });
    expect(success).toBe(false);
    expect(error?.issues.some((i) => i.path.join('.') === 'prompt')).toBe(true);
  });

  it('rejects prompt longer than 4000 characters', () => {
    const long = 'a'.repeat(4001);
    const { success, error } = GetSummarySchema.safeParse({ prompt: long, optimized: 'false' });
    expect(success).toBe(false);
    expect(error?.issues.some((i) => i.path.join('.') === 'prompt')).toBe(true);
  });

  it('coerces string booleans correctly', () => {
    const { success: s1, data: d1 } = GetSummarySchema.safeParse({ prompt: 'x', optimized: 'true' });
    expect(s1).toBe(true);
    // @ts-expect-error narrowed by success
    expect(d1.optimized).toBe(true);

    const { success: s2, data: d2 } = GetSummarySchema.safeParse({ prompt: 'x', optimized: 'false' });
    expect(s2).toBe(true);
    // @ts-expect-error narrowed by success
    expect(d2.optimized).toBe(false);
  });
});
