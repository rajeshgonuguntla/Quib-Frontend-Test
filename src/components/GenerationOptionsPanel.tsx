import type { CourseDifficulty, CourseGenerationOptions, CourseStructure, ContentLanguage } from '../types/courseGeneration';
import {
  CONTENT_LANGUAGES,
  COURSE_STRUCTURES,
  DEFAULT_GENERATION_OPTIONS,
} from '../types/courseGeneration';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';

type GenerationOptionsPanelProps = {
  value: CourseGenerationOptions;
  onChange: (value: CourseGenerationOptions) => void;
};

const DIFFICULTIES: CourseDifficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

export function GenerationOptionsPanel({ value, onChange }: GenerationOptionsPanelProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Generation options</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="moduleCount">Modules ({value.moduleCount})</Label>
          <input
            id="moduleCount"
            type="range"
            min={2}
            max={8}
            value={value.moduleCount}
            onChange={(e) => onChange({ ...value, moduleCount: Number(e.target.value) })}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <select
            id="difficulty"
            value={value.difficulty}
            onChange={(e) => onChange({ ...value, difficulty: e.target.value as CourseDifficulty })}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
          >
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="questionsPerModule">Quiz questions / module ({value.questionsPerModule})</Label>
          <input
            id="questionsPerModule"
            type="range"
            min={1}
            max={10}
            value={value.questionsPerModule}
            onChange={(e) => onChange({ ...value, questionsPerModule: Number(e.target.value) })}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="courseStructure">Course structure</Label>
          <select
            id="courseStructure"
            value={value.courseStructure}
            onChange={(e) => onChange({ ...value, courseStructure: e.target.value as CourseStructure })}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
          >
            {COURSE_STRUCTURES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            {COURSE_STRUCTURES.find((s) => s.value === value.courseStructure)?.description}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contentLanguage">Course language</Label>
          <select
            id="contentLanguage"
            value={value.contentLanguage}
            onChange={(e) => onChange({ ...value, contentLanguage: e.target.value as ContentLanguage })}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
          >
            {CONTENT_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}

export function useDefaultGenerationOptions(): CourseGenerationOptions {
  return { ...DEFAULT_GENERATION_OPTIONS };
}
