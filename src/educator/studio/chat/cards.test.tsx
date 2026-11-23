import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DiffCard, LiveSourceCard } from './cards';

const diff = {
  type: 'diff' as const,
  title: 'Fix with AI',
  ops: [{
    id: 'op1',
    status: 'pending' as const,
    summary: 'Rewrite the notes',
    op: { type: 'update_notes' },
  }],
};

describe('studio source and edit cards', () => {
  it('sends the typed title and description from a video card', async () => {
    const user = userEvent.setup();
    const onGenerate = vi.fn();
    render(<LiveSourceCard url="https://youtu.be/abc" kind="video" onGenerate={onGenerate} />);
    expect(screen.getByTestId('source-detected')).toHaveTextContent('YouTube video');
    expect(screen.queryByTestId('source-pick')).not.toBeInTheDocument();
    await user.type(screen.getByTestId('source-title'), 'Algebra');
    await user.type(screen.getByTestId('source-desc'), 'Lines');
    await user.click(screen.getByTestId('source-generate'));
    expect(onGenerate).toHaveBeenCalledWith({ title: 'Algebra', description: 'Lines' });
  });

  it('disables Generate while the course is building', () => {
    render(<LiveSourceCard url="https://youtu.be/abc" kind="video" busy onGenerate={vi.fn()} />);
    expect(screen.getByTestId('source-generate')).toBeDisabled();
    expect(screen.getByTestId('source-generate')).toHaveTextContent('Building the course…');
  });

  it('accepts a static edit locally when nothing is saved to the server', async () => {
    const user = userEvent.setup();
    render(<DiffCard card={diff} />);
    await user.click(screen.getByRole('button', { name: 'Accept' }));
    expect(screen.getByText('Accepted')).toBeInTheDocument();
  });

  it('asks the parent to resolve a live edit and keeps the buttons until that parent updates', async () => {
    const user = userEvent.setup();
    const onResolve = vi.fn();
    render(<DiffCard card={diff} onResolve={onResolve} />);
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    expect(onResolve).toHaveBeenCalledWith('op1', 'rejected');
    expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
  });
});
