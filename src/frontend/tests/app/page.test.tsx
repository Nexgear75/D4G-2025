import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from '@/app/page';

const renderHome = async (params: Record<string, string | string[] | undefined>) => {
  const ui = await HomePage({ searchParams: Promise.resolve(params) });
  return render(ui as any);
};

describe('HomePage', () => {
  it('renders header, form and footer by default', async () => {
    await renderHome({});
    expect(screen.getByRole('heading', { level: 1, name: /Design4Green - Lumax/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate the summary/i })).toBeInTheDocument();
    expect(screen.getByText(/Design4Green Projet 2025/i)).toBeInTheDocument();
  });

  it('passes defaultPrompt and defaultOptimized from search params to PromptForm', async () => {
    await renderHome({ prompt: 'Hello', optimized: 'true' });
    const textarea = screen.getByLabelText('Text to summarize') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Hello');

    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAttribute('aria-checked', 'true');
  });

  it('conditionally renders summary and provided stats', async () => {
    await renderHome({
      summary: 'Generated summary',
      energy: '0.95',
      latency: '123',
      memory: '256',
    });

    expect(screen.getByText('Generated summary')).toBeInTheDocument();

    expect(screen.getByText(/Energy/)).toBeInTheDocument();
    expect(screen.getByText(/0.95/)).toBeInTheDocument();

    expect(screen.getByText(/Latency/)).toBeInTheDocument();
    expect(screen.getByText(/123/)).toBeInTheDocument();

    expect(screen.getByText(/Memory/)).toBeInTheDocument();
    expect(screen.getByText(/256/)).toBeInTheDocument();
  });

  it('omits stat blocks when values are not provided', async () => {
    await renderHome({ summary: 'Only summary' });

    expect(screen.getByText('Only summary')).toBeInTheDocument();
    expect(screen.queryByText(/Energie/)).toBeNull();
    expect(screen.queryByText(/Latence/)).toBeNull();
    expect(screen.queryByText(/Mémoire/)).toBeNull();
  });
});
