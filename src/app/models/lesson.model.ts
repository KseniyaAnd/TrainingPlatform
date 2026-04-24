export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  kind: 'lecture' | 'lesson';
  content?: string | null;
}
