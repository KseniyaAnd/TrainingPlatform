export interface Topic {
  id: string;
  lessonId: string;
  title: string;
  videoUrl?: string | null;
  content?: string | null;
}
