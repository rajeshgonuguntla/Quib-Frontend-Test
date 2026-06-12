export interface UserProfile {
  id?: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  certificateDisplayName?: string;
  defaultDifficulty?: string;
  defaultQuestionCount?: number;
  defaultTimedExam?: boolean;
  defaultQuestionTypes?: Record<string, boolean>;
  theme?: string;
}
