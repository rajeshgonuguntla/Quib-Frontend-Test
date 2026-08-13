import axios from 'axios';

export type StudyToolType = 'notes' | 'flashcards' | 'blanks' | 'exam';

export type StudyFlashcard = { front: string; back: string };
export type StudyBlank = { sentence: string; answer: string; hint?: string };
export type StudyExamQuestion = {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
};

export type LessonStudyToolResponse = {
  type: StudyToolType;
  source: string;
  notes?: { markdown: string };
  flashcards?: StudyFlashcard[];
  blanks?: StudyBlank[];
  exam?: StudyExamQuestion[];
};

export async function generateLessonStudyTool(
  courseId: string,
  lessonId: string,
  toolType: StudyToolType,
): Promise<LessonStudyToolResponse> {
  const res = await axios.post<LessonStudyToolResponse>(
    `/api/courses/${courseId}/lessons/${lessonId}/study-tools/${toolType}`,
  );
  return res.data;
}
