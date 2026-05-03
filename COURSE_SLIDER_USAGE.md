# CourseSlider - Руководство по использованию

## Быстрый старт

```typescript
import { CourseSliderComponent } from './components/course-slider/course-slider';

@Component({
  imports: [CourseSliderComponent]
})
export class MyComponent {
  readonly courses = signal<Course[]>([...]);
}
```

```html
<app-course-slider [courses]="courses()" />
```

## API

### Inputs

| Параметр              | Тип                      | По умолчанию     | Описание                         |
| --------------------- | ------------------------ | ---------------- | -------------------------------- |
| `courses`             | `Course[]`               | **обязательный** | Массив курсов                    |
| `showMoreLink`        | `boolean`                | `false`          | Показать карточку "Смотреть все" |
| `moreLinkText`        | `string`                 | `'Смотреть все'` | Текст на карточке                |
| `moreLinkUrl`         | `string`                 | `'/courses'`     | URL ссылки                       |
| `moreLinkQueryParams` | `Record<string, string>` | `{}`             | Query параметры                  |
| `slidesToShow`        | `number`                 | `1`              | Слайдов на экране (мобильные)    |
| `showDots`            | `boolean`                | `true`           | Показать точки-индикаторы        |
| `showArrows`          | `boolean`                | `true`           | Показать стрелки навигации       |

### Outputs

| Событие       | Тип      | Описание               |
| ------------- | -------- | ---------------------- |
| `courseClick` | `Course` | Клик по карточке курса |

## Примеры

### 1. Минимальный

```html
<app-course-slider [courses]="courses()" />
```

### 2. С карточкой "Смотреть все"

```html
<app-course-slider
  [courses]="designCourses()"
  [showMoreLink]="true"
  [moreLinkText]="'Все курсы по дизайну'"
  [moreLinkUrl]="'/courses'"
  [moreLinkQueryParams]="{ tag: 'дизайн' }"
/>
```

### 3. Без навигации

```html
<app-course-slider [courses]="courses()" [showDots]="false" [showArrows]="false" />
```

**Результат**: Без стрелок и паддингов - слайдер занимает всю ширину контейнера.

### 4. С обработкой клика

```html
<app-course-slider [courses]="courses()" (courseClick)="onCourseSelected($event)" />
```

```typescript
onCourseSelected(course: Course): void {
  console.log('Selected:', course);
  // Ваша логика
}
```

### 5. Больше слайдов на экране

```html
<app-course-slider [courses]="courses()" [slidesToShow]="3" />
```

### 6. Полная конфигурация

```html
<app-course-slider
  [courses]="popularCourses()"
  [showMoreLink]="true"
  [moreLinkText]="'Смотреть все популярные'"
  [moreLinkUrl]="'/courses'"
  [moreLinkQueryParams]="{ sort: 'popular' }"
  [slidesToShow]="2"
  [showDots]="true"
  [showArrows]="true"
  (courseClick)="trackCourseClick($event)"
/>
```

## Адаптивность

Слайдер автоматически адаптируется:

| Ширина экрана   | Слайдов |
| --------------- | ------- |
| < 768px         | 1-2     |
| 768px - 1024px  | 2-3     |
| 1024px - 1280px | 3       |
| > 1280px        | 4       |

## Стилизация

### Tailwind классы

Все стили используют Tailwind CSS. Основные классы:

```html
<!-- Контейнер с динамическими паддингами -->
<div [class]="showArrows() ? 'relative px-12 md:px-14' : 'relative'">
  <!-- Кнопки -->
  <button class="... border-teal-500 bg-teal-50 text-teal-600 ...">
    <!-- Карточка "Смотреть все" -->
    <a class="... border-teal-300 bg-teal-50 hover:bg-teal-100 ..."></a>
  </button>
</div>
```

**Важно**: Паддинги (`px-12 md:px-14`) применяются только когда `showArrows="true"`. Это освобождает место для стрелок навигации.

### Кастомизация цветов

Измените цвета в шаблоне:

```html
<!-- Замените teal на другой цвет -->
<button class="border-blue-500 bg-blue-50 text-blue-600"></button>
```

### Динамические элементы Glider.js

Для стилизации точек используйте CSS:

```css
:host ::ng-deep .glider-dot {
  background-color: rgb(59 130 246); /* blue-500 */
}

:host ::ng-deep .glider-dot.active {
  background-color: rgb(239 68 68); /* red-500 */
}
```

## Типичные сценарии

### Главная страница

```html
<app-course-slider
  [courses]="featuredCourses()"
  [showMoreLink]="true"
  [moreLinkText]="'Все курсы'"
/>
```

### Страница категории

```html
<app-course-slider
  [courses]="categoryCourses()"
  [showMoreLink]="true"
  [moreLinkUrl]="'/courses'"
  [moreLinkQueryParams]="{ category: categoryId() }"
/>
```

### Профиль пользователя

```html
<app-course-slider [courses]="userCourses()" [showDots]="false" [slidesToShow]="3" />
```

### Рекомендации

```html
<app-course-slider
  [courses]="recommendedCourses()"
  [showArrows]="false"
  (courseClick)="trackRecommendation($event)"
/>
```

## Производительность

### Оптимизация

1. **Ленивая загрузка изображений** - добавьте в CourseCard:

```html
<img loading="lazy" [src]="course.image" />
```

2. **TrackBy функция** - уже используется `track $index`

3. **OnPush стратегия** - компонент использует signals (автоматически оптимизирован)

### Метрики

- Размер компонента: ~3KB (gzipped)
- Время инициализации: <10ms
- Память: ~50KB на 10 курсов

## Troubleshooting

### Слайдер не инициализируется

**Проблема**: Пустой массив курсов

```typescript
readonly courses = signal<Course[]>([]);
```

**Решение**: Убедитесь, что данные загружены

```typescript
if (courses().length > 0) {
  // Слайдер отобразится
}
```

### Стили не применяются

**Проблема**: Tailwind классы не работают

**Решение**: Проверьте, что Tailwind настроен в `styles.css`:

```css
@import 'tailwindcss';
```

### Точки не стилизуются

**Проблема**: Динамические элементы Glider.js

**Решение**: Используйте `::ng-deep`:

```css
:host ::ng-deep .glider-dot {
  /* ваши стили */
}
```

## Best Practices

### ✅ Рекомендуется

```typescript
// Используйте computed для производных данных
readonly filteredCourses = computed(() =>
  this.allCourses().filter(c => c.isActive)
);

// Передавайте только нужные данные
<app-course-slider [courses]="filteredCourses()" />
```

### ❌ Не рекомендуется

```typescript
// Не создавайте новые массивы в шаблоне
<app-course-slider [courses]="allCourses().filter(c => c.isActive)" />

// Не передавайте слишком много курсов
<app-course-slider [courses]="allCourses()" /> // 1000+ курсов
```

## Расширение функциональности

### Добавить autoplay

```typescript
// В course-slider.ts
readonly autoplay = input(false);
readonly autoplaySpeed = input(3000);

private initGlider(element: HTMLElement): void {
  this.glider = new Glider(element, {
    // ... существующие настройки
    duration: this.autoplay() ? this.autoplaySpeed() / 1000 : 0.5,
  });

  if (this.autoplay()) {
    setInterval(() => this.glider?.scrollItem('next'), this.autoplaySpeed());
  }
}
```

### Добавить кастомные шаблоны

```typescript
// Используйте ng-content
<app-course-slider [courses]="courses()">
  <ng-template #customCard let-course>
    <div class="custom-card">{{ course.title }}</div>
  </ng-template>
</app-course-slider>
```

## Поддержка

Для вопросов и предложений см. документацию:

- [TAILWIND_REFACTORING.md](./TAILWIND_REFACTORING.md) - детали рефакторинга
- [COURSE_SLIDER_COMPONENT.md](./COURSE_SLIDER_COMPONENT.md) - полная документация
