import { Injectable } from '@angular/core';
import { UserDetails } from '../../models/analytics.model';

/**
 * Сервис для работы с аналитикой пользователей
 */
@Injectable({
  providedIn: 'root',
})
export class UserAnalyticsService {
  /**
   * Обогатить данные пользователя информацией о курсах
   */
  enrichUserDetails(details: UserDetails): UserDetails {
    // Создаем мапу курсов: courseId -> title
    const courseTitlesMap = new Map(details.enrolledCourses.map((c) => [c.id, c.title]));

    // Обогащаем enrollments названиями курсов
    const enrichedEnrollments = details.enrollments.map((enrollment) => ({
      ...enrollment,
      courseTitle: courseTitlesMap.get(enrollment.courseId) || 'Неизвестный курс',
    }));

    // Обогащаем submissions
    const courseTitle =
      details.enrolledCourses.length > 0 ? details.enrolledCourses[0].title : 'Неизвестный курс';

    const enrichedSubmissions = details.submissions.map((submission) => ({
      ...submission,
      assessmentTitle: submission.assessmentTitle || 'Задание',
      courseTitle: submission.courseTitle || courseTitle,
    }));

    return {
      ...details,
      enrollments: enrichedEnrollments,
      submissions: enrichedSubmissions,
    };
  }

  /**
   * Вычислить средний балл студента
   */
  calculateAverageScore(details: UserDetails | null): string {
    if (!details || details.submissions.length === 0) {
      return 'Нет оценок';
    }

    const scores = details.submissions
      .filter((s) => s.score !== null)
      .map((s) => s.score as number);

    if (scores.length === 0) {
      return 'Нет оценок';
    }

    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return average.toFixed(1);
  }

  /**
   * Получить severity для отображения оценки
   */
  getScoreSeverity(score: number): 'success' | 'warn' | 'danger' {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warn';
    return 'danger';
  }
}
