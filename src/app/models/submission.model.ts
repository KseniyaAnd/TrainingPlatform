export interface AssessmentStudentResponse {
  id: string;
  courseId: string;
  title: string;
  description: string;
  questions: string[];
  answerKey?: string[];
  rubricCriteria?: string[];
  sourceType: string;
  sourceId: string;
  createdAt: string;
  // Сырые JSON-поля от API
  questionsJson?: string;
  answerKeyJson?: string;
  rubricJson?: string;
}

/**
 * Парсит JSON-поля из API ответа в массивы для студенческого ответа
 */
export function parseAssessmentStudentJsonFields(
  raw: AssessmentStudentResponse,
): AssessmentStudentResponse {
  const parsed: AssessmentStudentResponse = { ...raw };

  // Парсим questionsJson -> questions
  if (raw.questionsJson && typeof raw.questionsJson === 'string') {
    try {
      parsed.questions = JSON.parse(raw.questionsJson);
    } catch (e) {
      console.warn('Failed to parse questionsJson:', e);
      parsed.questions = [];
    }
  }

  // Парсим answerKeyJson -> answerKey
  if (raw.answerKeyJson && typeof raw.answerKeyJson === 'string') {
    try {
      parsed.answerKey = JSON.parse(raw.answerKeyJson);
    } catch (e) {
      console.warn('Failed to parse answerKeyJson:', e);
      parsed.answerKey = [];
    }
  }

  // Парсим rubricJson -> rubricCriteria
  if (raw.rubricJson && typeof raw.rubricJson === 'string') {
    try {
      parsed.rubricCriteria = JSON.parse(raw.rubricJson);
    } catch (e) {
      console.warn('Failed to parse rubricJson:', e);
      parsed.rubricCriteria = [];
    }
  }

  return parsed;
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
