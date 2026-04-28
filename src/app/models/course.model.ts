export interface Course {
  id: string;
  title: string;
  description?: string;
  teacherId?: string;
  createdAt?: string;
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
