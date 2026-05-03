# Компонент CourseSlider

## Описание

Переиспользуемый компонент слайдера курсов на базе библиотеки Glider.js. Компонент полностью построен на современном signal-based подходе Angular и может использоваться в любом месте приложения.

## Расположение

```
src/app/components/course-slider/
├── course-slider.ts       # Логика компонента
├── course-slider.html     # Шаблон
└── course-slider.css      # Стили
```

## API компонента

### Inputs (входные параметры)

| Параметр              | Тип                      | Обязательный | По умолчанию     | Описание                              |
| --------------------- | ------------------------ | ------------ | ---------------- | ------------------------------------- |
| `courses`             | `Course[]`               | ✅ Да        | -                | Массив курсов для отображения         |
| `showMoreLink`        | `boolean`                | ❌ Нет       | `false`          | Показывать ли карточку "Смотреть все" |
| `moreLinkText`        | `string`                 | ❌ Нет       | `'Смотреть все'` | Текст на карточке "Смотреть все"      |
| `moreLinkUrl`         | `string`                 | ❌ Нет       | `'/courses'`     | URL для карточки "Смотреть все"       |
| `moreLinkQueryParams` | `Record<string, string>` | ❌ Нет       | `{}`             | Query параметры для ссылки            |
| `config`              | `SliderConfig`           | ❌ Нет       | См. ниже         | Конфигурация слайдера                 |

### Outputs (выходные события)

| Событие       | Тип      | Описание                                |
| ------------- | -------- | --------------------------------------- |
| `courseClick` | `Course` | Срабатывает при клике на карточку курса |

### SliderConfig интерфейс

```typescript
interface SliderConfig {
  slidesToShow?: number; // Количество слайдов на экране
  slidesToScroll?: number; // Количество слайдов для прокрутки
  draggable?: boolean; // Поддержка свайпа
  showDots?: boolean; // Показывать точки-индикаторы
  showArrows?: boolean; // Показывать стрелки навигации
  responsive?: Array<{
    // Адаптивные настройки
    breakpoint: number;
    settings: {
      slidesToShow: number;
      slidesToScroll: number;
    };
  }>;
}
```

### Конфигурация по умолчанию

```typescript
{
  slidesToShow: 1,
  slidesToScroll: 1,
  draggable: true,
  showDots: true,
  showArrows: true,
  responsive: [
    { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 1 } },
    { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1 } },
    { breakpoint: 1280, settings: { slidesToShow: 4, slidesToScroll: 1 } }
  ]
}
```

## Примеры использования

### Базовое использование

```html
<app-course-slider [courses]="myCourses()" />
```

### С карточкой "Смотреть все"

```html
<app-course-slider
  [courses]="designCourses()"
  [showMoreLink]="true"
  [moreLinkText]="'Все курсы по дизайну'"
  [moreLinkUrl]="'/courses'"
  [moreLinkQueryParams]="{ tag: 'дизайн' }"
/>
```

### С обработкой клика и кастомной конфигурацией

```html
<app-course-slider
  [courses]="popularCourses()"
  [config]="{
    slidesToShow: 3,
    slidesToScroll: 2,
    showDots: false,
    showArrows: true
  }"
  (courseClick)="onCourseSelected($event)"
/>
```

### Без стрелок и точек

```html
<app-course-slider
  [courses]="courses()"
  [config]="{
    slidesToShow: 4,
    showDots: false,
    showArrows: false
  }"
/>
```

## Особенности реализации

### Signal-based подход

Компонент полностью построен на сигналах:

```typescript
// Inputs как сигналы
readonly courses = input.required<Course[]>();
readonly showMoreLink = input<boolean>(false);

// Outputs как сигналы
readonly courseClick = output<Course>();

// ViewChild как сигнал
private readonly gliderElement = viewChild<ElementRef<HTMLElement>>('gliderElement');

// Внутреннее состояние
readonly items = signal<Array<Course | 'link'>>([]);
```

### Автоматическая реактивность

Компонент использует `effect()` для автоматической реакции на изменения:

1. **Обновление items** - автоматически добавляет карточку "Смотреть все" при изменении `courses()` или `showMoreLink()`
2. **Инициализация Glider** - автоматически переинициализирует слайдер при изменении элемента, данных или конфигурации
3. **Автоматическая очистка** - `onCleanup` автоматически уничтожает Glider при изменении зависимостей

### Адаптивность

Слайдер автоматически адаптируется под размер экрана:

- **< 768px**: 1-2 слайда
- **768px - 1024px**: 2-3 слайда
- **1024px - 1280px**: 3 слайда
- **> 1280px**: 4 слайда

## Стилизация

### Основные CSS классы

- `.glider-container` - контейнер слайдера
- `.glider` - основной элемент Glider.js
- `.glider-slide` - отдельный слайд
- `.glider-prev` / `.glider-next` - кнопки навигации
- `.glider-dots` - контейнер точек
- `.more-link-card` - карточка "Смотреть все"

### Кастомизация через ::ng-deep

Для стилизации динамически создаваемых элементов Glider.js используется `:host ::ng-deep`:

```css
:host ::ng-deep .glider-track {
  gap: 16px !important;
}

:host ::ng-deep .glider-dot {
  /* стили точек */
}
```

## Преимущества компонента

✅ **Переиспользуемость** - можно использовать в любом месте приложения
✅ **Гибкость** - настраиваемая конфигурация через inputs
✅ **Современный подход** - полностью на сигналах
✅ **Автоматическая реактивность** - effect отслеживает все изменения
✅ **Типобезопасность** - TypeScript интерфейсы для конфигурации
✅ **Адаптивность** - встроенная поддержка responsive дизайна
✅ **Легковесность** - использует Glider.js вместо тяжелых библиотек

## Зависимости

- `glider-js`: ^1.7.9
- `@types/glider-js`: ^1.7.12
- Angular 17+ (для signal-based API)

## Интеграция в проект

1. Импортируйте компонент:

```typescript
import { CourseSliderComponent } from './components/course-slider/course-slider';
```

2. Добавьте в imports:

```typescript
@Component({
  imports: [CourseSliderComponent, ...]
})
```

3. Используйте в шаблоне:

```html
<app-course-slider [courses]="courses()" />
```

## Будущие улучшения

- [ ] Поддержка вертикального слайдера
- [ ] Автоматическая прокрутка (autoplay)
- [ ] Кастомные шаблоны для карточек
- [ ] Lazy loading изображений
- [ ] Анимации переходов
- [ ] Поддержка touch events для мобильных устройств
