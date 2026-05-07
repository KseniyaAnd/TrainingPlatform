import { signal, WritableSignal } from '@angular/core';

/**
 * Интерфейс состояния загрузки данных
 */
export interface LoadingState<T> {
  data: WritableSignal<T | null>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
}

/**
 * Создать состояние загрузки с типизированными сигналами
 */
export function createLoadingState<T>(initialData: T | null = null): LoadingState<T> {
  return {
    data: signal<T | null>(initialData),
    loading: signal(true),
    error: signal<string | null>(null),
  };
}

/**
 * Сбросить состояние загрузки (начать новую загрузку)
 */
export function resetLoadingState<T>(state: LoadingState<T>): void {
  state.loading.set(true);
  state.error.set(null);
}

/**
 * Установить успешное состояние с данными
 */
export function setLoadingSuccess<T>(state: LoadingState<T>, data: T): void {
  state.data.set(data);
  state.loading.set(false);
  state.error.set(null);
}

/**
 * Установить состояние ошибки
 */
export function setLoadingError<T>(state: LoadingState<T>, error: string): void {
  state.error.set(error);
  state.loading.set(false);
}
