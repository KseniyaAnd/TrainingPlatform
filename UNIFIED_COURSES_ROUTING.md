# Unified Courses Routing

## Обзор

Все страницы со списком курсов теперь используют единый компонент `CoursesPage` с управлением через query parameters. Это упрощает навигацию и поддержку кода.

## Маршруты

### Основной маршрут

```
/courses
```

### Query Parameters

| Parameter | Значение              | Описание                                                       |
| --------- | --------------------- | -------------------------------------------------------------- |
| `scope`   | `me`                  | Мои курсы (enrolled для студентов, created для преподавателей) |
| `scope`   | `all` или отсутствует | Все доступные курсы                                            |
| `tag`     | строка                | Фильтр по тегу                                                 |
| `q`       | строка                | Поиск по названию курса                                        |

## Примеры использования

### 1. Все курсы

```typescript
// В шаблоне
<a routerLink="/courses">Все курсы</a>

// В компоненте
this.router.navigate(['/courses']);
```

### 2. Мои курсы

```typescript
// В шаблоне
<a [routerLink]="['/courses']" [queryParams]="{ scope: 'me' }">Мои курсы</a>

// В компоненте
this.router.navigate(['/courses'], { queryParams: { scope: 'me' } });
```

### 3. Курсы с фильтром по тегу

```typescript
// В шаблоне
<a [routerLink]="['/courses']" [queryParams]="{ tag: 'фронтенд' }">Фронтенд курсы</a>

// В компоненте
this.router.navigate(['/courses'], { queryParams: { tag: 'фронтенд' } });
```

### 4. Поиск курсов

```typescript
// В компоненте
this.router.navigate(['/courses'], { queryParams: { q: 'Angular' } });
```

### 5. Комбинация параметров

```typescript
// Мои курсы с поиском
this.router.navigate(['/courses'], {
  queryParams: { scope: 'me', q: 'Angular' },
});
```

## Поведение компонента

### Для студентов

#### `scope=me`

- Загружает курсы, на которые студент записан
- Использует `coursesService.getEnrolledCourses()`
- Показывает карточки курсов без кнопки "Записаться"

#### `scope=all` или без параметра

- Загружает все доступные курсы
- Использует `coursesService.loadCoursesWithEnrollmentStatus()`
- Показывает статус записи и кнопку "Записаться"/"Отписаться"

### Для преподавателей

#### `scope=me`

- Загружает курсы, созданные преподавателем
- Использует `coursesService.getMyCourses()`
- Показывает кнопку "Create course"

#### `scope=all` или без параметра

- Загружает все доступные курсы
- Использует `coursesService.getCourses()`

## Создание курса

### Маршрут

```
/courses/create
```

### Навигация

```typescript
// В шаблоне
<a routerLink="/courses/create">Создать курс</a>

// В компоненте
this.router.navigate(['/courses/create']);
```

### После создания

После успешного создания курса пользователь перенаправляется на страницу деталей:

```typescript
this.router.navigateByUrl(`/courses/${course.id}`);
```

## Обратная совместимость

Старые маршруты автоматически перенаправляются на новые:

| Старый маршрут                | Новый маршрут       |
| ----------------------------- | ------------------- |
| `/my-courses/teaching`        | `/courses?scope=me` |
| `/my-courses/learning`        | `/courses?scope=me` |
| `/my-courses/teaching/create` | `/courses/create`   |

## Детали курса

Маршруты для просмотра деталей курса остаются без изменений:

```
/courses/:courseId           - Детали курса (для всех)
/courses/:courseId/student   - Просмотр курса студентом
```

## Преимущества нового подхода

1. **Единый компонент** - проще поддерживать и тестировать
2. **Гибкая фильтрация** - легко добавлять новые фильтры через query params
3. **Чистые URL** - `/courses?scope=me` вместо `/my-courses/learning`
4. **Переиспользование логики** - один компонент для всех ролей
5. **Простая навигация** - изменение параметров не требует перезагрузки компонента
6. **SEO-friendly** - понятные URL с параметрами

## Миграция существующего кода

Если в вашем коде есть ссылки на старые маршруты, обновите их:

```typescript
// Было
routerLink =
  // Стало
  '/my-courses/teaching'[routerLink] =
  "['/courses']"[queryParams] =
    "{ scope: 'me' }";

// Было
routerLink = '/my-courses/teaching/create';

// Стало
routerLink = '/courses/create';
```
