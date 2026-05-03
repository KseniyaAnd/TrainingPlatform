# Миграция компонента фильтров на Signals

## Обзор

Компонент `CourseFiltersComponent` переписан с использованием современного Signal-based API Angular.

## Что изменилось

### 1. Inputs: @Input() → input()

**До:**

```typescript
import { Component, Input } from '@angular/core';

export class CourseFiltersComponent {
  @Input() selectedTag: string | null = null;
  @Input() selectedSort: 'date' | 'title' | null = null;
}
```

**После:**

```typescript
import { Component, input } from '@angular/core';

export class CourseFiltersComponent {
  selectedTag = input<string | null>(null);
  selectedSort = input<'date' | 'title' | null>(null);
}
```

### 2. Outputs: @Output() → output()

**До:**

```typescript
import { Component, Output, EventEmitter } from '@angular/core';

export class CourseFiltersComponent {
  @Output() filtersChange = new EventEmitter<CourseFilters>();
}
```

**После:**

```typescript
import { Component, output } from '@angular/core';

export class CourseFiltersComponent {
  filtersChange = output<CourseFilters>();
}
```

### 3. Доступ к значениям: свойство → функция

**До:**

```typescript
selectTag(tag: string | null): void {
  this.selectedTag = tag;  // Прямой доступ к свойству
  this.emitFilters();
}

private emitFilters(): void {
  this.filtersChange.emit({
    tag: this.selectedTag,      // Чтение свойства
    sortBy: this.selectedSort,  // Чтение свойства
  });
}
```

**После:**

```typescript
selectTag(tag: string | null): void {
  this.filtersChange.emit({
    tag: tag,
    sortBy: this.selectedSort(),  // Вызов функции
  });
}

selectSort(sort: 'date' | 'title'): void {
  const newSort = this.selectedSort() === sort ? null : sort;  // Вызов функции
  this.filtersChange.emit({
    tag: this.selectedTag(),      // Вызов функции
    sortBy: newSort,
  });
}
```

### 4. Упрощение кода

**До:**

```typescript
selectTag(tag: string | null): void {
  this.selectedTag = tag;  // Изменяем локальное состояние
  this.emitFilters();      // Отдельный метод для emit
}

private emitFilters(): void {
  this.filtersChange.emit({
    tag: this.selectedTag,
    sortBy: this.selectedSort,
  });
}
```

**После:**

```typescript
selectTag(tag: string | null): void {
  this.filtersChange.emit({  // Сразу emit
    tag: tag,
    sortBy: this.selectedSort(),
  });
}
// Метод emitFilters() больше не нужен
```

## Преимущества Signal-based API

### 1. Типобезопасность

**До:**

```typescript
@Input() selectedTag: string | null = null;

// В шаблоне
[class.active]="selectedTag === tag"  // Может быть undefined
```

**После:**

```typescript
selectedTag = input<string | null>(null);

// В шаблоне
[class.active]="selectedTag() === tag"  // Всегда определено
```

### 2. Реактивность

**До:**

```typescript
@Input() selectedTag: string | null = null;

// Нужно использовать ngOnChanges для отслеживания изменений
ngOnChanges(changes: SimpleChanges) {
  if (changes['selectedTag']) {
    // Реагировать на изменения
  }
}
```

**После:**

```typescript
selectedTag = input<string | null>(null);

// Можно использовать effect или computed
constructor() {
  effect(() => {
    console.log('Tag changed:', this.selectedTag());
  });
}
```

### 3. Производительность

Signal-based inputs более производительны, потому что:

- Не требуют Zone.js для change detection
- Более эффективное отслеживание изменений
- Меньше overhead при проверке изменений

### 4. Современный API

Signal-based API - это будущее Angular:

- Рекомендуется для новых компонентов
- Лучшая интеграция с Signals
- Более простой и понятный код

## Сравнение синтаксиса

### Определение

| Старый API                                 | Signal-based API              |
| ------------------------------------------ | ----------------------------- |
| `@Input() prop: T = value;`                | `prop = input<T>(value);`     |
| `@Input({ required: true }) prop!: T;`     | `prop = input.required<T>();` |
| `@Output() event = new EventEmitter<T>();` | `event = output<T>();`        |

### Использование в классе

| Старый API               | Signal-based API         |
| ------------------------ | ------------------------ |
| `this.prop`              | `this.prop()`            |
| `this.prop = value`      | ❌ Нельзя (read-only)    |
| `this.event.emit(value)` | `this.event.emit(value)` |

### Использование в шаблоне

| Старый API               | Signal-based API         |
| ------------------------ | ------------------------ |
| `{{ prop }}`             | `{{ prop() }}`           |
| `[value]="prop"`         | `[value]="prop()"`       |
| `(click)="event.emit()"` | `(click)="event.emit()"` |

## Полный пример миграции

### До (Decorator-based)

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-filter',
  template: `
    <button [class.active]="isActive" (click)="toggle()">
      {{ label }}
    </button>
  `,
})
export class FilterComponent {
  @Input() label: string = '';
  @Input() isActive: boolean = false;
  @Output() toggled = new EventEmitter<boolean>();

  toggle(): void {
    this.isActive = !this.isActive;
    this.toggled.emit(this.isActive);
  }
}
```

### После (Signal-based)

```typescript
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-filter',
  template: `
    <button [class.active]="isActive()" (click)="toggle()">
      {{ label() }}
    </button>
  `,
})
export class FilterComponent {
  label = input<string>('');
  isActive = input<boolean>(false);
  toggled = output<boolean>();

  toggle(): void {
    const newState = !this.isActive();
    this.toggled.emit(newState);
  }
}
```

## Особенности Signal-based inputs

### 1. Read-only

Signal-based inputs **нельзя изменять** внутри компонента:

```typescript
// ❌ Ошибка
selectedTag = input<string | null>(null);
this.selectedTag.set('new value'); // Нельзя!

// ✅ Правильно - emit событие родителю
filtersChange = output<CourseFilters>();
this.filtersChange.emit({ tag: 'new value', sortBy: null });
```

### 2. Required inputs

```typescript
// Старый API
@Input({ required: true }) id!: string;

// Signal-based API
id = input.required<string>();
```

### 3. Alias

```typescript
// Старый API
@Input('customName') prop: string = '';

// Signal-based API
prop = input<string>('', { alias: 'customName' });
```

### 4. Transform

```typescript
// Старый API
@Input({ transform: (value: string) => value.toUpperCase() })
prop: string = '';

// Signal-based API
prop = input<string>('', {
  transform: (value: string) => value.toUpperCase()
});
```

## Миграция родительского компонента

Родительский компонент **не требует изменений**:

```typescript
// Работает одинаково для обоих API
<app-course-filters
  [selectedTag]="tag()"
  [selectedSort]="selectedSort()"
  (filtersChange)="onFiltersChange($event)"
></app-course-filters>
```

## Когда использовать Signal-based API

### ✅ Используйте Signal-based API когда:

- Создаете новый компонент
- Компонент использует Signals внутри
- Хотите лучшую типобезопасность
- Нужна реактивность с effect/computed

### ⚠️ Пока используйте Decorator-based API когда:

- Нужна обратная совместимость со старым кодом
- Используете библиотеки, которые не поддерживают Signals
- Нужно изменять input внутри компонента (two-way binding)

## Обратная совместимость

Signal-based inputs **полностью совместимы** с decorator-based inputs:

```typescript
// Родитель с decorator-based
@Component({
  template: `<app-child [value]="myValue" />`,
})
class ParentComponent {
  myValue = 'test';
}

// Ребенок с signal-based
@Component({
  selector: 'app-child',
})
class ChildComponent {
  value = input<string>(''); // ✅ Работает!
}
```

## Измененные файлы

- ✅ `src/app/components/course-filters/course-filters.ts` - переписан на signals
- 📄 `MIGRATION_TO_SIGNALS.md` - документация

## Тестирование

- [ ] Фильтры отображаются корректно
- [ ] Клик на тег работает
- [ ] Клик на сортировку работает
- [ ] Тег "Все" работает
- [ ] URL обновляется при изменении фильтров
- [ ] Фильтры применяются к курсам
- [ ] Нет ошибок в консоли

## Дополнительные ресурсы

- [Angular Signals Documentation](https://angular.io/guide/signals)
- [Signal-based Inputs RFC](https://github.com/angular/angular/discussions/49682)
- [Angular Blog: Introducing Signal-based Inputs](https://blog.angular.io/signal-inputs-available-in-developer-preview-6a7ff1941823)

## Следующие шаги

Можно также мигрировать другие компоненты на Signal-based API:

- `CourseCardComponent`
- `UserMenuComponent`
- `SearchBarComponent`
- И другие...
