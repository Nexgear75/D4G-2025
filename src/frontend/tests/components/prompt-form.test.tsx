import type * as ReactNS from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { State } from '@/app/actions';
import PromptForm from '@/components/prompt-form';

let mockedState: State;
let mockedPending = false;

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof ReactNS>();
  return {
    ...actual,
    useActionState: (_action: any, _initialState: any) => {
      return [mockedState, vi.fn, mockedPending];
    },
  } as typeof import('react');
});

beforeEach(() => {
  mockedState = { errors: {}, message: null, data: { prompt: '', optimized: false } };
  mockedPending = false;
});

describe('PromptForm', () => {
  it('renders textarea with provided default prompt and switch with provided default optimized', async () => {
    mockedState = { errors: {}, message: null, data: { prompt: 'Hello world', optimized: true } };

    render(<PromptForm defaultPrompt="Hello world" defaultOptimized={true} />);

    const textarea = screen.getByLabelText('Texte à résumer') as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.value).toBe('Hello world');

    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAttribute('aria-checked', 'true');
  });

  it('disables fields when pending', () => {
    mockedPending = true;
    mockedState = { errors: {}, message: null, data: { prompt: 'abc', optimized: false } };

    render(<PromptForm defaultPrompt="abc" defaultOptimized={false} />);

    const textarea = screen.getByLabelText('Texte à résumer');
    expect(textarea).toBeDisabled();

    const switchEl = screen.getByRole('switch');
    expect(switchEl).toBeDisabled();

    const submit = screen.getByRole('button', { name: /générer le résumé/i });
    expect(submit).toBeDisabled();
  });

  it('shows validation errors when present in state', async () => {
    mockedState = {
      data: { prompt: '', optimized: false },
      errors: { prompt: { errors: ['Le texte ne peut pas être vide.', 'Autre erreur'] } },
      message: 'Invalid data.',
    };

    render(<PromptForm defaultPrompt="" defaultOptimized={false} />);

    expect(screen.getByText('Le texte ne peut pas être vide.')).toBeInTheDocument();
    expect(screen.getByText('Autre erreur')).toBeInTheDocument();
  });

  it('allows typing in the textarea and toggling the switch when not pending', async () => {
    const user = userEvent.setup();
    mockedState = { errors: {}, message: null, data: { prompt: '', optimized: false } };

    render(<PromptForm defaultPrompt="" defaultOptimized={false} />);

    const textarea = screen.getByLabelText('Texte à résumer') as HTMLTextAreaElement;
    await user.type(textarea, 'Bonjour');
    expect(textarea.value).toBe('Bonjour');

    const switchEl = screen.getByRole('switch');
    await user.click(switchEl);
    expect(switchEl.getAttribute('aria-checked')).toBe('true');
  });
});
