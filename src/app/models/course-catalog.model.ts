import { Course } from './course.model';

export interface CourseCatalogLectureResponse {
  id: string;
  lessonId: string;
  title: string;
  videoUrl?: string;
  content?: string;
}

export interface CourseCatalogLessonResponse {
  id: string;
  courseId: string;
  title: string;
  content?: string;
  lectures: CourseCatalogLectureResponse[];
}

export interface CourseCatalogDetailsResponse {
  course: Course;
  lessons: CourseCatalogLessonResponse[];
}
