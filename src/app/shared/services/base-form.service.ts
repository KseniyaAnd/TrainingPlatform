import { inject, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

/**
 * Базовый сервис для работы с формами
 * Предоставляет общую логику для всех форм в приложении
 */
export abstract class BaseFormService<T = any> {
  protected readonly fb = inject(FormBuilder);

  readonly showForm = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  /**
   * Создать форму с данными
   * Должен быть реализован в наследниках
   */
  abstract createForm(data?: T): FormGroup;

  /**
   * Открыть форму для добавления
   */
  openAdd(): void {
    this.showForm.set(true);
    this.editingId.set(null);
    this.error.set(null);
  }

  /**
   * Открыть форму для редактирования
   */
  openEdit(id: string): void {
    this.showForm.set(true);
    this.editingId.set(id);
    this.error.set(null);
  }

  /**
   * Закрыть форму и сбросить состояние
   */
  cancel(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.error.set(null);
  }

  /**
   * Обработать ошибку и вернуть сообщение
   */
  protected handleError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    return 'Произошла ошибка';
  }

  /**
   * Установить состояние загрузки
   */
  protected setSubmitting(value: boolean): void {
    this.submitting.set(value);
  }

  /**
   * Установить ошибку
   */
  protected setError(error: string | null): void {
    this.error.set(error);
  }
}
