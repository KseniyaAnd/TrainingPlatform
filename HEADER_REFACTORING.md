# Рефакторинг Header компонента

## Выполненные изменения

### 1. Упрощение кода TypeScript

- **Удалено**: `OnDestroy` интерфейс и `ngOnDestroy` метод
- **Удалено**: Ручное управление debounce через `setTimeout` и `requestSeq`
- **Добавлено**: Использование `toObservable()` + RxJS операторов для автоматического debounce
- **Сокращено**: С ~100 строк до ~85 строк (15% меньше кода)

### 2. Современные Angular 21 паттерны

```typescript
// Было: Ручной debounce с setTimeout
private debounceHandle: ReturnType<typeof setTimeout> | null = null;
private requestSeq = 0;

constructor() {
  effect(() => {
    const q = this.search().trim();
    if (this.debounceHandle) clearTimeout(this.debounceHandle);
    const seq = ++this.requestSeq;
    this.debounceHandle = setTimeout(() => void this.loadSuggestions(q, seq), 250);
  });
}

// Стало: Декларативный подход с RxJS
readonly suggestions = toSignal(
  toObservable(this.search).pipe(
    map((q) => q.trim()),
    debounceTime(250),
    distinctUntilChanged(),
    switchMap((q) => {
      if (!q) return of([]);
      return this.coursesService.getCourses({ limit: 50, cursor: null, q }).pipe(
        map((response) => {
          const lower = q.toLowerCase();
          return (response?.items ?? [])
            .filter((c) => c.title?.toLowerCase().includes(lower))
            .slice(0, 4);
        }),
        catchError(() => of([])),
      );
    }),
  ),
  { initialValue: [] as Course[] },
);
```

### 3. Упрощение методов

- **Удалено**: `onFocus()`, `closeSuggestions()`, `resetSearch()`, `loadSuggestions()`
- **Переименовано**:
  - `openCourse()` → `selectCourse()` (более понятное название)
  - `openAllResults()` → `showAllResults()` (более понятное название)
  - `onExplore()` → `navigateToCourses()` (более описательное)
- **Упрощено**: Прямое использование `showSuggestions.set()` в шаблоне

### 4. Оптимизация HTML

- Удалены лишние CSS классы (`transition-colors` дублировался)
- Упрощены обработчики событий (прямой вызов `signal.set()` вместо методов)
- Более компактная структура без потери функциональности

### 5. Улучшение структуры проекта

```
Было:
src/app/components/header/

Стало:
src/app/layout/header/
```

**Причина**: Header - это layout компонент, а не переиспользуемый UI компонент.
Структура `layout/` лучше отражает назначение и упрощает навигацию.

## Преимущества

### Производительность

- ✅ Автоматическая отмена предыдущих запросов через `switchMap`
- ✅ Нет утечек памяти (не нужен `ngOnDestroy`)
- ✅ Меньше кода = меньше размер бандла

### Читаемость

- ✅ Декларативный стиль вместо императивного
- ✅ Меньше методов и состояний
- ✅ Понятные названия методов

### Поддерживаемость

- ✅ Использование стандартных RxJS операторов
- ✅ Меньше кастомной логики
- ✅ Современные Angular 21 паттерны (2026)

## Статистика

| Метрика                      | До   | После | Изменение |
| ---------------------------- | ---- | ----- | --------- |
| Строк кода (TS)              | ~100 | ~85   | -15%      |
| Методов                      | 10   | 6     | -40%      |
| Lifecycle hooks              | 1    | 0     | -100%     |
| Ручное управление подписками | Да   | Нет   | ✅        |

## Совместимость

- ✅ Angular 21 (2026)
- ✅ RxJS 7+
- ✅ TypeScript 5+
- ✅ Все существующие функции сохранены

## Проверка

```bash
# Очистка кэша и сборка
rm -r -fo .angular/cache
npm run build
# ✅ Успешно собрано без ошибок

# Проверка TypeScript
# ✅ Нет диагностических ошибок

# Удаление старой структуры
rm -r -fo src/app/components/header
# ✅ Старые файлы удалены
```

## Итоговая структура

```
src/app/
├── layout/
│   └── header/
│       ├── header.ts       (85 строк, было 100)
│       └── header.html     (компактный, оптимизированный)
├── components/
│   ├── banner/
│   └── course-card/
└── app.ts                  (обновлен импорт)
```
