import { Injectable } from '@angular/core';

import { CourseProgressResponse } from '../../../../../models/progress.model';
import {
  AssessmentStudentResponse,
  SubmissionResponse,
} from '../../../../../models/submission.model';
import { LessonWithLectures } from '../../../../../models/lesson-with-lectures.model';

/**
 * Сервис-хелпер для вычисления прогресса студента
 */
@Injectable()
export class StudentProgressHelperService {
  /**
   * Получить прогресс по уроку
   */
  getLessonProgress(
    lesson: LessonWithLectures,
    courseProgress: CourseProgressResponse | null,
  ): { completed: number; total: number } {
    if (!courseProgress) return { completed: 0, total: 0 };

    const total = lesson.lectures?.length ?? 0;
    const completed =
      lesson.lectures?.filter((lec) => courseProgress.completedLectureIds.includes(lec.id))
        .length ?? 0;

    return { completed, total };
  }

  /**
   * Проверить, завершена ли лекция
   */
  isLectureCompleted(lectureId: string, courseProgress: CourseProgressResponse | null): boolean {
    return courseProgress?.completedLectureIds.includes(lectureId) ?? false;
  }

  /**
   * Получить общий прогресс
   */
  getOverallProgress(courseProgress: CourseProgressResponse | null): number {
    return courseProgress?.progressPercent ?? 0;
  }

  /**
   * Получить assessments для лекции
   */
  getAssessmentsForLecture(
    lectureId: string,
    studentAssessments: AssessmentStudentResponse[],
  ): AssessmentStudentResponse[] {
    return studentAssessments.filter((a) => a.sourceId === lectureId && a.sourceType === 'LECTURE');
  }

  /**
   * Получить submission для assessment
   */
  getSubmission(
    assessmentId: string,
    submissions: SubmissionResponse[],
  ): SubmissionResponse | null {
    return submissions.find((s) => s.assessmentId === assessmentId) ?? null;
  }
}
