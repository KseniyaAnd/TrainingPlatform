export interface Course {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  teacherId?: string;
  teacherName?: string;
  createdAt?: string;
}

export interface CourseEnrollment {
  enrollmentId: string;
  enrolledAt: string;
  course: Course;
}

export interface CourseWithEnrollment extends Course {
  isEnrolled: boolean;
  enrollmentId: string | null;
}

export interface CourseListPage {
  limit: number;
  returned: number;
  nextCursor?: string;
}

export interface CourseListResponse {
  items: Course[];
  page: CourseListPage;
  links?: Record<string, string>;
}

export interface CourseEnrollmentListResponse {
  items: CourseEnrollment[];
  page: CourseListPage;
  links?: Record<string, string>;
}
