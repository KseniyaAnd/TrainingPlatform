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

      const questions = formValue.questions
        ? formValue.questions
            .split('\n')
            .map((q: string) => q.trim())
            .filter(Boolean)
        : [];
      const answerKey = formValue.answerKey
        ? formValue.answerKey
            .split('\n')
            .map((a: string) => a.trim())
            .filter(Boolean)
        : [];
      const rubricCriteria = formValue.rubricCriteria
        ? this.parseRubricCriteria(formValue.rubricCriteria)
        : [];

      // Проверяем, что массивы имеют одинаковую длину
      if (questions.length !== answerKey.length || questions.length !== rubricCriteria.length) {
        const minLength = Math.min(questions.length, answerKey.length, rubricCriteria.length);
        this.setError(
          `Количество вопросов (${questions.length}), ответов (${answerKey.length}) и критериев (${rubricCriteria.length}) должно совпадать. Будет использовано минимальное значение: ${minLength}`,
        );
        // Обрезаем до минимальной длины
        questions.splice(minLength);
        answerKey.splice(minLength);
        rubricCriteria.splice(minLength);
      }

      const payload = {
        courseId,
        title: formValue.title,
        description: formValue.description || '',
        questions,
        answerKey,
        rubricCriteria,
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
    console.log('🔍 Начало генерации assessment с AI');

    this.generatingWithAI.set(true);
    this.setError(null);

    try {
      const questionCount = this.form.controls['questionCount'].value;
      const difficulty = this.form.controls['difficulty'].value;

      console.log('🚀 Генерация assessment с AI:', { courseId, questionCount, difficulty });

      const draft = await firstValueFrom(
        this.dataService.generateAssessmentDraft({
          courseId,
          sourceType: 'LESSON', // По умолчанию для курсовых ассессментов
          sourceId: undefined, // Не привязан к конкретному уроку
          questionCount,
          difficulty,
        }),
      );

      console.log('✅ Получен черновик assessment:', draft);

      // Заполняем форму сгенерированными данными
      this.form.patchValue(
        {
          title: draft.title || '',
          description: draft.description || '',
          questions: this.joinLines(draft.questions ?? []),
          answerKey: this.joinLines(draft.answerKey ?? []),
          rubricCriteria: this.joinLines(draft.rubricCriteria ?? []),
        },
        { emitEvent: false },
      );
    } catch (e) {
      console.error('❌ Ошибка генерации assessment:', e);
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

  /**
   * Парсит критерии оценивания, группируя строки по номерам вопросов
   * Например:
   * "1. Вопрос 1 – 30 баллов.
   * - Критерий 1 – 15 баллов.
   * - Критерий 2 – 15 баллов.
   * 2. Вопрос 2 – 30 баллов."
   *
   * Превращается в:
   * ["1. Вопрос 1 – 30 баллов.\n- Критерий 1 – 15 баллов.\n- Критерий 2 – 15 баллов.",
   *  "2. Вопрос 2 – 30 баллов."]
   */
  private parseRubricCriteria(raw: string): string[] {
    const lines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const result: string[] = [];
    let currentGroup: string[] = [];

    for (const line of lines) {
      // Проверяем, начинается ли строка с номера (например, "1.", "2.", "3.")
      const startsWithNumber = /^\d+\./.test(line);

      if (startsWithNumber && currentGroup.length > 0) {
        // Начинается новая группа, сохраняем предыдущую
        result.push(currentGroup.join('\n'));
        currentGroup = [line];
      } else {
        // Продолжаем текущую группу
        currentGroup.push(line);
      }
    }

    // Добавляем последнюю группу
    if (currentGroup.length > 0) {
      result.push(currentGroup.join('\n'));
    }

    return result;
  }
}
