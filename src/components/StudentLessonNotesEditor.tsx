import { useEffect, useState } from 'react';
import { fetchMyLessonNotes, saveMyLessonNotes } from '../api/studentNotesApi';
import {
  RichNotesEditor,
  type RichNotesPlayerClock,
  type RichNotesTheme,
} from './RichNotesEditor';

type Theme = {
  text: string;
  text2: string;
  text3: string;
  border: string;
  bg1: string;
  bg2: string;
  red: string;
};

export type LessonPlayerClock = RichNotesPlayerClock;

type Props = {
  courseId: string;
  lessonId: string;
  C: Theme;
  player?: LessonPlayerClock | null;
};

export function StudentLessonNotesEditor({ courseId, lessonId, C, player }: Props) {
  const [initialHtml, setInitialHtml] = useState<string | undefined>(undefined);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready'>('loading');
  const reloadKey = `${courseId}:${lessonId}`;

  useEffect(() => {
    let cancelled = false;
    setLoadStatus('loading');
    setInitialHtml(undefined);
    void fetchMyLessonNotes(courseId, lessonId)
      .then((note) => {
        if (cancelled) return;
        setInitialHtml(note.content?.trim() ? note.content : '<p><br></p>');
        setLoadStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setInitialHtml('<p><br></p>');
        setLoadStatus('ready');
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId]);

  const theme: RichNotesTheme = {
    text: C.text,
    text2: C.text2,
    text3: C.text3,
    border: C.border,
    bg1: C.bg1,
    bg2: C.bg2,
    accent: C.red,
  };

  if (loadStatus === 'loading') {
    return (
      <div
        className="rounded-2xl px-4 py-8 text-center text-[0.8rem]"
        style={{ background: C.bg1, border: `1px solid ${C.border}`, color: C.text3 }}
      >
        Loading…
      </div>
    );
  }

  return (
    <RichNotesEditor
      theme={theme}
      initialHtml={initialHtml}
      reloadKey={reloadKey}
      myNotesLabel="My notes"
      ariaLabel="Lesson notes editor"
      player={player}
      onPersist={(html) => saveMyLessonNotes(courseId, lessonId, html).then(() => undefined)}
    />
  );
}
