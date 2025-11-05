import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import VisuallyHidden from '@/components/visually-hidden';

describe('VisuallyHidden', () => {
  it('renders content inside a span with visually hidden class', () => {
    render(<VisuallyHidden data-testid="vh">Hello</VisuallyHidden>);
    const el = screen.getByTestId('vh');
    expect(el.tagName.toLowerCase()).toBe('span');
    expect(el).toHaveTextContent('Hello');
    expect(el.className).toBeTruthy();
  });
});
