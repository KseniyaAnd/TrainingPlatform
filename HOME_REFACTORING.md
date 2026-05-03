# Рефакторинг Home компонента

## Выполненные изменения

### 1. Использование сигналов Angular 21

**До:**

- Использовались обычные сигналы с ручным управлением состоянием
- Асинхронная загрузка через `firstValueFrom` в конструкторе
- Ручное управление состояниями loading/error

**После:**

- Использован `toSignal()` для автоматического преобразования Observable в сигнал
- Computed сигналы для производных данных (designCourses, recentCourses)
- Реактивное обновление данных без ручного управления
- Добавлен `ChangeDetectionStrategy.OnPush` для оптимизации

### 2. Разделение на компоненты

Создано 3 новых переиспользуемых компонента:

#### `AiFeaturesComponent` (`src/app/components/ai-features/`)

- Вынесен большой блок с аккордеоном AI-функций
- Данные структурированы в типизированный массив
- Использует `@for` для рендеринга вместо дублирования кода
- Standalone компонент с OnPush стратегией

#### `CourseSectionComponent` (`src/app/components/course-section/`)

- Универсальный компонент для отображения секции курсов
- Принимает заголовок, описание, список курсов и параметры ссылки
- Убирает дублирование кода для разных секций курсов
- Поддерживает пустое состояние (empty state)

#### `LoadingStateComponent` (`src/app/components/loading-state/`)

- Компонент для отображения состояний загрузки и ошибок
- Использует PrimeNG компоненты (ProgressSpinner, Message)
- Inline template для простоты

### 3. Устранение повторений

**До:**

- Два почти идентичных блока HTML для секций курсов (дизайн и недавние)
- Повторяющиеся параметры для `app-course-slider`
- Дублирование структуры заголовок + описание + слайдер

**После:**

- Единый массив `courseSections` с данными всех секций
- Цикл `@for` для рендеринга секций
- Переиспользуемый компонент `CourseSectionComponent`

### 4. Уменьшение вложенности

**До:**

```html
<section>
  <div>
    @if (error()) { ... } @if (loading()) { ... }
    <div>
      <h2>...</h2>
      <p-accordion>
        <p-accordion-panel>...</p-accordion-panel>
        <!-- 5 панелей с повторяющейся структурой -->
      </p-accordion>
    </div>
    <div>
      <div>
        <div>
          <h2>...</h2>
          <p>...</p>
        </div>
      </div>
      @if (courses) { ... }
    </div>
    <!-- Дублирование для второй секции -->
  </div>
</section>
```

**После:**

```html
<app-banner ... />

<div class="mx-auto max-w-7xl px-4 py-8">
  <app-loading-state [loading]="loading()" [error]="error()" />
  <app-ai-features />

  @for (section of courseSections(); track section.title) {
  <app-course-section
    [title]="section.title"
    [description]="section.description"
    [courses]="section.courses"
    ...
  />
  }
</div>
```

### 5. Улучшение типизации

Добавлены интерфейсы:

- `AiFeature` - для структуры данных AI-функций
- `CourseSection` - для секций курсов

### 6. Оптимизация производительности

- `ChangeDetectionStrategy.OnPush` во всех компонентах
- Computed сигналы вместо ручных вычислений
- `toSignal()` для автоматического управления подписками
- `track` в циклах `@for` для оптимизации рендеринга

## Структура файлов

```
src/app/
├── components/
│   ├── ai-features/
│   │   ├── ai-features.ts
│   │   └── ai-features.html
│   ├── course-section/
│   │   ├── course-section.ts
│   │   └── course-section.html
│   └── loading-state/
│       └── loading-state.ts
└── pages/
    └── home/
        ├── home.ts (рефакторен)
        ├── home.html (упрощен)
        └── home.css (без изменений)
```

## Преимущества

1. **Читаемость**: Код стал значительно чище и понятнее
2. **Переиспользование**: Новые компоненты можно использовать в других местах
3. **Поддержка**: Легче вносить изменения и исправлять ошибки
4. **Производительность**: OnPush стратегия и computed сигналы
5. **Типобезопасность**: Строгая типизация данных
6. **Реактивность**: Автоматическое обновление UI при изменении данных

## Использованные технологии

- ✅ Angular 21 сигналы (`signal`, `computed`, `toSignal`)
- ✅ Tailwind CSS для стилизации
- ✅ PrimeNG компоненты (Accordion, ProgressSpinner, Message, Button)
- ✅ Standalone компоненты
- ✅ OnPush стратегия обнаружения изменений
- ✅ RxJS операторы (`map`)
- ✅ Новый синтаксис шаблонов (`@if`, `@for`)
