export interface AssessmentStudentResponse {
  id: string;
  courseId: string;
  title: string;
  description: string;
  questionsJson: string;
  createdAt: string;
}

export interface SubmissionResponse {
  id: string;
  assessmentId: string;
  studentId: string;
  answerText: string;
  score: number | null;
  submittedAt: string;
  gradedAt: string | null;
}

export interface CreateSubmissionRequest {
  assessmentId: string;
  answerText: string;
}
