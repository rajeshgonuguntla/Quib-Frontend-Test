# Course builder follow-ups

**Status:** Implemented in `src/utils/courseBuilderFollowups.ts` (this skill was missing from the repo; that module is the live source of truth).

## Flow

1. User submits a YouTube URL (dashboard / landing after sign-in).
2. App routes to `/course-builder`.
3. Fetch oEmbed title/author → `detectNiche()`.
4. Ask 5 adaptive questions, one at a time, **tappable option cards** (honen-style).
5. Map answers → `CourseGenerationOptions` (+ `builderNotes`) → `/course-details` generation.

## Niche detection

Keyword score over title + author + URL. Niches: `programming`, `ai_ml`, `business`, `fitness`, `creative`, `science`, `language`, `general`.

## Core questions (always)

1. Audience → difficulty  
2. Outcome → course structure  
3. Follow video vs reorganize → module count  
4. Quizzes per module / end / heavy → questionsPerModule  
5. Emphasize / skip / expand → builderNotes  

Wording and option copy adapt per niche.
