export interface Lecture {
  id: string;
  lessonId: string;
  title: string;
  videoUrl?: string | null;
  content?: string | null;
}
