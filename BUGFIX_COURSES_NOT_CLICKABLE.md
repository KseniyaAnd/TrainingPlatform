# Исправление: Курсы не кликабельные

## Проблема

Карточки курсов не были кликабельными на странице всех курсов (`/courses`).

## Причина

Свойство `[clickable]` было установлено в `isMyCoursesScope()`, что делало карточки кликабельными только на странице "Мои курсы" (`/courses?scope=me`).

### До исправления

```html
<app-course-card [course]="course" [clickable]="isMyCoursesScope()" ...></app-course-card>
```

**Логика:**

- `/courses` → `isMyCoursesScope() = false` → карточки **не кликабельны** ❌
- `/courses?scope=me` → `isMyCoursesScope() = true` → карточки **кликабельны** ✅

## Решение

Установлено `[clickable]="true"` для всех карточек.

### После исправления

```html
<app-course-card [course]="course" [clickable]="true" ...></app-course-card>
```

**Логика:**

- `/courses` → карточки **кликабельны** ✅
- `/courses?scope=me` → карточки **кликабельны** ✅

## Поведение карточки курса

### Когда clickable = true

Карточка становится ссылкой (`<a>`) с навигацией:

```typescript
// В course-card.html
@if (clickable) {
  <a
    [routerLink]="
      isStudent() && isEnrolled
        ? ['/courses', course.id, 'student']
        : ['/courses', course.id]
    "
  >
    <!-- Содержимое карточки -->
  </a>
}
```

**Навигация:**

- **Студент + записан** → `/courses/:id/student` (просмотр курса студентом)
- **Остальные** → `/courses/:id` (детали курса)

### Когда clickable = false

Карточка становится обычным `<div>` без навигации:

```typescript
@else {
  <div>
    <!-- Содержимое карточки -->
  </div>
}
```

## Зачем нужен параметр clickable?

Параметр `clickable` полезен в случаях, когда карточка используется:

1. **В модальном окне** - не нужна навигация
2. **В превью** - только для отображения
3. **В админ-панели** - другая логика кликов
4. **В списке выбора** - клик выбирает, а не переходит

### Пример использования

```html
<!-- Обычная страница - кликабельно -->
<app-course-card [course]="course" [clickable]="true" />

<!-- Модальное окно - не кликабельно -->
<app-course-card [course]="course" [clickable]="false" />

<!-- Админ-панель - не кликабельно, свои кнопки -->
<app-course-card [course]="course" [clickable]="false">
  <button (click)="editCourse()">Редактировать</button>
  <button (click)="deleteCourse()">Удалить</button>
</app-course-card>
```

## Почему раньше было isMyCoursesScope()?

Возможно, изначально была идея:

- На странице всех курсов - показывать кнопки записи, не делать кликабельным
- На странице моих курсов - делать кликабельным для быстрого перехода

Но это создавало плохой UX:

- ❌ Пользователь не может кликнуть на курс, чтобы узнать больше
- ❌ Нужно искать кнопку "Подробнее" или другой способ перехода
- ❌ Неинтуитивно - карточки выглядят кликабельными, но не работают

## Правильный подход

Карточки курсов **всегда должны быть кликабельными**:

```html
<app-course-card
  [course]="course"
  [clickable]="true"
  [showEnrollButton]="!isMyCoursesScope() && isStudent()"
  ...
></app-course-card>
```

**Логика:**

- Карточка **всегда кликабельна** → переход к деталям
- Кнопка "Записаться" **показывается только на странице всех курсов для студентов**
- Кнопка "Записаться" **не мешает клику на карточку** (event.stopPropagation())

## Взаимодействие с кнопками

В компоненте `course-card` кнопки должны останавливать всплытие события:

```typescript
// В course-card.ts
handleEnroll(event: Event): void {
  event.stopPropagation();  // Не переходить по ссылке
  event.preventDefault();
  this.enroll.emit();
}

handleUnenroll(event: Event): void {
  event.stopPropagation();  // Не переходить по ссылке
  event.preventDefault();
  this.unenroll.emit();
}
```

Это позволяет:

- Кликнуть на карточку → перейти к деталям
- Кликнуть на кнопку "Записаться" → записаться без перехода

## Тестирование

### Проверьте на странице всех курсов (/courses)

- [ ] Карточки курсов кликабельны
- [ ] Клик на карточку переходит к деталям курса
- [ ] Для студентов показываются кнопки "Записаться"/"Отписаться"
- [ ] Клик на кнопку записи не переходит к деталям
- [ ] Hover эффект работает (курсор pointer, тень)

### Проверьте на странице моих курсов (/courses?scope=me)

- [ ] Карточки курсов кликабельны
- [ ] Клик на карточку переходит к деталям курса
- [ ] Для студентов: переход на `/courses/:id/student`
- [ ] Для преподавателей: переход на `/courses/:id`
- [ ] Кнопки записи НЕ показываются

### Проверьте навигацию

- [ ] Студент + записан → `/courses/:id/student`
- [ ] Студент + не записан → `/courses/:id`
- [ ] Преподаватель → `/courses/:id`
- [ ] Админ → `/courses/:id`

## Измененные файлы

- ✅ `src/app/pages/courses/courses.html` - установлено `[clickable]="true"`
- 📄 `BUGFIX_COURSES_NOT_CLICKABLE.md` - документация

## Дополнительные улучшения (опционально)

### 1. Добавить визуальную индикацию кликабельности

```css
/* В course-card.css */
.course-card {
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### 2. Добавить aria-label для доступности

```html
<a [routerLink]="..." [attr.aria-label]="'Перейти к курсу ' + course.title">
  <!-- Содержимое -->
</a>
```

### 3. Добавить keyboard navigation

```typescript
@HostListener('keydown.enter', ['$event'])
@HostListener('keydown.space', ['$event'])
onKeyPress(event: KeyboardEvent): void {
  if (this.clickable) {
    event.preventDefault();
    // Навигация
  }
}
```

## Урок

**Карточки в списках должны быть кликабельными по умолчанию.**

Это улучшает UX:

- ✅ Интуитивно - карточки выглядят кликабельными
- ✅ Быстро - один клик для перехода
- ✅ Доступно - работает с клавиатурой
- ✅ Мобильно - большая область для тапа

Исключения (clickable=false) должны быть редкими и обоснованными.
