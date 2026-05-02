export interface StudentAnalytics {
  studentId: string;
  totalSubmissions: number;
  gradedSubmissions: number;
  averageScore: number;
  trend: 'improving' | 'declining' | 'stable';
  improvementFocus: string;
  confidence: number;
  actions: string[];
}

export interface CourseStudentAnalyticsResponse {
  courseId: string;
  averageScore: number;
  totalSubmissions: number;
  gradedSubmissions: number;
  recencyTrendDelta: number;
  aiSummary: string;
  students: StudentAnalytics[];
}
