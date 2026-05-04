import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Assessment } from '../../../../../models/assessment.model';
import {
  AssessmentDifficulty,
  AssessmentDraftResponse,
  GenerateAssessmentDraftRequest,
} from '../../../../../services/courses/course-content.service';
import { CourseDetailsDataService } from '../../course-details-data.service';

/**
 * Сервис для управления формой assessment с AI генерацией
 */
@Injectable()
export class AssessmentFormService {
  private readonly dataService = inject(CourseDetailsDataService);
  private readonly fb = inject(FormBuilder);

  readonly showForm = signal(false);
  readonly lectureId = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  // AI generation state
  readonly useAi = signal(false);
  readonly isDraftMode = signal(false);
  readonly draft = signal<AssessmentDraftResponse | null>(null);
  readonly generatingDraft = signal(false);
  readonly aiQuestionCount = signal(5);
  readonly aiDifficulty = signal<AssessmentDifficulty>('MEDIUM');

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(3)]],
    questionsText: ['', [Validators.required]],
    answerKeyText: ['', [Validators.required]],
    rubricCriteriaText: ['', [Validators.required]],
  });

  openAdd(lectureId: string): void {
    this.showForm.set(true);
    this.lectureId.set(lectureId);
    this.editingId.set(null);
    this.error.set(null);
    this.useAi.set(false);
    this.isDraftMode.set(false);
    this.draft.set(null);
    this.aiQuestionCount.set(5);
    this.aiDifficulty.set('MEDIUM');
    this.form.reset({
      title: '',
      description: '',
      questionsText: '',
      answerKeyText: '',
      rubricCriteriaText: '',
    });
  }

  cancel(): void {
    this.showForm.set(false);
    this.lectureId.set(null);
    this.editingId.set(null);
    this.error.set(null);
    this.useAi.set(false);
    this.isDraftMode.set(false);
    this.draft.set(null);
  }

  setUseAi(val: boolean): void {
    this.useAi.set(val);
    if (!val) {
      this.isDraftMode.set(false);
      this.draft.set(null);
    }
  }

  async generateDraft(courseId: string): Promise<void> {
    if (this.generatingDraft()) return;
    const lectureId = this.lectureId();
    if (!lectureId) return;

    this.error.set(null);
    try {
      this.generatingDraft.set(true);
      const payload: GenerateAssessmentDraftRequest = {
        courseId,
        lectureId,
        questionCount: this.aiQuestionCount(),
        difficulty: this.aiDifficulty(),
      };
      console.log('🚀 Отправка запроса на генерацию assessment:', payload);
      const d = await firstValueFrom(this.dataService.generateAssessmentDraft(payload));
      console.log('✅ Получен ответ от сервера:', d);
      this.draft.set(d);
      this.isDraftMode.set(true);
      this.form.patchValue({
        title: d.title ?? '',
        description: d.description ?? '',
        questionsText: this.joinLines(d.questions ?? []),
        answerKeyText: this.joinLines(d.answerKey ?? []),
        rubricCriteriaText: this.joinLines(d.rubricCriteria ?? []),
      });
    } catch (e) {
      console.error('❌ Ошибка при генерации assessment:', e);
      this.error.set(e instanceof Error ? e.message : 'Не удалось сгенерировать черновик');
    } finally {
      this.generatingDraft.set(false);
    }
  }

  async submit(courseId: string, currentAssessments: Assessment[]): Promise<Assessment[] | null> {
    if (this.form.invalid || this.submitting()) return null;

    const lectureId = this.lectureId();
    if (!lectureId) {
      this.error.set('Lecture ID не найден');
      return null;
    }

    let questions = this.parseLines(this.form.controls.questionsText.value);
    let answerKey = this.parseLines(this.form.controls.answerKeyText.value);
    let rubricCriteria = this.parseLines(this.form.controls.rubricCriteriaText.value);

    if (!questions.length || !answerKey.length || !rubricCriteria.length) {
      this.error.set('Вопросы, ответы и критерии обязательны');
      return null;
    }

    // Автоматическое выравнивание массивов до одинакового размера
    const minLength = Math.min(questions.length, answerKey.length, rubricCriteria.length);

    if (questions.length !== answerKey.length || questions.length !== rubricCriteria.length) {
      console.warn(`⚠️ Размеры массивов не совпадают. Обрезаем до минимального: ${minLength}`, {
        questions: questions.length,
        answerKey: answerKey.length,
        rubricCriteria: rubricCriteria.length,
      });
      questions = questions.slice(0, minLength);
      answerKey = answerKey.slice(0, minLength);
      rubricCriteria = rubricCriteria.slice(0, minLength);
    }

    this.error.set(null);
    try {
      this.submitting.set(true);
      const payload = {
        title: this.form.controls.title.value,
        description: this.form.controls.description.value,
        questions,
        answerKey,
        rubricCriteria,
      };

      const created = await firstValueFrom(
        this.dataService.createAssessment({
          courseId,
          lectureId,
          ...payload,
        }),
      );

      console.log('✅ Ассесмент создан:', created);
      this.cancel();
      return [created, ...currentAssessments];
    } catch (e) {
      console.error('❌ Ошибка при создании assessment:', e);
      this.error.set(e instanceof Error ? e.message : 'Не удалось создать assessment');
      return null;
    } finally {
      this.submitting.set(false);
    }
  }

  private parseLines(raw: string): string[] {
    return raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  }

  private joinLines(items: string[]): string {
    return (items ?? []).join('\n');
  }
}
