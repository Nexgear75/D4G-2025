'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { z } from 'zod';

import ENV from '@/env';
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

  const url = new URL('/summarize', ENV.API_URL);

  const res = await fetch(url.toString(), {
    method: 'POST',
    body: JSON.stringify({ text: data.prompt, optimized: data.optimized }),
  });
  const body = await res.json();

  const { summary, energy, latency, memory } = z
    .object({
      summary: z.string(),
      energy: z.number(),
      latency: z.number(),
      memory: z.number(),
    })
    .parse(body);

  // const summary = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
  // const energy = 0.00092; // Wh
  // const latency = 1; // ms
  // const memory = 420; // Mb

  const searchParams = new URLSearchParams();
  searchParams.set('prompt', data.prompt);
  searchParams.set('summary', summary);
  searchParams.set('optimized', data.optimized ? 'true' : 'false');
  searchParams.set('energy', energy.toString());
  searchParams.set('latency', latency.toString());
  searchParams.set('memory', memory.toString());

  revalidatePath('/');
  redirect(`/?${searchParams.toString()}`);
};
