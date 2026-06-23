import type { CourseDifficulty, CourseGenerationOptions } from '../types/courseGeneration';
import { DEFAULT_GENERATION_OPTIONS } from '../types/courseGeneration';
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
      <CardContent className="grid gap-4 sm:grid-cols-3">
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
      </CardContent>
    </Card>
  );
}

export function useDefaultGenerationOptions(): CourseGenerationOptions {
  return { ...DEFAULT_GENERATION_OPTIONS };
}
