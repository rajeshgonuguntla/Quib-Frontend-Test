import axios from 'axios';

export interface TranscriptCue {
  start: number;
  end: number;
  text: string;
}

export async function fetchLessonTranscript(
  courseId: string,
  lessonId: string,
): Promise<TranscriptCue[]> {
  const res = await axios.get<{ cues?: TranscriptCue[] }>(
    `/api/courses/${courseId}/lessons/${lessonId}/transcript`,
  );
  return res.data?.cues ?? [];
}
