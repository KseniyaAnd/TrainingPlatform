// Old API models (deprecated)
export interface LectureProgress {
  lectureId: string;
  completed: boolean;
  completedAt?: string;
}

export interface LessonProgress {
  lessonId: string;
  completedLectures: number;
  totalLectures: number;
  isCompleted: boolean;
}

export interface CourseProgress {
  courseId: string;
  studentId: string;
  completedLectures: LectureProgress[];
  lessons: LessonProgress[];
  overallProgress: number; // 0-100
  lastAccessedAt?: string;
}

export interface CourseProgressResponseOld {
  progress: CourseProgress;
}

// New API models
export interface CourseProgressResponse {
  courseId: string;
  userId: string;
  totalLectures: number;
  completedLectures: number;
  progressPercent: number;
  completedLectureIds: string[];
  lastCompletedAt: string | null;
}
