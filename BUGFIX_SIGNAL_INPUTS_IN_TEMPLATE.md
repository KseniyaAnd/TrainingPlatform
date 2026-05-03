# Исправление: Signal inputs в шаблоне

## Проблема

После миграции на signal-based inputs возникли ошибки компиляции:

```
TS2367: This comparison appears to be unintentional because the types
'InputSignal<string | null>' and 'string' have no overlap.
```

## Причина

Signal-based inputs - это **функции**, а не свойства. В шаблоне их нужно вызывать с `()`.

### ❌ Неправильно

```html
<button [class.active]="selectedTag === tag">
  <!--                   ^^^^^^^^^^^
       InputSignal (функция), а не значение -->
</button>
```

### ✅ Правильно

```html
<button [class.active]="selectedTag() === tag">
  <!--                   ^^^^^^^^^^^^^
       Вызов функции для получения значения -->
</button>
```

## Исправления

### 1. Тег "Все"

**До:**

```html
<button [class.active]="selectedTag === null" (click)="selectTag(null)">Все</button>
```

**После:**

```html
<button [class.active]="selectedTag() === null" (click)="selectTag(null)">Все</button>
```

### 2. Остальные теги

**До:**

```html
<button [class.active]="selectedTag === tag" (click)="selectTag(tag)">{{ tag }}</button>
```

**После:**

```html
<button [class.active]="selectedTag() === tag" (click)="selectTag(tag)">{{ tag }}</button>
```

### 3. Сортировка

**До:**

```html
<button [class.active]="selectedSort === option.value" (click)="selectSort(option.value)">
  {{ option.label }}
</button>
```

**После:**

```html
<button [class.active]="selectedSort() === option.value" (click)="selectSort(option.value)">
  {{ option.label }}
</button>
```

## Правила использования Signal inputs в шаблонах

### 1. Всегда вызывайте как функцию

```html
<!-- ❌ Неправильно -->
{{ myInput }} [value]="myInput" *ngIf="myInput"

<!-- ✅ Правильно -->
{{ myInput() }} [value]="myInput()" *ngIf="myInput()"
```

### 2. В выражениях

```html
<!-- ❌ Неправильно -->
[class.active]="isActive" [disabled]="!isEnabled" {{ firstName + ' ' + lastName }}

<!-- ✅ Правильно -->
[class.active]="isActive()" [disabled]="!isEnabled()" {{ firstName() + ' ' + lastName() }}
```

### 3. В условиях

```html
<!-- ❌ Неправильно -->
@if (showContent) {
<div>Content</div>
}

<!-- ✅ Правильно -->
@if (showContent()) {
<div>Content</div>
}
```

### 4. В циклах

```html
<!-- ❌ Неправильно -->
@for (item of items; track item.id) {
<div>{{ item }}</div>
}

<!-- ✅ Правильно -->
@for (item of items(); track item.id) {
<div>{{ item }}</div>
}
```

## Сравнение с decorator-based inputs

### Decorator-based (@Input)

```typescript
@Input() value: string = '';
```

```html
<!-- Используется как свойство -->
{{ value }} [attr]="value"
```

### Signal-based (input())

```typescript
value = input<string>('');
```

```html
<!-- Используется как функция -->
{{ value() }} [attr]="value()"
```

## Почему это важно

### 1. Типобезопасность

TypeScript видит разницу между функцией и значением:

```typescript
selectedTag = input<string | null>(null);
// Тип: InputSignal<string | null>

selectedTag();
// Тип: string | null
```

### 2. Реактивность

Вызов `()` регистрирует зависимость для change detection:

```typescript
// В computed или effect
const computed = computed(() => {
  return this.selectedTag(); // ✅ Регистрирует зависимость
});

const computed = computed(() => {
  return this.selectedTag; // ❌ Не регистрирует зависимость
});
```

### 3. Консистентность

Все signals используются одинаково:

```typescript
// Обычный signal
const count = signal(0);
console.log(count()); // Вызов функции

// Input signal
const value = input<number>(0);
console.log(value()); // Вызов функции

// Computed signal
const doubled = computed(() => count() * 2);
console.log(doubled()); // Вызов функции
```

## Частые ошибки

### Ошибка 1: Забыли ()

```html
<!-- ❌ Ошибка компиляции -->
<div [class.active]="isActive">
  <!-- ✅ Правильно -->
  <div [class.active]="isActive()"></div>
</div>
```

### Ошибка 2: Двойной вызов ()

```html
<!-- ❌ Ошибка: isActive() возвращает boolean, не функцию -->
<div [class.active]="isActive()()">
  <!-- ✅ Правильно -->
  <div [class.active]="isActive()"></div>
</div>
```

### Ошибка 3: Попытка изменить input

```typescript
// ❌ Ошибка: inputs read-only
myInput = input<string>('');
this.myInput.set('new value'); // Нельзя!

// ✅ Правильно: emit событие родителю
myOutput = output<string>();
this.myOutput.emit('new value');
```

## Проверка

Убедитесь, что все signal inputs вызываются с `()`:

```bash
# Поиск потенциальных проблем
grep -r "selectedTag ===" src/
grep -r "selectedSort ===" src/
grep -r "\[class.active\]=\"selected" src/
```

## Измененные файлы

- ✅ `src/app/components/course-filters/course-filters.html` - добавлены () к signal inputs
- 📄 `BUGFIX_SIGNAL_INPUTS_IN_TEMPLATE.md` - документация

## Тестирование

- [ ] Фильтры отображаются корректно
- [ ] Активный тег подсвечивается
- [ ] Активная сортировка подсвечивается
- [ ] Клики работают
- [ ] Нет ошибок компиляции
- [ ] Нет ошибок в консоли браузера

## Полезные ссылки

- [Angular Signals Guide](https://angular.io/guide/signals)
- [Signal-based Inputs](https://angular.io/guide/signal-inputs)
- [Signal Queries](https://angular.io/guide/signal-queries)
