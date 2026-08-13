/**
 * Course-builder follow-ups — niche detection + question bank.
 * ponytail: stand-in for missing course-builder-followups-SKILL.md; keep this file as the source of truth until that skill lands.
 *
 * Detection: classify from YouTube oEmbed title/author (fallback: URL tokens → general).
 * UI: one question at a time, tappable option cards (honen-style).
 */

import type { CourseDifficulty, CourseGenerationOptions, CourseStructure } from '../types/courseGeneration';
import { DEFAULT_GENERATION_OPTIONS } from '../types/courseGeneration';

export type VideoNiche =
  | 'programming'
  | 'ai_ml'
  | 'business'
  | 'fitness'
  | 'creative'
  | 'science'
  | 'language'
  | 'general';

export type FollowupOption = {
  id: string;
  label: string;
  description: string;
  icon: string; // lucide icon name key
};

export type FollowupQuestion = {
  id: string;
  prompt: string;
  options: FollowupOption[];
};

export type FollowupAnswer = {
  questionId: string;
  optionId: string;
  label: string;
};

const NICHE_KEYWORDS: Record<Exclude<VideoNiche, 'general'>, string[]> = {
  programming: [
    'javascript', 'typescript', 'python', 'java', 'react', 'node', 'coding', 'programming',
    'software', 'api', 'backend', 'frontend', 'devops', 'docker', 'kubernetes', 'sql', 'git',
  ],
  ai_ml: [
    'machine learning', 'deep learning', 'neural', 'llm', 'gpt', 'ai ', 'artificial intelligence',
    'transformer', 'pytorch', 'tensorflow', 'nlp', 'computer vision', 'rag',
  ],
  business: [
    'marketing', 'sales', 'startup', 'business', 'finance', 'investing', 'saas', 'growth',
    'product management', 'leadership', 'entrepreneur',
  ],
  fitness: [
    'workout', 'fitness', 'gym', 'yoga', 'nutrition', 'diet', 'training', 'exercise', 'health',
  ],
  creative: [
    'design', 'figma', 'photoshop', 'illustrat', 'music', 'film', 'video editing', 'photography',
    'writing', 'drawing', 'animation', 'ui/ux', 'ux ',
  ],
  science: [
    'physics', 'chemistry', 'biology', 'math', 'calculus', 'quantum', 'astronomy', 'engineering',
  ],
  language: [
    'english', 'spanish', 'french', 'german', 'japanese', 'hindi', 'grammar', 'vocabulary',
    'language learning', 'ielts', 'toefl',
  ],
};

export function detectNiche(text: string): VideoNiche {
  const hay = text.toLowerCase();
  let best: VideoNiche = 'general';
  let bestScore = 0;
  for (const [niche, words] of Object.entries(NICHE_KEYWORDS) as [Exclude<VideoNiche, 'general'>, string[]][]) {
    let score = 0;
    for (const w of words) {
      if (hay.includes(w)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = niche;
    }
  }
  return bestScore > 0 ? best : 'general';
}

export async function fetchYoutubeMeta(url: string): Promise<{ title: string; author: string }> {
  try {
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(endpoint);
    if (!res.ok) return { title: '', author: '' };
    const data = (await res.json()) as { title?: string; author_name?: string };
    return { title: data.title ?? '', author: data.author_name ?? '' };
  } catch {
    return { title: '', author: '' };
  }
}

function audienceQuestion(niche: VideoNiche): FollowupQuestion {
  const nicheHint: Record<VideoNiche, string> = {
    programming: 'coding pace',
    ai_ml: 'ML background',
    business: 'business experience',
    fitness: 'fitness level',
    creative: 'creative experience',
    science: 'science background',
    language: 'language level',
    general: 'experience level',
  };
  return {
    id: 'audience',
    prompt: `Who is this course for — what's their ${nicheHint[niche]}?`,
    options: [
      { id: 'beginner', label: 'Beginner', description: 'New to the topic — start from first principles', icon: 'sprout' },
      { id: 'intermediate', label: 'Intermediate', description: 'Some experience — fill gaps and go deeper', icon: 'layers' },
      { id: 'advanced', label: 'Advanced', description: 'Strong foundation — prioritize nuance and edge cases', icon: 'rocket' },
    ],
  };
}

function outcomeQuestion(niche: VideoNiche): FollowupQuestion {
  const byNiche: Record<VideoNiche, FollowupOption[]> = {
    programming: [
      { id: 'build', label: 'Build something', description: 'Ship a working project or feature', icon: 'hammer' },
      { id: 'interview', label: 'Interview ready', description: 'Explain concepts and solve problems under pressure', icon: 'briefcase' },
      { id: 'understand', label: 'Deep understanding', description: 'Know the why, not just the how', icon: 'brain' },
    ],
    ai_ml: [
      { id: 'build', label: 'Build an ML app', description: 'Apply models in a real workflow', icon: 'hammer' },
      { id: 'interview', label: 'Interview / research', description: 'Talk fluently about methods and tradeoffs', icon: 'briefcase' },
      { id: 'understand', label: 'Concept mastery', description: 'Solid intuition for how models work', icon: 'brain' },
    ],
    business: [
      { id: 'build', label: 'Apply at work', description: 'Use frameworks on a real business problem', icon: 'hammer' },
      { id: 'interview', label: 'Career move', description: 'Prepare for a role or promotion conversation', icon: 'briefcase' },
      { id: 'understand', label: 'Strategic clarity', description: 'See the bigger picture and decide better', icon: 'brain' },
    ],
    fitness: [
      { id: 'build', label: 'Start a routine', description: 'Leave with a clear weekly plan', icon: 'hammer' },
      { id: 'interview', label: 'Performance goal', description: 'Train toward a specific milestone', icon: 'briefcase' },
      { id: 'understand', label: 'Form & safety', description: 'Understand technique and avoid injury', icon: 'brain' },
    ],
    creative: [
      { id: 'build', label: 'Create a piece', description: 'Finish a portfolio-ready deliverable', icon: 'hammer' },
      { id: 'interview', label: 'Client / job ready', description: 'Present work and process confidently', icon: 'briefcase' },
      { id: 'understand', label: 'Craft fundamentals', description: 'Internalize principles you can reuse', icon: 'brain' },
    ],
    science: [
      { id: 'build', label: 'Solve problems', description: 'Work through exercises with confidence', icon: 'hammer' },
      { id: 'interview', label: 'Exam ready', description: 'Pass tests and explain methods clearly', icon: 'briefcase' },
      { id: 'understand', label: 'Conceptual depth', description: 'Connect ideas across the subject', icon: 'brain' },
    ],
    language: [
      { id: 'build', label: 'Hold conversations', description: 'Speak and write in real situations', icon: 'hammer' },
      { id: 'interview', label: 'Test ready', description: 'Prepare for exams or certifications', icon: 'briefcase' },
      { id: 'understand', label: 'Grammar & nuance', description: 'Understand structure and meaning', icon: 'brain' },
    ],
    general: [
      { id: 'build', label: 'Practical skills', description: 'Walk away ready to apply it', icon: 'hammer' },
      { id: 'interview', label: 'Prove competence', description: 'Be ready to demonstrate or discuss it', icon: 'briefcase' },
      { id: 'understand', label: 'Clear understanding', description: 'Grasp the core ideas end-to-end', icon: 'brain' },
    ],
  };
  return {
    id: 'outcome',
    prompt: "What's the main outcome you want learners to walk away with?",
    options: byNiche[niche],
  };
}

function structureQuestion(): FollowupQuestion {
  return {
    id: 'structure',
    prompt: "Should the course follow the video's existing structure, or be reorganized?",
    options: [
      {
        id: 'follow',
        label: 'Follow the video',
        description: 'Keep the creator’s sequence — modules map to the talk order',
        icon: 'list-video',
      },
      {
        id: 'reorganize',
        label: 'Reorganize',
        description: 'Restructure into clearer custom modules for learning',
        icon: 'layout-grid',
      },
    ],
  };
}

function quizQuestion(niche: VideoNiche): FollowupQuestion {
  const endLabel =
    niche === 'science' || niche === 'language'
      ? 'Just at the end'
      : 'Just at the end';
  return {
    id: 'quizzes',
    prompt: 'Do you want quizzes after each module, or just at the end?',
    options: [
      {
        id: 'per_module',
        label: 'After each module',
        description: 'Reinforce as they go — better retention',
        icon: 'list-checks',
      },
      {
        id: 'end_only',
        label: endLabel,
        description: 'One assessment pass when the course is complete',
        icon: 'flag',
      },
      {
        id: 'heavy',
        label: 'Quiz-heavy',
        description: 'More questions per module — exam-prep style',
        icon: 'target',
      },
    ],
  };
}

function topicsQuestion(niche: VideoNiche): FollowupQuestion {
  const byNiche: Record<VideoNiche, FollowupOption[]> = {
    programming: [
      { id: 'fundamentals', label: 'Emphasize fundamentals', description: 'Core APIs, patterns, and mental models', icon: 'focus' },
      { id: 'skip_setup', label: 'Skip setup fluff', description: 'Less install/env — more real coding', icon: 'scissors' },
      { id: 'expand_examples', label: 'Expand examples', description: 'More walkthroughs and edge cases', icon: 'expand' },
    ],
    ai_ml: [
      { id: 'fundamentals', label: 'Emphasize intuition', description: 'Why models behave the way they do', icon: 'focus' },
      { id: 'skip_setup', label: 'Skip math digressions', description: 'Keep proofs light unless essential', icon: 'scissors' },
      { id: 'expand_examples', label: 'Expand labs', description: 'More applied examples and pipelines', icon: 'expand' },
    ],
    business: [
      { id: 'fundamentals', label: 'Emphasize frameworks', description: 'Repeatable playbooks over anecdotes', icon: 'focus' },
      { id: 'skip_setup', label: 'Skip storytelling filler', description: 'Trim long personal stories', icon: 'scissors' },
      { id: 'expand_examples', label: 'Expand case studies', description: 'More concrete scenarios', icon: 'expand' },
    ],
    fitness: [
      { id: 'fundamentals', label: 'Emphasize form', description: 'Safety and technique first', icon: 'focus' },
      { id: 'skip_setup', label: 'Skip gear talk', description: 'Less product plugs — more training', icon: 'scissors' },
      { id: 'expand_examples', label: 'Expand progressions', description: 'More levels and variations', icon: 'expand' },
    ],
    creative: [
      { id: 'fundamentals', label: 'Emphasize craft', description: 'Principles over tool clicks', icon: 'focus' },
      { id: 'skip_setup', label: 'Skip tool tour', description: 'Assume basic software familiarity', icon: 'scissors' },
      { id: 'expand_examples', label: 'Expand critiques', description: 'More before/after breakdowns', icon: 'expand' },
    ],
    science: [
      { id: 'fundamentals', label: 'Emphasize concepts', description: 'Core laws and definitions', icon: 'focus' },
      { id: 'skip_setup', label: 'Skip history asides', description: 'Stay on the working theory', icon: 'scissors' },
      { id: 'expand_examples', label: 'Expand problems', description: 'More worked examples', icon: 'expand' },
    ],
    language: [
      { id: 'fundamentals', label: 'Emphasize speaking', description: 'Conversation patterns and phrases', icon: 'focus' },
      { id: 'skip_setup', label: 'Skip theory-heavy bits', description: 'Less abstract grammar essays', icon: 'scissors' },
      { id: 'expand_examples', label: 'Expand practice', description: 'More drills and dialogues', icon: 'expand' },
    ],
    general: [
      { id: 'fundamentals', label: 'Emphasize key ideas', description: 'Double down on what matters most', icon: 'focus' },
      { id: 'skip_setup', label: 'Skip tangents', description: 'Cut intros, ads, and digressions', icon: 'scissors' },
      { id: 'expand_examples', label: 'Expand examples', description: 'More concrete illustrations', icon: 'expand' },
    ],
  };
  return {
    id: 'topics',
    prompt: 'Any specific topics from the video to emphasize, skip, or expand on?',
    options: byNiche[niche],
  };
}

/** Build the adaptive follow-up set for a detected niche. */
export function buildFollowupQuestions(niche: VideoNiche): FollowupQuestion[] {
  return [
    audienceQuestion(niche),
    outcomeQuestion(niche),
    structureQuestion(),
    quizQuestion(niche),
    topicsQuestion(niche),
  ];
}

export type BuilderBrief = {
  niche: VideoNiche;
  videoTitle?: string;
  answers: FollowupAnswer[];
  notes: string;
};

export function answersToGenerationOptions(answers: FollowupAnswer[]): {
  options: CourseGenerationOptions;
  notes: string;
} {
  const byId = Object.fromEntries(answers.map((a) => [a.questionId, a.optionId]));
  const options: CourseGenerationOptions = { ...DEFAULT_GENERATION_OPTIONS };

  if (byId.audience === 'beginner') options.difficulty = 'Beginner';
  else if (byId.audience === 'advanced') options.difficulty = 'Advanced';
  else options.difficulty = 'Intermediate';

  if (byId.outcome === 'interview') options.courseStructure = 'exam_prep';
  else if (byId.outcome === 'build') options.courseStructure = 'bootcamp';
  else options.courseStructure = 'overview_deep_dive';

  if (byId.structure === 'follow') {
    options.moduleCount = 3;
    if (options.courseStructure === 'overview_deep_dive') options.courseStructure = 'standard';
  } else {
    options.moduleCount = 5;
  }

  if (byId.quizzes === 'end_only') options.questionsPerModule = 1;
  else if (byId.quizzes === 'heavy') options.questionsPerModule = 6;
  else options.questionsPerModule = 3;

  const noteParts: string[] = [];
  const outcome = answers.find((a) => a.questionId === 'outcome');
  if (outcome) noteParts.push(`Desired learner outcome: ${outcome.label}.`);
  const topics = answers.find((a) => a.questionId === 'topics');
  if (topics) {
    if (topics.optionId === 'fundamentals') noteParts.push('Emphasize core fundamentals and mental models.');
    else if (topics.optionId === 'skip_setup') noteParts.push('Skip fluff, setup digressions, and tangents.');
    else noteParts.push('Expand examples, practice, and worked walkthroughs.');
  }
  if (byId.structure === 'reorganize') {
    noteParts.push('Reorganize into clearer custom modules rather than mirroring video order.');
  } else if (byId.structure === 'follow') {
    noteParts.push("Follow the video's existing structure closely.");
  }

  const notes = noteParts.join(' ');
  return {
    options: { ...options, builderNotes: notes || undefined },
    notes,
  };
}

export function difficultyFromOption(id: string): CourseDifficulty {
  if (id === 'beginner') return 'Beginner';
  if (id === 'advanced') return 'Advanced';
  return 'Intermediate';
}

export function structureFromOption(id: string): CourseStructure {
  if (id === 'interview') return 'exam_prep';
  if (id === 'build') return 'bootcamp';
  return 'standard';
}
