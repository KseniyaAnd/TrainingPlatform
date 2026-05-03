# Реализация роли администратора

## Обзор

Добавлена полная функциональность для роли ADMIN в платформе обучения.

## Новые компоненты

### 1. Панель администратора (`/admin`)

- **Компонент**: `AdminDashboardComponent`
- **Функции**:
  - Отображение статистики платформы
  - Карточки с количеством пользователей, курсов, записей
  - Средний балл по всем submissions
  - Быстрые действия для перехода к управлению

### 2. Управление пользователями (`/admin/users`)

- **Компонент**: `AdminUsersComponent`
- **Функции**:
  - Список всех пользователей
  - Фильтрация по ролям (ALL, ADMIN, TEACHER, STUDENT)
  - Просмотр деталей пользователя
  - Пагинация

### 3. Детали пользователя (`/admin/users/:userId`)

- **Компонент**: `AdminUserDetailsComponent`
- **Функции**:
  - Полная информация о пользователе
  - Список записей на курсы с прогрессом
  - Список созданных курсов
  - Список submissions с оценками

### 4. Управление курсами (`/admin/courses`)

- **Компонент**: `AdminCoursesComponent`
- **Функции**:
  - Список всех курсов
  - Просмотр, редактирование и удаление любого курса
  - Пагинация

## Новые сервисы

### AdminService

**Путь**: `src/app/services/admin/admin.service.ts`

**Методы**:

- `getPlatformStatistics()` - получение статистики платформы (только для ADMIN)
- `getUsers(params?)` - список пользователей с фильтрацией по роли
- `getUserDetails(userId)` - детальная информация о пользователе
- `getUserProfile(userId)` - профиль пользователя

## Обновленные модели

### PlatformStatistics

```typescript
interface PlatformStatistics {
  usersCount: number;
  coursesCount: number;
  enrollmentsCount: number;
  averageSubmissionScore: number;
}
```

### UserDetails

```typescript
interface UserDetails {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  enrollments: Array<{
    courseId: string;
    courseName: string;
    enrolledAt: string;
    progress: number;
  }>;
  courses: Array<{
    id: string;
    title: string;
    createdAt: string;
  }>;
  submissions: Array<{
    id: string;
    assessmentId: string;
    assessmentTitle: string;
    score: number | null;
    submittedAt: string;
  }>;
}
```

## API эндпоинты

### Эксклюзивный для ADMIN

- `GET /platform-statistics` - статистика платформы

### Доступные для ADMIN

- `GET /users` - список пользователей (с фильтром по роли)
- `GET /users/{userId}` - профиль пользователя
- `GET /users/{userId}/details` - детали пользователя
- `GET /courses` - все курсы
- `GET /courses/{courseId}` - любой курс
- `PATCH /courses/{courseId}` - редактировать курс
- `DELETE /courses/{courseId}` - удалить курс
- `POST /lessons` - создать урок
- `PATCH /lessons/{lessonId}` - редактировать урок
- `DELETE /lessons/{lessonId}` - удалить урок
- `POST /lectures` - создать лекцию
- `PATCH /lectures/{lectureId}` - редактировать лекцию
- `DELETE /lectures/{lectureId}` - удалить лекцию
- `POST /assessments` - создать assessment
- `PATCH /submissions/{id}` - выставить оценку
- `GET /submissions/assessment/{assessmentId}` - все ответы по assessment
- `GET /courses/{courseId}/ai/student-analytics` - AI аналитика по курсу
- `GET /courses/{courseId}/students/{studentId}/ai-study-plan` - AI план студента

## Навигация

### Хедер

Для пользователей с ролью ADMIN добавлена кнопка "Админ панель" в хедере.

### Роуты

```typescript
{
  path: 'admin',
  component: AdminDashboardComponent,
},
{
  path: 'admin/users',
  component: AdminUsersComponent,
},
{
  path: 'admin/users/:userId',
  component: AdminUserDetailsComponent,
},
{
  path: 'admin/courses',
  component: AdminCoursesComponent,
}
```

## Проверки доступа

Все админские компоненты проверяют роль пользователя в `ngOnInit()`:

```typescript
if (this.authState.role() !== 'ADMIN') {
  this.router.navigate(['/']);
  return;
}
```

## Обновления в существующих компонентах

### CourseDetailsPage

- Добавлен `isAdmin` computed signal
- `canEditCourse` теперь проверяет роли TEACHER и ADMIN

### HeaderComponent

- Добавлен `isAdmin` computed signal
- Кнопка "Админ панель" отображается только для админов

## Стилизация

Все админские компоненты используют:

- PrimeNG компоненты (Card, Table, Button, ProgressSpinner)
- Tailwind CSS для утилитарных классов
- Кастомные CSS файлы для специфичных стилей

## Особенности реализации

1. **Упрощенная навигация**: Вместо сложных табов используются отдельные карточки
2. **Фильтрация**: Кнопки вместо dropdown для лучшего UX
3. **Пагинация**: Кнопка "Загрузить ещё" для всех списков
4. **Безопасность**: Все компоненты проверяют роль перед отображением
5. **Типизация**: Строгая типизация для всех моделей и сервисов
