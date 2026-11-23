import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { StudioCourse } from '../model';
import { PreviewPane } from './PreviewPane';

vi.mock('../../../components/YoutubeLessonPlayer', () => ({
  YoutubeLessonPlayer: ({ videoId, title }: { videoId: string; title: string }) => (
    <div data-testid="yt-player" data-video-id={videoId}>{title}</div>
  ),
}));

function course(videoId?: string): StudioCourse {
  return {
    id: 'course-1',
    title: 'Shareholder letters',
    description: '',
    status: 'draft',
    visibility: 'private',
    modules: [{
      id: 'm1',
      name: 'Foundations',
      items: [{
        id: 'l1',
        kind: 'video',
        moduleId: 'm1',
        title: "Lessons from Jeff Bezos's Shareholder Letters",
        meta: '01:19:29',
        content: { kind: 'video', duration: '01:19:29', videoId, notes: [] },
      }],
    }],
  };
}

describe('studio lesson preview', () => {
  it('embeds the same YouTube player a learner course uses', () => {
    render(<PreviewPane course={course('bezosVid')} onMention={vi.fn()} onFix={vi.fn()} />);
    const player = screen.getByTestId('yt-player');
    expect(player).toHaveAttribute('data-video-id', 'bezosVid');
    expect(screen.getByTestId('view-video')).toContainElement(player);
  });

  it('keeps the duration placeholder when the lesson has no video id', () => {
    render(<PreviewPane course={course()} onMention={vi.fn()} onFix={vi.fn()} />);
    expect(screen.queryByTestId('yt-player')).not.toBeInTheDocument();
    expect(screen.getByTestId('view-video')).toHaveTextContent('01:19:29');
  });
});
