export interface CourseStudentAnalyticsResponse {
  courseId: string;
  courseName: string;
  totalStudents: number;
  averageProgress: number;
  averageScore: number;
  studentsAtRisk: number;
  totalSubmissions?: number;
  gradedSubmissions?: number;
  recencyTrendDelta?: number;
  aiSummary?: string;
  students?: Array<{
    studentId: string;
    studentName: string;
    progress: number;
    averageScore: number;
    gradedSubmissions?: number;
    totalSubmissions?: number;
    trend?: string;
    improvementFocus?: string;
    confidence?: number;
    actions?: string[];
  }>;
  topPerformers: Array<{
    studentId: string;
    studentName: string;
    progress: number;
    averageScore: number;
  }>;
}

export interface AiStudyPlanResponse {
  studentId: string;
  courseId: string;
  currentProgress: number;
  recommendations: string[];
  focusAreas: string[];
  estimatedCompletionWeeks: number;
  rationale?: string;
  prioritizedGoals?: string[];
  weeklyTargets?: string[];
  recommendedLessons?: string[];
  recommendedLectures?: string[];
}

export interface PlatformStatistics {
  usersCount: number;
  coursesCount: number;
  enrollmentsCount: number;
  averageSubmissionScore: number;
}

export interface UserDetails {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  enrollments: Array<{
    id: string;
    courseId: string;
    courseTitle: string;
    enrolledAt: string;
    progress: number;
  }>;
  courses: Array<{
    id: string;
    title: string;
    createdAt: string;
    enrollmentsCount: number;
  }>;
  submissions: Array<{
    id: string;
    assessmentId: string;
    assessmentTitle: string;
    courseTitle: string;
    score: number | null;
    submittedAt: string;
  }>;
}
