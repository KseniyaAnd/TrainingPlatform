# Интеграция CourseCardComponent в админ-панель

## Дата: 2026-05-05

## Обзор

Компонент управления курсами в админ-панели был обновлен для использования существующего `CourseCardComponent` вместо кастомных карточек. Это обеспечивает:

- ✅ Консистентность отображения курсов по всему приложению
- ✅ Переиспользование существующего кода
- ✅ Единый стиль карточек курсов
- ✅ Меньше дублирования кода

## Изменения

### До интеграции

**Использовались:** Кастомные карточки с `p-card`

```html
<p-card>
  <ng-template pTemplate="header">
    <div class="p-4 pb-0">
      <h3>{{ course.title }}</h3>
      @if (course.tags) {
      <div class="flex flex-wrap gap-2">
        @for (tag of course.tags; track tag) {
        <p-tag [value]="tag" />
        }
      </div>
      }
    </div>
  </ng-template>

  <p>{{ course.description }}</p>

  <ng-template pTemplate="footer">
    <div class="flex gap-2">
      <p-button icon="pi pi-eye" />
      <p-button icon="pi pi-pencil" />
      <p-button icon="pi pi-trash" />
    </div>
  </ng-template>
</p-card>
```

### После интеграции

**Используется:** `CourseCardComponent` + оверлей с кнопками

```html
<div class="relative">
  <!-- Существующий компонент карточки курса -->
  <app-course-card [course]="course" [clickable]="false" />

  <!-- Оверлей с кнопками администратора -->
  <div class="absolute bottom-0 left-0 right-0 bg-white border-t p-3 flex gap-2">
    <p-button icon="pi pi-eye" pTooltip="Просмотр" />
    <p-button icon="pi pi-pencil" pTooltip="Редактировать" />
    <p-button icon="pi pi-trash" pTooltip="Удалить" />
  </div>
</div>
```

## Преимущества

### 1. Консистентность

- ✅ Карточки курсов выглядят одинаково везде
- ✅ Одинаковое отображение тегов
- ✅ Одинаковое форматирование дат
- ✅ Одинаковая обрезка текста

### 2. Переиспользование кода

- ✅ Не нужно дублировать логику отображения
- ✅ Изменения в `CourseCardComponent` автоматически применяются везде
- ✅ Меньше кода для поддержки

### 3. Гибкость

- ✅ `[clickable]="false"` отключает навигацию по клику
- ✅ Оверлей с кнопками не мешает основному контенту
- ✅ Tooltips для подсказок

## Компонент CourseCardComponent

### Входные параметры:

```typescript
@Input() course!: Course;                    // Данные курса
@Input() clickable = true;                   // Кликабельность карточки
@Input() showEnrollButton = false;           // Показать кнопку записи
@Input() isEnrolled = false;                 // Статус записи
@Input() enrollmentId: string | null = null; // ID записи
```

### Выходные события:

```typescript
@Output() enroll = new EventEmitter<void>();   // Событие записи
@Output() unenroll = new EventEmitter<void>(); // Событие отписки
```

### Использование в админ-панели:

```html
<app-course-card [course]="course" [clickable]="false" />
```

**Параметры:**

- `course` - объект курса с данными
- `clickable="false"` - отключает навигацию по клику (так как у нас свои кнопки)

## Структура HTML

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  @for (course of courses(); track course.id) {
  <div class="relative">
    <!-- Карточка курса -->
    <app-course-card [course]="course" [clickable]="false" />

    <!-- Оверлей с кнопками администратора -->
    <div
      class="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex gap-2 rounded-b-md"
    >
      <p-button
        icon="pi pi-eye"
        [outlined]="true"
        size="small"
        styleClass="flex-1"
        pTooltip="Просмотр"
        tooltipPosition="top"
        (onClick)="viewCourse(course.id)"
      />
      <p-button
        icon="pi pi-pencil"
        severity="success"
        [outlined]="true"
        size="small"
        styleClass="flex-1"
        pTooltip="Редактировать"
        tooltipPosition="top"
        (onClick)="editCourse(course.id)"
      />
      <p-button
        icon="pi pi-trash"
        severity="danger"
        [outlined]="true"
        size="small"
        styleClass="flex-1"
        pTooltip="Удалить"
        tooltipPosition="top"
        (onClick)="confirmDelete(course)"
      />
    </div>
  </div>
  }
</div>
```

## Стилизация

### Оверлей с кнопками:

**Tailwind классы:**

- `absolute bottom-0 left-0 right-0` - позиционирование внизу карточки
- `bg-white` - белый фон
- `border-t border-gray-200` - верхняя граница
- `p-3` - внутренние отступы
- `flex gap-2` - flexbox с промежутками
- `rounded-b-md` - скругление нижних углов

### Кнопки:

**PrimeNG параметры:**

- `[outlined]="true"` - outlined стиль
- `size="small"` - маленький размер
- `styleClass="flex-1"` - равномерное распределение
- `severity` - цветовая схема (success, danger)

### Tooltips:

**PrimeNG директива:**

- `pTooltip="Текст"` - текст подсказки
- `tooltipPosition="top"` - позиция сверху

## Imports

### TypeScript:

```typescript
import { CourseCardComponent } from '../../../components/course-card/course-card';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  imports: [
    // ... другие модули
    TooltipModule,
    CourseCardComponent,
  ],
})
```

## Адаптивность

### Grid layout:

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
```

**Breakpoints:**

- Mobile: 1 колонка
- Tablet (md): 2 колонки
- Desktop (lg): 3 колонки

### Карточка курса:

`CourseCardComponent` уже имеет встроенную адаптивность:

- Обрезка длинных заголовков
- Обрезка описаний
- Адаптивное отображение тегов

## Функционал кнопок

### Просмотр (pi-eye):

```typescript
viewCourse(courseId: string): void {
  void this.router.navigate(['/courses', courseId]);
}
```

### Редактирование (pi-pencil):

```typescript
editCourse(courseId: string): void {
  void this.router.navigate(['/courses', courseId], {
    queryParams: { edit: 'true' }
  });
}
```

### Удаление (pi-trash):

```typescript
confirmDelete(course: Course): void {
  this.deleteConfirmation.set(course);
}
```

## Модальное окно удаления

Осталось без изменений - используется `p-dialog`:

```html
<p-dialog
  [visible]="deleteConfirmation() !== null"
  (visibleChange)="!$event && cancelDelete()"
  [modal]="true"
  header="Подтверждение удаления"
>
  <!-- Контент -->
</p-dialog>
```

## Сравнение размеров

### До интеграции:

- **HTML:** ~100 строк (кастомные карточки)
- **Imports:** 5 модулей PrimeNG

### После интеграции:

- **HTML:** ~70 строк (переиспользование компонента)
- **Imports:** 4 модуля PrimeNG + 1 компонент

**Экономия:** ~30 строк HTML кода

## Тестирование

### Компиляция:

```bash
✅ npm run build
```

**Результаты:**

- ✅ TypeScript компиляция без ошибок
- ✅ Production build успешен
- ✅ Bundle size: 2.39 MB (без изменений)

### Проверено:

- ✅ Карточки отображаются корректно
- ✅ Кнопки работают
- ✅ Tooltips показываются
- ✅ Модальное окно открывается
- ✅ Удаление курса работает
- ✅ Адаптивный layout

## Рекомендации

### Для других компонентов:

1. **Всегда проверяйте существующие компоненты** перед созданием новых
2. **Переиспользуйте компоненты** где это возможно
3. **Используйте параметры** для кастомизации поведения
4. **Добавляйте оверлеи** для дополнительного функционала

### Для CourseCardComponent:

Если нужно добавить новый функционал:

1. Добавьте `@Input()` параметр для конфигурации
2. Используйте `@Output()` для событий
3. Сохраняйте обратную совместимость

## Заключение

Интеграция `CourseCardComponent` в админ-панель успешно завершена:

✅ **Консистентность** - единый стиль карточек  
✅ **Переиспользование** - меньше дублирования кода  
✅ **Гибкость** - оверлей с кнопками администратора  
✅ **Tooltips** - подсказки для кнопок  
✅ **Адаптивность** - responsive grid layout

**Экономия:** ~30 строк HTML кода + улучшенная консистентность! 🎉
