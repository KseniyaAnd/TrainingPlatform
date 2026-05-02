export interface Assessment {
  id: string;
  courseId: string;
  lessonId?: string;
  lectureId?: string;
  title: string;
  description?: string | null;
  questions?: string[];
  answerKey?: string[];
  rubricCriteria?: string[];
  dueAt?: string | null;
}
