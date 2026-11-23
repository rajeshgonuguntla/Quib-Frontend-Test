import axios, { type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { playlist } from './model';
import { apiError, assistantText, describeCourseEdit, draftThread, editCard, generationBody, mapGeneratedCourse, proposedEdit } from './liveCourse';
import type { StudioCourse } from './model';
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
    expect(generationBody(playlistUrl, '  ', '').options.builderNotes).toBeUndefined();
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
      'Module quiz',
    ]);
    expect(course.modules[0]?.items.map((item) => item.kind)).toEqual(['video', 'drill']);
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

  it('maps a reading, blanks, an empty module, and a published course', () => {
    const course = mapGeneratedCourse({
      isPublished: true,
      title: 'Published',
      modules: [
        {
          id: 'm1',
          title: 'Read',
          description: '',
          lessons: [{
            id: 'l1',
            title: 'Notes',
            duration: '',
            type: 'reading',
            notes: 'Line one\nLine two',
            blanks: [{ sentence: 'The slope is', answer: 'm' }],
          }],
          quiz: [],
        },
        {
          id: 'm2',
          title: 'Empty',
          description: 'Nothing here yet',
          lessons: [],
          quiz: [],
        },
      ],
    }, 'id');
    expect(course.status).toBe('published');
    expect(course.visibility).toBe('public');
    expect(course.modules[0]?.items.map((item) => item.kind)).toEqual(['notes']);
    expect(course.modules[0]?.items[0]?.content.points?.map((point) => point.text)).toEqual(['Line one', 'Line two']);
    expect(course.modules[1]?.items[0]?.title).toBe('Empty');
    expect(course.modules[1]?.items[0]?.content.points?.[0]?.text).toBe('Nothing here yet');
  });

  it('describes a module rename instead of repeating the old course title', () => {
    const summary = describeCourseEdit(
      { title: 'Python for Beginners', modules: [{ id: 'm1', title: 'Introduction to Python', description: '', lessons: [], quiz: [] }] },
      {
        title: 'Python for Beginners',
        description: '',
        difficulty: 'Intermediate',
        modules: [{ id: 'm1', title: 'Python Fundamentals & Setup', description: '', lessons: [], quiz: [] }],
      },
    );
    const card = editCard('msg-1', summary);
    expect(card?.type).toBe('diff');
    if (card?.type === 'diff') {
      expect(card.ops[0]?.summary).toBe('Rename <b>Introduction to Python</b> to <b>Python Fundamentals & Setup</b>.');
    }
  });

  it('reads a rate limit, a server message, and a plain error', () => {
    const limited = new axios.AxiosError('no');
    limited.response = { status: 429, data: { message: 'slow down' } } as AxiosResponse;
    const failed = new axios.AxiosError('no');
    failed.response = { status: 500, data: { details: 'Playlist not found' } } as AxiosResponse;
    expect(apiError(limited, 'fallback')).toBe('Too many requests. Wait a minute and try again.');
    expect(apiError(failed, 'fallback')).toBe('Playlist not found');
    expect(apiError(new Error('boom'), 'fallback')).toBe('boom');
    expect(apiError('x', 'fallback')).toBe('fallback');
  });

  it('prepends mention chips into the assistant message', () => {
    expect(assistantText('Shorten the notes', [{ id: 'l1', label: 'Slope in 12 minutes' }]))
      .toBe('@Slope in 12 minutes Shorten the notes');
    expect(assistantText('Hello', [])).toBe('Hello');
  });

  it('points a mention at the lesson, flashcards, or quiz the educator selected', () => {
    const course: StudioCourse = {
      id: 'c',
      title: 'Python',
      description: '',
      status: 'draft',
      visibility: 'private',
      modules: [{
        id: 'm1',
        name: 'Introduction',
        items: [
          { id: 'l1', kind: 'video', moduleId: 'm1', title: 'Getting started', meta: '8:00', content: { kind: 'video' } },
          { id: 'l1-cards', kind: 'cards', moduleId: 'm1', title: 'Getting started cards', meta: '1 cards', content: { kind: 'cards' } },
          { id: 'm1-quiz', kind: 'drill', moduleId: 'm1', title: 'Questions', meta: '1 questions', content: { kind: 'drill' } },
        ],
      }],
    };
    expect(assistantText('Add two more', [{ id: 'l1-cards', label: 'Getting started cards' }], course))
      .toBe('lesson 1 in module 1 flashcards (lesson id l1). Add two more');
    expect(assistantText('Add one more question', [{ id: 'm1-quiz', label: 'Questions' }], course))
      .toBe('module 1 quiz (module id m1). Add one more question');
    expect(assistantText('Rename module 2 to Setup', [{ id: 'l1', label: 'Getting started' }], course))
      .toBe('@Getting started Rename module 2 to Setup');
  });

  it('applies quiz, flashcard, lesson, and module changes from the returned course', () => {
    const lesson = {
      id: 'l1',
      title: 'Getting started',
      duration: '8:00',
      type: 'video' as const,
      flashcards: [{ front: 'Interpreter', back: 'Runs code a line at a time' }],
    };
    const base = {
      title: 'Python',
      description: '',
      difficulty: 'Intermediate',
      modules: [{
        id: 'm1',
        title: 'Introduction',
        description: '',
        lessons: [lesson],
        quiz: [{ question: 'What is Python?', options: ['A', 'B', 'C', 'D'], answer: 0 }],
      }],
    };
    const edited = {
      ...base,
      modules: [
        {
          ...base.modules[0],
          title: 'Python Fundamentals',
          lessons: [
            { ...lesson, flashcards: [...lesson.flashcards, { front: 'Variable', back: 'A named value' }] },
            { id: 'l2', title: 'Variables', duration: '6:00', type: 'video' as const },
          ],
          quiz: [
            ...base.modules[0].quiz,
            { question: 'What is a variable?', options: ['A', 'B', 'C', 'D'], answer: 1 },
          ],
        },
        {
          id: 'm2',
          title: 'Functions',
          description: '',
          lessons: [{ id: 'l3', title: 'Defining a function', duration: '7:00', type: 'video' as const }],
          quiz: [],
        },
      ],
    };
    const payload = proposedEdit(base, edited, [{ type: 'SET', path: 'title', value: 'Ignored by the operation' }]);
    expect(payload?.title).toBe('Python');
    expect(payload?.modules.map((module) => module.title)).toEqual(['Python Fundamentals', 'Functions']);
    expect(payload?.modules[0]?.lessons.map((item) => item.title)).toEqual(['Getting started', 'Variables']);
    expect(payload?.modules[0]?.lessons[0]?.flashcards).toHaveLength(2);
    expect(payload?.modules[0]?.quiz).toHaveLength(2);
    expect(describeCourseEdit(base, payload)).toContain('quiz questions from 1 to 2');
    expect(describeCourseEdit(base, payload)).toContain('flashcards from 1 to 2');

    const removed = proposedEdit(edited, {
      ...edited,
      modules: [{ ...edited.modules[0], lessons: [edited.modules[0].lessons[0]] }],
    });
    expect(removed?.modules).toHaveLength(1);
    expect(removed?.modules[0]?.lessons.map((item) => item.title)).toEqual(['Getting started']);
  });
});
