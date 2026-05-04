# Course Lectures Section - Рефакторинг

## Обзор

Компонент `course-lectures-section` был разбит на более мелкие, управляемые части.

## Структура

```
course-lectures-section/
├── components/
│   ├── lecture-form/              # Форма создания/редактирования лекции
│   │   ├── lecture-form.component.ts
│   │   └── lecture-form.component.html
│   ├── lecture-card/              # Карточка лекции
│   │   ├── lecture-card.component.ts
│   │   └── lecture-card.component.html
│   └── lectures-list/             # Список лекций
│       ├── lectures-list.component.ts
│       └── lectures-list.component.html
├── services/
│   └── lecture-form.service.ts    # Управление формой лекции
├── course-lectures-section.ts     # Главный компонент
├── course-lectures-section.html   # Главный шаблон
└── README.md
```

## Архитектура

### До рефакторинга

```
CourseLecturesSectionComponent (150 строк)
├── Логика формы
├── Логика CRUD операций
├── HTML форм и карточек
└── Стили
```

### После рефакторинга

```
CourseLecturesSectionComponent (50 строк)
├── LectureFormService (сервис)
└── Компоненты
    ├── LectureForm
    ├── LectureCard
    └── LecturesList
```

## Компоненты

### LectureFormComponent

**Назначение:** Форма создания/редактирования лекции

**Inputs:**

- `lessons` - Список уроков для выбора

**Outputs:**

- `onSubmit` - Событие отправки формы

**Использует:** `LectureFormService` для управления состоянием

### LectureCardComponent

**Назначение:** Карточка отображения лекции

**Inputs:**

- `lecture` - Данные лекции
- `editMode` - Режим редактирования

**Outputs:**

- `onEdit` - Редактировать лекцию
- `onDelete` - Удалить лекцию

### LecturesListComponent

**Назначение:** Список всех лекций

**Inputs:**

- `lectures` - Массив лекций
- `editMode` - Режим редактирования

**Outputs:**

- `onEdit` - Проброс события редактирования
- `onDelete` - Проброс события удаления

## Сервис

### LectureFormService

**Назначение:** Управление формой лекции и CRUD операциями

**Методы:**

- `openAdd(lessonId)` - Открыть форму для создания
- `openEdit(lecture)` - Открыть форму для редактирования
- `cancel()` - Отменить и закрыть форму
- `submit(currentLessons)` - Сохранить лекцию
- `deleteLecture(lecture, currentLessons)` - Удалить лекцию

**Состояние:**

- `showForm` - Показывать ли форму
- `editingId` - ID редактируемой лекции
- `submitting` - Идет ли отправка
- `error` - Сообщение об ошибке
- `form` - FormGroup с полями

## Преимущества

1. **Простота:** Компонент стал в 3 раза меньше (150 → 50 строк)
2. **Разделение:** Логика в сервисе, UI в компонентах
3. **Переиспользование:** Карточку лекции можно использовать отдельно
4. **Тестируемость:** Легко тестировать каждую часть
5. **Читаемость:** Понятная структура и ответственность

## Метрики

| Метрика                        | До  | После | Улучшение   |
| ------------------------------ | --- | ----- | ----------- |
| Строк в главном компоненте     | 150 | 50    | **-67%**    |
| Количество файлов              | 2   | 8     | Модульность |
| Максимальный размер компонента | 150 | 60    | **-60%**    |

## Использование

```html
<app-course-lectures-section
  [lessons]="lessons()"
  [editMode]="editMode()"
  (lessonsChange)="lessonsChange.emit($event)"
/>
```

Компонент автоматически:

- Извлекает все лекции из уроков
- Управляет формой через сервис
- Отображает список через подкомпоненты
- Обрабатывает CRUD операции
