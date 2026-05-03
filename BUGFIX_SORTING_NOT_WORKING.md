# Исправление: Сортировка не работала

## Проблема

Сортировка по дате и алфавиту не работала, потому что использовался `route.snapshot.queryParamMap`, который не является реактивным.

## Причина

### До исправления

```typescript
readonly selectedSort = computed(() => {
  const sortBy = this.route.snapshot.queryParamMap.get('sortBy');
  return sortBy === 'date' || sortBy === 'title' ? sortBy : null;
});

readonly filteredItems = computed(() => {
  // ...
  const sortBy = this.route.snapshot.queryParamMap.get('sortBy');
  if (sortBy === 'title') {
    items = [...items].sort(...);
  }
  // ...
});
```

**Проблема:** `route.snapshot` - это снимок состояния маршрута в момент создания компонента. Он **не обновляется** при изменении query параметров.

### Почему это не работало

1. Пользователь заходит на `/courses` - `sortBy = null`
2. Пользователь кликает "По дате" - URL меняется на `/courses?sortBy=date`
3. `route.snapshot` **остается прежним** - `sortBy = null`
4. `computed` не пересчитывается, потому что зависимости не изменились
5. Сортировка не применяется

## Решение

Добавлен реактивный signal для `sortBy`, который обновляется через подписку на `route.queryParamMap`.

### После исправления

```typescript
// 1. Добавлен signal для sortBy
private readonly sortBy = signal<'date' | 'title' | null>(null);

// 2. selectedSort теперь использует signal
readonly selectedSort = computed(() => this.sortBy());

// 3. filteredItems использует signal
readonly filteredItems = computed(() => {
  const sortBy = this.sortBy(); // Реактивное значение
  // ...
});

// 4. Обновление sortBy в подписке
this.route.queryParamMap.subscribe((params) => {
  this.scope.set(params.get('scope'));
  this.tag.set(params.get('tag'));
  this.q.set(params.get('q'));

  const sortByParam = params.get('sortBy');
  this.sortBy.set(sortByParam === 'date' || sortByParam === 'title' ? sortByParam : null);
});
```

## Как это работает теперь

### Поток данных

```
1. Пользователь кликает "По дате"
   ↓
2. onFiltersChange({ sortBy: 'date' })
   ↓
3. router.navigate([], { queryParams: { sortBy: 'date' } })
   ↓
4. URL меняется: /courses → /courses?sortBy=date
   ↓
5. route.queryParamMap.subscribe() срабатывает
   ↓
6. sortBy.set('date')
   ↓
7. selectedSort() пересчитывается (computed зависит от sortBy)
   ↓
8. filteredItems() пересчитывается (computed зависит от sortBy)
   ↓
9. Курсы пересортировываются
   ↓
10. UI обновляется
```

### Реактивность

```typescript
// Signal - реактивное значение
private readonly sortBy = signal<'date' | 'title' | null>(null);

// Computed - автоматически пересчитывается при изменении зависимостей
readonly selectedSort = computed(() => this.sortBy());
//                                     ↑
//                        Зависимость от sortBy signal

readonly filteredItems = computed(() => {
  const sortBy = this.sortBy(); // Зависимость от sortBy signal
  //              ↑
  //    При изменении sortBy, computed пересчитается

  if (sortBy === 'title') {
    items = [...items].sort((a, b) => a.title.localeCompare(b.title));
  }

  return items;
});
```

## Сравнение подходов

### ❌ Неправильно: route.snapshot

```typescript
readonly filteredItems = computed(() => {
  const sortBy = this.route.snapshot.queryParamMap.get('sortBy');
  // ❌ snapshot не реактивен
  // ❌ computed не знает о зависимости от route
  // ❌ не пересчитывается при изменении URL
});
```

### ✅ Правильно: signal + subscription

```typescript
private readonly sortBy = signal<'date' | 'title' | null>(null);

constructor() {
  this.route.queryParamMap.subscribe((params) => {
    const sortByParam = params.get('sortBy');
    this.sortBy.set(sortByParam === 'date' || sortByParam === 'title' ? sortByParam : null);
    // ✅ Обновляет signal при изменении URL
  });
}

readonly filteredItems = computed(() => {
  const sortBy = this.sortBy();
  // ✅ Зависит от signal
  // ✅ Автоматически пересчитывается
});
```

### 🔄 Альтернатива: toSignal (Angular 16+)

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

readonly sortBy = toSignal(
  this.route.queryParamMap.pipe(
    map(params => {
      const sortByParam = params.get('sortBy');
      return sortByParam === 'date' || sortByParam === 'title' ? sortByParam : null;
    })
  ),
  { initialValue: null }
);

readonly filteredItems = computed(() => {
  const sortBy = this.sortBy();
  // ✅ Работает так же, как signal + subscription
});
```

## Изменения в коде

### 1. Добавлен signal для sortBy

```typescript
private readonly sortBy = signal<'date' | 'title' | null>(null);
```

### 2. Упрощен selectedSort

**До:**

```typescript
readonly selectedSort = computed(() => {
  const sortBy = this.route.snapshot.queryParamMap.get('sortBy');
  return sortBy === 'date' || sortBy === 'title' ? sortBy : null;
});
```

**После:**

```typescript
readonly selectedSort = computed(() => this.sortBy());
```

### 3. Обновлен filteredItems

**До:**

```typescript
readonly filteredItems = computed(() => {
  // ...
  const sortBy = this.route.snapshot.queryParamMap.get('sortBy');
  if (sortBy === 'title') {
    items = [...items].sort(...);
  }
  // ...
});
```

**После:**

```typescript
readonly filteredItems = computed(() => {
  const sortBy = this.sortBy(); // Реактивное значение
  // ...
  if (sortBy === 'title') {
    items = [...items].sort(...);
  }
  // ...
});
```

### 4. Обновлена подписка на queryParamMap

**До:**

```typescript
this.route.queryParamMap.subscribe((params) => {
  this.scope.set(params.get('scope'));
  this.tag.set(params.get('tag'));
  this.q.set(params.get('q'));
});
```

**После:**

```typescript
this.route.queryParamMap.subscribe((params) => {
  this.scope.set(params.get('scope'));
  this.tag.set(params.get('tag'));
  this.q.set(params.get('q'));

  const sortByParam = params.get('sortBy');
  this.sortBy.set(sortByParam === 'date' || sortByParam === 'title' ? sortByParam : null);
});
```

## Почему это важно

### Реактивность в Angular Signals

Angular Signals работают на основе **зависимостей**:

```typescript
// Signal - источник данных
const count = signal(0);

// Computed - зависит от count
const doubled = computed(() => count() * 2);

// При изменении count, doubled автоматически пересчитывается
count.set(5); // doubled теперь 10
```

**Ключевой момент:** Computed должен **вызывать** signal внутри своей функции, чтобы Angular знал о зависимости.

### ❌ Не работает

```typescript
const sortBy = this.route.snapshot.queryParamMap.get('sortBy');
// ↑ Не signal, не Observable - просто значение

const filteredItems = computed(() => {
  if (sortBy === 'title') {
    // ❌ Нет зависимости от signal
    // ...
  }
});
```

### ✅ Работает

```typescript
const sortBy = signal<string | null>(null);
// ↑ Signal - реактивное значение

const filteredItems = computed(() => {
  if (this.sortBy() === 'title') {
    // ✅ Зависимость от signal
    // ...
  }
});
```

## Тестирование

### Проверьте сортировку по алфавиту

1. Откройте `/courses`
2. Кликните "По алфавиту"
3. ✅ URL должен измениться на `/courses?sortBy=title`
4. ✅ Курсы должны отсортироваться по названию (A-Z)
5. ✅ Кнопка "По алфавиту" должна быть активной (мятный фон)

### Проверьте сортировку по дате

1. Откройте `/courses`
2. Кликните "По дате создания"
3. ✅ URL должен измениться на `/courses?sortBy=date`
4. ✅ Курсы должны отсортироваться по дате (новые первыми)
5. ✅ Кнопка "По дате создания" должна быть активной

### Проверьте сброс сортировки

1. Выберите любую сортировку
2. Кликните на активную кнопку сортировки повторно
3. ✅ URL должен измениться на `/courses` (без sortBy)
4. ✅ Курсы должны вернуться к исходному порядку
5. ✅ Кнопка сортировки должна стать неактивной

### Проверьте комбинацию фильтров

1. Выберите тег "фронтенд"
2. Выберите "По алфавиту"
3. ✅ URL: `/courses?tag=фронтенд&sortBy=title`
4. ✅ Показываются только курсы с тегом "фронтенд"
5. ✅ Курсы отсортированы по алфавиту

### Проверьте прямой переход по URL

1. Откройте `/courses?sortBy=title` напрямую
2. ✅ Курсы должны быть отсортированы по алфавиту
3. ✅ Кнопка "По алфавиту" должна быть активной

## Измененные файлы

- ✅ `src/app/pages/courses/courses.ts` - добавлен signal для sortBy, обновлена логика
- 📄 `BUGFIX_SORTING_NOT_WORKING.md` - документация

## Урок

**Всегда используйте реактивные источники данных (signals, observables) в computed, а не статические значения (snapshot, переменные).**

```typescript
// ❌ Плохо
const value = this.route.snapshot.queryParamMap.get('key');
const computed = computed(() => value); // Не реактивно

// ✅ Хорошо
const value = signal(null);
this.route.queryParamMap.subscribe((params) => value.set(params.get('key')));
const computed = computed(() => value()); // Реактивно
```
