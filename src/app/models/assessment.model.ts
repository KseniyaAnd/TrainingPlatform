export interface Assessment {
  id: string;
  courseId: string;
  lessonId?: string;
  lectureId?: string;
  // API возвращает sourceType и sourceId вместо lessonId/lectureId
  sourceType?: 'LESSON' | 'LECTURE' | string;
  sourceId?: string;
  title: string;
  description?: string | null;
  questions?: string[];
  answerKey?: string[];
  rubricCriteria?: string[];
  dueAt?: string | null;
  createdAt?: string;
  // Сырые JSON-поля от API
  questionsJson?: string;
  answerKeyJson?: string;
  rubricJson?: string;
}

/**
 * Парсит JSON-поля из API ответа в массивы
 */
export function parseAssessmentJsonFields(raw: Assessment): Assessment {
  const parsed: Assessment = { ...raw };

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
