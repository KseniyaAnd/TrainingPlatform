import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { catchError, forkJoin, of } from 'rxjs';
import { CourseCatalogDetailsResponse } from '../../../models/course-catalog.model';
import { Lecture } from '../../../models/lecture.model';
import { Lesson } from '../../../models/lesson.model';
import { CourseProgressResponse } from '../../../models/progress.model';
import { AssessmentStudentResponse, SubmissionResponse } from '../../../models/submission.model';
import { AuthStateService } from '../../../services/auth/auth-state.service';
import { CourseCatalogService } from '../../../services/course-catalog/course-catalog.service';
import { CourseContentService } from '../../../services/courses/course-content.service';
import { ProgressService } from '../../../services/progress/progress.service';
import { SubmissionsService } from '../../../services/submissions/submissions.service';

@Component({
  selector: 'app-course-student-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    MessageModule,
    ProgressBarModule,
    SkeletonModule,
    TagModule,
  ],
  templateUrl: './course-student-view.html',
  styleUrls: ['./course-student-view.css'],
})
export class CourseStudentViewPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogService = inject(CourseCatalogService);
  private readonly contentService = inject(CourseContentService);
  private readonly progressService = inject(ProgressService);
  private readonly submissionsService = inject(SubmissionsService);
  private readonly authState = inject(AuthStateService);
  private readonly fb = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);

  readonly courseId = signal<string>('');
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly courseDetail = signal<CourseCatalogDetailsResponse | null>(null);
  readonly lessons = signal<Lesson[]>([]);
  readonly lecturesByLesson = signal<Map<string, Lecture[]>>(new Map());
  readonly progress = signal<CourseProgressResponse | null>(null);
  readonly assessments = signal<AssessmentStudentResponse[]>([]);
  readonly submissions = signal<SubmissionResponse[]>([]);
  readonly assessmentsLoadError = signal(false);
  readonly submissionsLoadError = signal(false);

  readonly markingLecture = signal<string | null>(null);
  readonly showAssessmentDialog = signal(false);
  readonly selectedAssessment = signal<AssessmentStudentResponse | null>(null);
  readonly submittingAssessment = signal(false);
  readonly expandedLessons = signal<Set<number>>(new Set());

  readonly assessmentForm = this.fb.nonNullable.group({
    answerText: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('courseId');
    if (!courseId) {
      this.error.set('Course ID not found');
      this.isLoading.set(false);
      return;
    }

    this.courseId.set(courseId);
    this.loadCourseData();
  }

  private loadCourseData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.assessmentsLoadError.set(false);
    this.submissionsLoadError.set(false);

    forkJoin({
      courseDetail: this.catalogService.getCourseCatalogDetails(this.courseId()),
      lessons: this.contentService.getLessonsByCourseId(this.courseId()),
      progress: this.progressService.getCourseProgress(this.courseId()),
      assessments: this.submissionsService.getCourseAssessments(this.courseId()).pipe(
        catchError((err) => {
          console.warn('Failed to load assessments:', err);
          this.assessmentsLoadError.set(true);
          return of([]);
        }),
      ),
      submissions: this.submissionsService.getMySubmissions().pipe(
        catchError((err) => {
          console.warn('Failed to load submissions:', err);
          this.submissionsLoadError.set(true);
          return of([]);
        }),
      ),
    }).subscribe({
      next: (data) => {
        this.courseDetail.set(data.courseDetail);
        this.lessons.set(data.lessons);
        this.progress.set(data.progress);
        this.assessments.set(data.assessments);
        this.submissions.set(data.submissions);

        // Load lectures for each lesson
        this.loadLecturesForLessons(data.lessons);
      },
      error: (err) => {
        this.error.set(err?.message || 'Failed to load course data');
        this.isLoading.set(false);
      },
    });
  }

  private loadLecturesForLessons(lessons: Lesson[]): void {
    if (lessons.length === 0) {
      this.isLoading.set(false);
      return;
    }

    const lectureRequests = lessons.map((lesson) =>
      this.contentService.getLecturesByLessonId(lesson.id).pipe(
        catchError((err) => {
          console.warn(`Failed to load lectures for lesson ${lesson.id}:`, err);
          return of([]);
        }),
      ),
    );

    forkJoin(lectureRequests).subscribe({
      next: (lecturesArrays) => {
        const lecturesMap = new Map<string, Lecture[]>();
        lessons.forEach((lesson, index) => {
          lecturesMap.set(lesson.id, lecturesArrays[index]);
        });
        this.lecturesByLesson.set(lecturesMap);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load lectures:', err);
        this.isLoading.set(false);
      },
    });
  }

  isLectureCompleted(lectureId: string): boolean {
    const prog = this.progress();
    return prog?.completedLectureIds.includes(lectureId) ?? false;
  }

  toggleLesson(index: number): void {
    const expanded = this.expandedLessons();
    const newExpanded = new Set(expanded);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    this.expandedLessons.set(newExpanded);
  }

  isLessonExpanded(index: number): boolean {
    return this.expandedLessons().has(index);
  }

  async markLectureAsCompleted(lectureId: string): Promise<void> {
    if (this.markingLecture() || this.isLectureCompleted(lectureId)) return;

    // Get userId from auth state (internal DB ID, not Keycloak sub)
    const userId = this.authState.getUserId();
    if (!userId) {
      console.error('Internal userId not found. User needs to re-login.');
      alert('User ID не найден. Пожалуйста, выйдите и войдите заново.');
      return;
    }

    console.log('Marking lecture as completed:', {
      courseId: this.courseId(),
      userId,
      lectureId,
    });

    this.markingLecture.set(lectureId);

    this.progressService.markLectureCompleted(this.courseId(), userId, lectureId).subscribe({
      next: (updatedProgress) => {
        // Update progress with the response from the server
        this.progress.set(updatedProgress);
        this.markingLecture.set(null);
        console.log('Lecture marked as completed successfully');
      },
      error: (err) => {
        console.error('Failed to mark lecture as completed:', err);

        let errorMessage = 'Не удалось отметить лекцию как просмотренную';

        if (err?.status === 404) {
          if (err?.error?.detail?.includes('User not found')) {
            errorMessage = 'Ваш профиль не найден в системе. Обратитесь к администратору.';
          } else if (err?.error?.detail?.includes('Enrollment not found')) {
            errorMessage = 'Вы не записаны на этот курс. Запишитесь на курс сначала.';
          }
        } else if (err?.status === 500 && err?.error?.detail?.includes('enrollment')) {
          errorMessage = 'Ошибка проверки подписки. Убедитесь, что вы записаны на курс.';
        }

        alert(`${errorMessage} (Код: ${err?.status || 'unknown'})`);
        this.markingLecture.set(null);
      },
    });
  }

  getLessonLectures(lessonId: string): Lecture[] {
    return this.lecturesByLesson().get(lessonId) ?? [];
  }

  getLessonAssessments(lesson: Lesson): AssessmentStudentResponse[] {
    return this.assessments().filter((a) => a.courseId === this.courseId());
  }

  getSubmissionForAssessment(assessmentId: string): SubmissionResponse | null {
    return this.submissions().find((s) => s.assessmentId === assessmentId) ?? null;
  }

  openAssessmentDialog(assessment: AssessmentStudentResponse): void {
    this.selectedAssessment.set(assessment);
    this.assessmentForm.reset({ answerText: '' });
    this.showAssessmentDialog.set(true);
  }

  closeAssessmentDialog(): void {
    this.showAssessmentDialog.set(false);
    this.selectedAssessment.set(null);
    this.assessmentForm.reset();
  }

  getAssessmentQuestions(assessment: AssessmentStudentResponse): string[] {
    return assessment.questions ?? [];
  }

  submitAssessment(): void {
    if (this.assessmentForm.invalid || this.submittingAssessment()) return;

    const assessment = this.selectedAssessment();
    if (!assessment) return;

    this.submittingAssessment.set(true);

    this.submissionsService
      .createSubmission({
        assessmentId: assessment.id,
        answerText: this.assessmentForm.controls.answerText.value,
      })
      .subscribe({
        next: (submission) => {
          // Add new submission to the list
          this.submissions.update((subs) => [...subs, submission]);
          this.submittingAssessment.set(false);
          this.closeAssessmentDialog();
        },
        error: (err) => {
          console.error('Failed to submit assessment:', err);
          this.submittingAssessment.set(false);
        },
      });
  }

  getSafeVideoUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
