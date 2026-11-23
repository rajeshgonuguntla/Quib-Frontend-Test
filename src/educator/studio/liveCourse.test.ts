import { describe, expect, it } from 'vitest';
import { playlist } from './model';
import { assistantText, draftThread, generationBody, mapGeneratedCourse } from './liveCourse';
import { DEFAULT_GENERATION_OPTIONS } from '../../types/courseGeneration';

const playlistUrl = 'https://www.youtube.com/playlist?list=PLreal-algebra';

describe('studio live course mapping', () => {
  it('sends a pasted playlist as youtubeUrl and keeps the SAT fixture out of the request', () => {
    const body = generationBody(playlistUrl, 'Algebra sprint', 'Slope and intercepts');
    expect(body.youtubeUrl).toBe(playlistUrl);
    expect(body.youtubeUrl).not.toBe(playlist.url);
    expect(JSON.stringify(body)).not.toContain('PLsatmath');
    expect(JSON.stringify(body)).not.toContain(playlist.videos[0].title);
    expect(body.options.moduleCount).toBe(DEFAULT_GENERATION_OPTIONS.moduleCount);
    expect(body.options.builderNotes).toBe('Title: Algebra sprint\nDescription: Slope and intercepts');
  });

  it('does not attach the SAT video list to a live paste', () => {
    const thread = draftThread(playlistUrl, 1);
    const card = thread[1]?.card;
    expect(card?.type).toBe('source');
    if (card?.type === 'source') {
      expect(card.live).toBe(true);
      expect(card.url).toBe(playlistUrl);
      expect(card.kind).toBe('playlist');
    }
    expect(JSON.stringify(thread)).not.toContain(playlist.videos[0].title);
  });

  it('tells the educator that web and PDF links cannot be generated', () => {
    expect(draftThread('https://example.com/notes', 2)[1]?.text).toMatch(/YouTube/);
    expect(draftThread('https://example.com/notes', 2)[1]?.card).toBeUndefined();
    expect(draftThread('https://example.com/notes.pdf', 3)[1]?.card).toBeUndefined();
  });

  it('maps generated modules into outline rows and keeps a lesson title when notes are missing', () => {
    const course = mapGeneratedCourse({
      courseId: '11111111-1111-1111-1111-111111111111',
      publicSlug: 'algebra',
      title: 'Algebra',
      modules: [{
        id: 'm1',
        title: 'Lines',
        description: 'Slope',
        lessons: [{
          id: 'l1',
          title: 'Slope in 12 minutes',
          duration: '12:00',
          type: 'video',
          summary: 'm is the slope.',
          flashcards: [{ front: 'Slope', back: 'Rise over run' }],
        }],
        quiz: [{ question: 'What is m?', options: ['Slope'], answer: 0 }],
      }],
    }, 'fallback');
    expect(course.title).toBe('Algebra');
    expect(course.modules[0]?.name).toBe('Lines');
    expect(course.modules[0]?.items.map((item) => item.title)).toEqual([
      'Slope in 12 minutes',
      'Slope in 12 minutes cards',
      'Questions',
    ]);
    expect(course.modules[0]?.items[0]?.content.notes?.[0]?.text).toBe('m is the slope.');

    const bare = mapGeneratedCourse({
      title: 'Bare',
      modules: [{
        id: 'm1',
        title: 'Start',
        description: '',
        lessons: [{ id: 'l1', title: 'Welcome', duration: '', type: 'video' }],
        quiz: [],
      }],
    }, 'bare-id');
    expect(bare.modules[0]?.items[0]?.title).toBe('Welcome');
  });

  it('prepends mention chips into the assistant message', () => {
    expect(assistantText('Shorten the notes', [{ id: 'l1', label: 'Slope in 12 minutes' }]))
      .toBe('@Slope in 12 minutes Shorten the notes');
    expect(assistantText('Hello', [])).toBe('Hello');
  });
});
