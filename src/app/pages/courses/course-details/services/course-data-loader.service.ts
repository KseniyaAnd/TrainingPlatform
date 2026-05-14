import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Assessment } from '../../../../models/assessment.model';
import { Course } from '../../../../models/course.model';
import { Lecture } from '../../../../models/lecture.model';
import { LessonWithLectures } from '../../../../models/lesson-with-lectures.model';
import { Lesson } from '../../../../models/lesson.model';
import { CourseProgressResponse } from '../../../../models/progress.model';
import { AssessmentStudentResponse, SubmissionResponse } from '../../../../models/submission.model';
import { CourseDataService } from '../../../../services/courses/course-data.service';

/**
 * Интерфейс для данных курса
 */
export interface CourseData {
  course: Course;
  lessons: LessonWithLectures[];
  assessments?: Assessment[];
  studentAssessments?: AssessmentStudentResponse[];
  submissions?: SubmissionResponse[];
  progress?: CourseProgressResponse | null;
}

/**
 * Сервис для загрузки данных курса
 * Отвечает за: загрузку курса, уроков, лекций, assessments, прогресса
 */
@Injectable()
export class CourseDataLoaderService {
  private readonly dataService = inject(CourseDataService);

  // State
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /**
   * Загрузить все данные курса
   * @param courseId ID курса
   * @param isStudent true если загружаем для студента
   * @param loadFullData true если загружать полные данные (уроки, лекции и т.д.)
   * @returns CourseData или null если ошибка
   */
  async loadCourseData(
    courseId: string,
    isStudent: boolean,
    loadFullData: boolean = true,
  ): Promise<CourseData | null> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const course = await firstValueFrom(this.dataService.getCourse(courseId));

      // Если не нужны полные данные, возвращаем только базовую информацию о курсе
      if (!loadFullData) {
        return {
          course,
          lessons: [],
        };
      }

      if (isStudent) {
        return await this.loadStudentData(courseId, course);
      } else {
        return await this.loadTeacherData(courseId, course);
      }
    } catch (e: any) {
      // Для 403 (Forbidden) не устанавливаем ошибку - это нормально для неподписанного студента
      // Для других ошибок устанавливаем сообщение об ошибке
      const status = e?.status;
      if (status === 403) {
        console.log('403 Forbidden - студент не подписан на курс');
        // Не устанавливаем error, чтобы показать заглушку подписки
        return null;
      } else {
        this.error.set(e instanceof Error ? e.message : 'Failed to load course');
        return null;
      }
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Загрузить данные для студента
   */
  private async loadStudentData(courseId: string, course: Course): Promise<CourseData> {
    const [lessons, studentAssessments, submissions, progress] = await Promise.all([
      firstValueFrom(this.dataService.getLessons(courseId)).catch(() => [] as Lesson[]),
      firstValueFrom(this.dataService.getAssessmentsForStudent(courseId)).catch(
        () => [] as AssessmentStudentResponse[],
      ),
      firstValueFrom(this.dataService.getMySubmissions()).catch(() => [] as SubmissionResponse[]),
      firstValueFrom(this.dataService.getCourseProgress(courseId)).catch(
        () => null as CourseProgressResponse | null,
      ),
    ]);

    console.log('📚 Загружен список студенческих assessments:', studentAssessments);

    const lessonsWithLectures = await this.loadLessonsWithLectures(lessons);

    return {
      course,
      lessons: lessonsWithLectures,
      studentAssessments,
      submissions,
      progress,
    };
  }

  /**
   * Загрузить данные для преподавателя
   */
  private async loadTeacherData(courseId: string, course: Course): Promise<CourseData> {
    const [lessons, assessmentsList] = await Promise.all([
      firstValueFrom(this.dataService.getLessons(courseId)),
      firstValueFrom(this.dataService.getAssessments(courseId)),
    ]);

    console.log('📚 Загружен список assessments:', assessmentsList);

    // Загружаем полные данные для каждого assessment
    const assessments = await Promise.all(
      (assessmentsList ?? []).map(async (assessment) => {
        try {
          const fullAssessment = await firstValueFrom(
            this.dataService.getAssessmentDetails(assessment.id),
          );
          console.log(`✅ Загружены детали assessment ${assessment.id}:`, fullAssessment);
          return fullAssessment;
        } catch (e) {
          console.warn(
            `⚠️ Не удалось загрузить детали assessment ${assessment.id}, используем данные из списка:`,
            e,
          );
          return assessment;
        }
      }),
    );

    console.log('📚 Все assessments с полными данными:', assessments);

    const lessonsWithLectures = await this.loadLessonsWithLectures(lessons);

    return {
      course,
      lessons: lessonsWithLectures,
      assessments,
    };
  }

  /**
   * Загрузить уроки с лекциями
   */
  private async loadLessonsWithLectures(lessons: Lesson[]): Promise<LessonWithLectures[]> {
    return Promise.all(
      lessons.map(async (lesson) => {
        const lectures = await firstValueFrom(this.dataService.getLectures(lesson.id)).catch(
          () => [] as Lecture[],
        );

        return {
          ...lesson,
          kind: lesson.kind ?? 'lesson',
          lectures: lectures ?? [],
        };
      }),
    );
  }

  /**
   * Загрузить прогресс курса для студента
   */
  async loadCourseProgress(courseId: string): Promise<CourseProgressResponse | null> {
    try {
      return await firstValueFrom(this.dataService.getCourseProgress(courseId));
    } catch (e) {
      console.warn('⚠️ Не удалось загрузить прогресс курса:', e);
      return null;
    }
  }

  /**
   * Сбросить состояние сервиса
   */
  reset(): void {
    this.loading.set(false);
    this.error.set(null);
  }
}
