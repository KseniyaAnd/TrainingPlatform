import { Location } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageModule } from 'primeng/message';

import { BackButtonComponent } from '../../../components/back-button/back-button';
import { Assessment } from '../../../models/assessment.model';
import { ButtonComponent } from '../../../shared/components/ui/button/button';
import { RoleCheckerService } from '../../../shared/services/role-checker.service';
import { CourseAnalyticsComponent } from './course-analytics/course-analytics';
import { CourseAssessmentsListComponent } from './course-assessments-list/course-assessments-list';
import { CourseHeaderComponent } from './course-header/course-header';
import { CourseLecturesSectionComponent } from './course-lectures-section/course-lectures-section';
import { CourseLessonsSectionComponent } from './course-lessons-section/course-lessons-section';
import { CourseChildComponentsService } from './services/course-child-components.service';
import { CourseDataLoaderService } from './services/course-data-loader.service';
import { CourseDetailsStateService } from './services/course-details-state.service';
import { CourseEnrollmentService } from './services/course-enrollment.service';
import { CourseOperationsService } from './services/course-operations.service';

@Component({
  selector: 'app-course-details-page',
  standalone: true,
  providers: [
    CourseDataLoaderService,
    CourseEnrollmentService,
    CourseDetailsStateService,
    CourseOperationsService,
    CourseChildComponentsService,
  ],
  imports: [
    RouterModule,
    ReactiveFormsModule,
    MessageModule,
    BackButtonComponent,
    CourseHeaderComponent,
    CourseLessonsSectionComponent,
    CourseLecturesSectionComponent,
    CourseAnalyticsComponent,
    CourseAssessmentsListComponent,
    ButtonComponent,
  ],
  templateUrl: './course-details.html',
})
export class CourseDetailsPage {
  readonly courseId: string;

  // ── Services ──────────────────────────────────────────────────────────────
  private readonly dataLoader = inject(CourseDataLoaderService);
  private readonly enrollment = inject(CourseEnrollmentService);
  private readonly operations = inject(CourseOperationsService);
  private readonly childComponents = inject(CourseChildComponentsService);
  readonly state = inject(CourseDetailsStateService);
  private readonly roleChecker = inject(RoleCheckerService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly isStudent = this.roleChecker.isStudent;
  readonly canEditCourse = this.roleChecker.canManageCourses;

  // ── Expose services for template ──────────────────────────────────────────
  readonly loading = this.dataLoader.loading;
  readonly error = this.dataLoader.error;
  readonly subscribed = this.enrollment.subscribed;
  readonly enrolling = this.enrollment.enrolling;
  readonly enrollmentError = this.enrollment.enrollmentError;

  // ── ViewChildren ──────────────────────────────────────────────────────────
  @ViewChild(CourseLessonsSectionComponent)
  set lessonsSection(component: CourseLessonsSectionComponent | undefined) {
    this.childComponents.registerLessonsSection(component);
  }

  @ViewChild(CourseAssessmentsListComponent)
  set assessmentsListComponent(component: CourseAssessmentsListComponent | undefined) {
    this.childComponents.registerAssessmentsList(component);
  }

  constructor(route: ActivatedRoute) {
    this.courseId = route.snapshot.paramMap.get('courseId') ?? '';
    void this.loadCourse();
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  /**
   * Загрузить данные курса
   */
  private async loadCourse(): Promise<void> {
    if (!this.courseId) return;

    // Для студентов сначала проверяем статус подписки
    if (this.isStudent()) {
      await this.enrollment.checkEnrollmentStatus(this.courseId);

      // Если не подписан, загружаем только базовую информацию о курсе (без уроков/лекций)
      if (!this.enrollment.subscribed()) {
        const data = await this.dataLoader.loadCourseData(this.courseId, false, false);
        if (data) {
          this.state.setCourseData(data);
        } else {
          // Если не удалось загрузить даже базовую информацию (403),
          // создаём минимальный объект курса для отображения заглушки
          console.log(
            'Не удалось загрузить информацию о курсе (403), показываем заглушку подписки',
          );
          // Не устанавливаем данные курса, чтобы показать только заглушку
        }
        return;
      }
    }

    // Загружаем полные данные курса
    const data = await this.dataLoader.loadCourseData(this.courseId, this.isStudent(), true);

    if (data) {
      this.state.setCourseData(data);
    } else if (this.dataLoader.error()) {
      // Обработка ошибок авторизации
      const errorMsg = this.dataLoader.error();
      // Перенаправляем на логин только если пользователь не авторизован (401)
      if (errorMsg?.includes('401')) {
        await this.router.navigate(['/login'], {
          queryParams: { returnUrl: `/courses/${this.courseId}` },
        });
      }
    }
  }

  // ── Enrollment ────────────────────────────────────────────────────────────

  /**
   * Подписаться на курс
   */
  async toggleSubscribe(): Promise<void> {
    // Только студенты могут подписываться на курсы
    if (!this.isStudent()) {
      console.warn('Только студенты могут подписываться на курсы');
      return;
    }

    const success = await this.enrollment.enroll(this.courseId);
    if (success) {
      await this.loadCourse();
    }
  }

  /**
   * Отписаться от курса
   */
  async unsubscribe(): Promise<void> {
    // Только студенты могут отписываться от курсов
    if (!this.isStudent()) {
      console.warn('Только студенты могут отписываться от курсов');
      return;
    }

    const enrollmentId = this.enrollment.enrollmentId();
    if (!enrollmentId) {
      this.state.setSubmitError('Enrollment ID not found');
      return;
    }

    const success = await this.enrollment.unenroll(enrollmentId);
    if (success) {
      await this.loadCourse();
    }
  }

  // ── Course edit ───────────────────────────────────────────────────────────

  /**
   * Открыть форму редактирования курса
   */
  openEditCourse(): void {
    this.state.openEditForm();
  }

  /**
   * Отменить редактирование курса
   */
  cancelCourseForm(): void {
    this.state.closeEditForm();
    this.childComponents.cancelAllForms();
  }

  /**
   * Открыть форму добавления урока
   */
  openAddLesson(): void {
    this.childComponents.openAddLesson();
  }

  /**
   * Сохранить изменения курса
   */
  async submitCourse(): Promise<void> {
    await this.operations.submitCourse(this.courseId);
  }

  /**
   * Удалить курс
   */
  async deleteCourse(): Promise<void> {
    await this.operations.deleteCourse(this.courseId);
  }

  // ── Tab ───────────────────────────────────────────────────────────────────

  /**
   * Переключить вкладку
   */
  switchTab(tab: 'content' | 'analytics'): void {
    this.state.switchTab(tab);
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  /**
   * Вернуться назад
   */
  goBack(): void {
    this.location.back();
  }

  // ── Assessment handlers ───────────────────────────────────────────────────

  /**
   * Обработать изменение списка assessments
   */
  onAssessmentsChange(newAssessments: Assessment[]): void {
    this.state.updateAssessments(newAssessments);
  }

  /**
   * Перезагрузить прогресс курса
   */
  async reloadProgress(): Promise<void> {
    if (!this.isStudent()) return;

    const progress = await this.dataLoader.loadCourseProgress(this.courseId);
    if (progress) {
      this.state.setCourseProgress(progress);
    }
  }
}
