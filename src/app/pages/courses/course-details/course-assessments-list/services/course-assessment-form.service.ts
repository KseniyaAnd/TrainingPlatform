import { inject, Injectable, signal } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Assessment } from '../../../../../models/assessment.model';
import { AssessmentDifficulty } from '../../../../../services/courses/course-content.service';
import { CourseDataService } from '../../../../../services/courses/course-data.service';
import { BaseFormService } from '../../../../../shared/services/base-form.service';

/**
 * Сервис для управления формой assessment на уровне курса
 */
@Injectable()
export class CourseAssessmentFormService extends BaseFormService<Assessment> {
  private readonly dataService = inject(CourseDataService);

  // AI generation state
  readonly generatingWithAI = signal(false);

  createForm(data?: Assessment): FormGroup {
    return this.fb.nonNullable.group({
      title: [data?.title ?? '', [Validators.required, Validators.minLength(3)]],
      description: [data?.description ?? ''],
      questions: [this.joinLines(data?.questions ?? [])],
      answerKey: [this.joinLines(data?.answerKey ?? [])],
      rubricCriteria: [this.joinLines(data?.rubricCriteria ?? [])],
      generateWithAI: [false],
      questionCount: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
      difficulty: ['MEDIUM' as AssessmentDifficulty, Validators.required],
    });
  }

  readonly form = this.createForm();

  /**
   * Открыть форму добавления assessment
   */
  openAddAssessment(): void {
    super.openAdd();
    this.form.reset({
      title: '',
      description: '',
      questions: '',
      answerKey: '',
      rubricCriteria: '',
      generateWithAI: false,
      questionCount: 3,
      difficulty: 'MEDIUM',
    });
  }

  /**
   * Открыть форму редактирования assessment
   */
  openEditAssessment(assessment: Assessment): void {
    super.openEdit(assessment.id);
    this.form.reset({
      title: assessment.title ?? '',
      description: assessment.description ?? '',
      questions: this.joinLines(assessment.questions ?? []),
      answerKey: this.joinLines(assessment.answerKey ?? []),
      rubricCriteria: this.joinLines(assessment.rubricCriteria ?? []),
      generateWithAI: false,
      questionCount: 3,
      difficulty: 'MEDIUM',
    });
  }

  /**
   * Сохранить assessment (создать или обновить)
   */
  async submit(courseId: string, currentAssessments: Assessment[]): Promise<Assessment[] | null> {
    if (this.form.invalid || this.submitting()) return null;

    this.setError(null);
    try {
      this.setSubmitting(true);
      const formValue = this.form.getRawValue();
      const payload = {
        courseId,
        title: formValue.title,
        description: formValue.description || '',
        questions: formValue.questions
          ? formValue.questions.split('\n').filter((q: string) => q.trim())
          : [],
        answerKey: formValue.answerKey
          ? formValue.answerKey.split('\n').filter((a: string) => a.trim())
          : [],
        rubricCriteria: formValue.rubricCriteria
          ? formValue.rubricCriteria.split('\n').filter((r: string) => r.trim())
          : [],
      };

      const editingId = this.editingId();
      if (editingId) {
        // Update existing
        const updated = await firstValueFrom(this.dataService.updateAssessment(editingId, payload));
        this.cancel();
        return currentAssessments.map((a) => (a.id === editingId ? updated : a));
      } else {
        // Create new - добавляем в начало списка
        const created = await firstValueFrom(this.dataService.createAssessment(payload));
        this.cancel();
        return [created, ...currentAssessments];
      }
    } catch (e) {
      this.setError(this.handleError(e));
      return null;
    } finally {
      this.setSubmitting(false);
    }
  }

  /**
   * Удалить assessment
   */
  async deleteAssessment(
    assessmentId: string,
    currentAssessments: Assessment[],
  ): Promise<Assessment[] | null> {
    if (!confirm('Удалить assessment?')) return null;

    try {
      this.setSubmitting(true);
      await firstValueFrom(this.dataService.deleteAssessment(assessmentId));
      this.cancel();
      return currentAssessments.filter((a) => a.id !== assessmentId);
    } catch (e) {
      this.setError(this.handleError(e));
      return null;
    } finally {
      this.setSubmitting(false);
    }
  }

  /**
   * Сгенерировать assessment с помощью AI
   */
  async generateAssessmentWithAI(courseId: string): Promise<void> {
    const title = this.form.controls['title'].value.trim();

    if (!title) {
      this.setError('Пожалуйста, введите название assessment перед генерацией');
      return;
    }

    this.generatingWithAI.set(true);
    this.setError(null);

    try {
      const questionCount = this.form.controls['questionCount'].value;
      const difficulty = this.form.controls['difficulty'].value;

      const draft = await firstValueFrom(
        this.dataService.generateAssessmentDraft({
          courseId,
          questionCount,
          difficulty,
        }),
      );

      // Заполняем форму сгенерированными данными
      this.form.patchValue(
        {
          title: draft.title || title,
          description: draft.description,
          questions: this.joinLines(draft.questions ?? []),
          answerKey: this.joinLines(draft.answerKey ?? []),
          rubricCriteria: this.joinLines(draft.rubricCriteria ?? []),
        },
        { emitEvent: false },
      );
    } catch (e) {
      this.setError('Не удалось сгенерировать assessment с помощью AI');
    } finally {
      this.generatingWithAI.set(false);
    }
  }

  /**
   * Объединить массив строк в текст с переносами
   */
  private joinLines(items: string[]): string {
    return (items ?? []).join('\n');
  }
}
