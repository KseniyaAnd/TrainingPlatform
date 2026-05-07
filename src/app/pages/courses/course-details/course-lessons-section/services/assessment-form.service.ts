import { inject, Injectable, signal } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Assessment } from '../../../../../models/assessment.model';
import {
  AssessmentDifficulty,
  AssessmentDraftResponse,
  GenerateAssessmentDraftRequest,
} from '../../../../../services/courses/course-content.service';
import { CourseDataService } from '../../../../../services/courses/course-data.service';
import { BaseFormService } from '../../../../../shared/services/base-form.service';

/**
 * Сервис для управления формой assessment с AI генерацией
 */
@Injectable()
export class AssessmentFormService extends BaseFormService<Assessment> {
  private readonly dataService = inject(CourseDataService);

  readonly lectureId = signal<string | null>(null);

  // AI generation state
  readonly useAi = signal(false);
  readonly isDraftMode = signal(false);
  readonly draft = signal<AssessmentDraftResponse | null>(null);
  readonly generatingDraft = signal(false);
  readonly aiQuestionCount = signal(5);
  readonly aiDifficulty = signal<AssessmentDifficulty>('MEDIUM');

  createForm(data?: Assessment): FormGroup {
    return this.fb.nonNullable.group({
      title: [data?.title ?? '', [Validators.required, Validators.minLength(3)]],
      description: [data?.description ?? '', [Validators.required, Validators.minLength(3)]],
      questionsText: [this.joinLines(data?.questions ?? []), [Validators.required]],
      answerKeyText: [this.joinLines(data?.answerKey ?? []), [Validators.required]],
      rubricCriteriaText: [this.joinLines(data?.rubricCriteria ?? []), [Validators.required]],
    });
  }

  readonly form = this.createForm();

  openAddAssessment(lectureId: string): void {
    super.openAdd();
    this.lectureId.set(lectureId);
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

  openEditAssessment(assessment: Assessment): void {
    super.openEdit(assessment.id);
    this.lectureId.set(assessment.lectureId ?? assessment.sourceId ?? null);
    this.useAi.set(false);
    this.isDraftMode.set(false);
    this.draft.set(null);

    // Загружаем полные данные ассесмента через API
    console.log('📥 Загрузка полных данных ассесмента:', assessment.id);
    firstValueFrom(this.dataService.getAssessmentDetails(assessment.id))
      .then((fullAssessment) => {
        console.log('✅ Полные данные ассесмента загружены:', fullAssessment);
        this.form.reset({
          title: fullAssessment.title ?? '',
          description: fullAssessment.description ?? '',
          questionsText: this.joinLines(fullAssessment.questions ?? []),
          answerKeyText: this.joinLines(fullAssessment.answerKey ?? []),
          rubricCriteriaText: this.joinLines(fullAssessment.rubricCriteria ?? []),
        });
      })
      .catch((e) => {
        console.error('❌ Ошибка загрузки полных данных ассесмента:', e);
        // Fallback: используем данные из переданного объекта
        this.form.reset({
          title: assessment.title ?? '',
          description: assessment.description ?? '',
          questionsText: this.joinLines(assessment.questions ?? []),
          answerKeyText: this.joinLines(assessment.answerKey ?? []),
          rubricCriteriaText: this.joinLines(assessment.rubricCriteria ?? []),
        });
      });
  }

  override cancel(): void {
    super.cancel();
    this.lectureId.set(null);
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

    // Если нет lectureId, показываем предупреждение, но продолжаем
    if (!lectureId) {
      console.warn('⚠️ Генерация ассесмента без привязки к лекции');
    }

    this.setError(null);
    try {
      this.generatingDraft.set(true);
      const payload: GenerateAssessmentDraftRequest = {
        courseId,
        lectureId: lectureId ?? undefined,
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
      this.setError(this.handleError(e));
    } finally {
      this.generatingDraft.set(false);
    }
  }

  async submit(courseId: string, currentAssessments: Assessment[]): Promise<Assessment[] | null> {
    if (this.form.invalid || this.submitting()) return null;

    const lectureId = this.lectureId();
    const editingId = this.editingId();

    // При создании нового ассесмента lectureId обязателен
    // При редактировании - необязателен (ассесмент может быть привязан к уроку)
    if (!editingId && !lectureId) {
      this.setError('Lecture ID не найден. Невозможно создать ассесмент без привязки к лекции.');
      return null;
    }

    let questions = this.parseLines(this.form.controls['questionsText'].value);
    let answerKey = this.parseLines(this.form.controls['answerKeyText'].value);
    let rubricCriteria = this.parseLines(this.form.controls['rubricCriteriaText'].value);

    if (!questions.length || !answerKey.length || !rubricCriteria.length) {
      this.setError('Вопросы, ответы и критерии обязательны');
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

    this.setError(null);
    try {
      this.setSubmitting(true);
      const payload = {
        title: this.form.controls['title'].value,
        description: this.form.controls['description'].value,
        questions,
        answerKey,
        rubricCriteria,
      };

      if (editingId) {
        // Редактирование существующего assessment
        console.log('📝 Обновление ассесмента:', editingId, payload);
        const updated = await firstValueFrom(this.dataService.updateAssessment(editingId, payload));
        console.log('✅ Ассесмент обновлен:', updated);
        this.cancel();
        return currentAssessments.map((a) => (a.id === editingId ? updated : a));
      } else {
        // Создание нового assessment
        console.log('➕ Создание нового ассесмента:', payload);
        const created = await firstValueFrom(
          this.dataService.createAssessment({
            courseId,
            lectureId: lectureId!,
            ...payload,
          }),
        );
        console.log('✅ Ассесмент создан:', created);
        this.cancel();
        return [created, ...currentAssessments];
      }
    } catch (e) {
      console.error('❌ Ошибка при сохранении assessment:', e);
      this.setError(this.handleError(e));
      return null;
    } finally {
      this.setSubmitting(false);
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
