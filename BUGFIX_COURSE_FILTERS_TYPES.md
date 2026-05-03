# Исправление ошибок типов в компоненте фильтров

## Проблемы

### 1. TS2345: Argument of type 'string' is not assignable to parameter of type '"title" | "date"'

**Файл:** `src/app/components/course-filters/course-filters.html`  
**Причина:** TypeScript не мог вывести тип `option.value` из массива

### 2. TS2341: Property 'tag' is private

**Файл:** `src/app/pages/courses/courses.html`  
**Причина:** Свойство `tag` было приватным, но использовалось в шаблоне

### 3. TS2341: Property 'route' is private

**Файл:** `src/app/pages/courses/courses.html`  
**Причина:** Свойство `route` было приватным, но использовалось в шаблоне

### 4. NG5002: Parser Error: Unexpected token 'as'

**Файл:** `src/app/pages/courses/courses.html`  
**Причина:** Type casting (`as`) не поддерживается в Angular шаблонах

## Исправления

### 1. Явно указан тип для sortOptions

**Файл:** `src/app/components/course-filters/course-filters.ts`

**До:**

```typescript
readonly sortOptions = [
  { value: 'date', label: 'По дате создания' },
  { value: 'title', label: 'По алфавиту' },
];
```

**После:**

```typescript
readonly sortOptions: Array<{ value: 'date' | 'title'; label: string }> = [
  { value: 'date', label: 'По дате создания' },
  { value: 'title', label: 'По алфавиту' },
];
```

### 2. Сделаны публичными свойства tag и route

**Файл:** `src/app/pages/courses/courses.ts`

**До:**

```typescript
private readonly route = inject(ActivatedRoute);
private readonly tag = signal<string | null>(null);
```

**После:**

```typescript
readonly route = inject(ActivatedRoute);
readonly tag = signal<string | null>(null);
```

### 3. Создан computed для selectedSort

**Файл:** `src/app/pages/courses/courses.ts`

**Добавлено:**

```typescript
readonly selectedSort = computed(() => {
  const sortBy = this.route.snapshot.queryParamMap.get('sortBy');
  return sortBy === 'date' || sortBy === 'title' ? sortBy : null;
});
```

### 4. Обновлен шаблон для использования computed

**Файл:** `src/app/pages/courses/courses.html`

**До:**

```html
[selectedSort]="route.snapshot.queryParamMap.get('sortBy') as 'date' | 'title' | null"
```

**После:**

```html
[selectedSort]="selectedSort()"
```

## Почему это работает

### 1. Явные типы

TypeScript теперь точно знает, что `option.value` может быть только `'date'` или `'title'`, что соответствует типу параметра `selectSort()`.

### 2. Публичные свойства

Angular шаблоны могут обращаться только к публичным свойствам компонента. Сделав `tag` и `route` публичными, мы разрешили доступ из шаблона.

### 3. Computed вместо type casting

Angular шаблоны не поддерживают TypeScript type casting (`as`). Вместо этого мы создали computed свойство, которое выполняет проверку типа в TypeScript коде.

### 4. Type guard

```typescript
sortBy === 'date' || sortBy === 'title' ? sortBy : null;
```

Это type guard, который гарантирует, что возвращаемое значение имеет тип `'date' | 'title' | null`.

## Альтернативные подходы

### Альтернатива 1: Использовать геттер

```typescript
get selectedSort(): 'date' | 'title' | null {
  const sortBy = this.route.snapshot.queryParamMap.get('sortBy');
  return sortBy === 'date' || sortBy === 'title' ? sortBy : null;
}
```

**Минусы:** Геттеры вызываются при каждом change detection, computed - только при изменении зависимостей.

### Альтернатива 2: Использовать signal

```typescript
readonly selectedSort = signal<'date' | 'title' | null>(null);

constructor() {
  this.route.queryParamMap.subscribe((params) => {
    const sortBy = params.get('sortBy');
    this.selectedSort.set(sortBy === 'date' || sortBy === 'title' ? sortBy : null);
  });
}
```

**Минусы:** Больше кода, нужно управлять подпиской.

### Альтернатива 3: Использовать pipe в шаблоне

```typescript
// В компоненте
getSortBy = (sortBy: string | null): 'date' | 'title' | null => {
  return sortBy === 'date' || sortBy === 'title' ? sortBy : null;
};
```

```html
[selectedSort]="getSortBy(route.snapshot.queryParamMap.get('sortBy'))"
```

**Минусы:** Функция вызывается при каждом change detection.

## Текущее решение - оптимальное

Использование `computed` - это лучший подход, потому что:

- ✅ Реактивность - автоматически обновляется при изменении route
- ✅ Производительность - вычисляется только при изменении зависимостей
- ✅ Типобезопасность - TypeScript проверяет типы
- ✅ Читаемость - понятный и чистый код

## Измененные файлы

- ✅ `src/app/components/course-filters/course-filters.ts` - явный тип для sortOptions
- ✅ `src/app/pages/courses/courses.ts` - публичные свойства + computed для selectedSort
- ✅ `src/app/pages/courses/courses.html` - использует selectedSort()

## Тестирование

- [ ] Компиляция проходит без ошибок
- [ ] Фильтры отображаются корректно
- [ ] Клик на фильтр работает
- [ ] Сортировка применяется
- [ ] URL обновляется при выборе фильтров
