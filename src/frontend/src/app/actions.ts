'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { z } from 'zod';

import { GetSummarySchema } from '@/utils/schemas';

export type State = {
  errors?: { prompt?: { errors: string[] } | undefined };
  message?: string | null;
  data: { prompt: string; optimized: boolean };
};

export const getSummary = async (_prevState: State, formData: FormData): Promise<State> => {
  const rawPrompt = formData.get('prompt');
  const rawOptimized = formData.get('optimized');

  const { error, data } = GetSummarySchema.safeParse({
    prompt: rawPrompt,
    optimized: rawOptimized,
  });

  if (error || !data)
    return {
      data: {
        prompt: typeof rawPrompt === 'string' ? rawPrompt : '',
        optimized: rawOptimized === 'on',
      },
      errors: z.treeifyError(error).properties,
      message: 'Invalid data.',
    };

  // eslint-disable-next-line no-console
  console.log(data);

  const summary = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

  const searchParams = new URLSearchParams();
  searchParams.set('prompt', data.prompt);
  searchParams.set('summary', summary);
  searchParams.set('optimized', data.optimized ? 'true' : 'false');

  revalidatePath('/');
  redirect(`/?${searchParams.toString()}`);
};
