export interface Assessment {
  id: string;
  courseId: string;
  lessonId?: string;
  lectureId?: string;
  // API возвращает sourceType и sourceId вместо lessonId/lectureId
  sourceType?: 'LESSON' | 'LECTURE' | string;
  sourceId?: string;
  title: string;
  description?: string | null;
  questions?: string[];
  answerKey?: string[];
  rubricCriteria?: string[];
  dueAt?: string | null;
  createdAt?: string;
}
