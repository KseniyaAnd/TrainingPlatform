export interface AssessmentStudentResponse {
  id: string;
  courseId: string;
  title: string;
  description: string;
  questions: string[];
  sourceType: string;
  sourceId: string;
  createdAt: string;
}

export interface AssessmentsPageResponse {
  items: AssessmentStudentResponse[];
  page: {
    limit: number;
    returned: number;
    nextCursor: string | null;
  };
  links: Record<string, string>;
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

export interface SubmissionsPageResponse {
  items: SubmissionResponse[];
  page: {
    limit: number;
    returned: number;
    nextCursor: string | null;
  };
  links: Record<string, string>;
}

export interface CreateSubmissionRequest {
  assessmentId: string;
  answerText: string;
}
