# Руководство по миграции на единый компонент курсов

## Что изменилось?

Теперь все страницы со списком курсов используют один компонент `CoursesPage` с управлением через query parameters.

## Изменения в маршрутах

### До

```typescript
/courses                    - Все курсы
/my-courses/teaching        - Мои созданные курсы (преподаватель)
/my-courses/learning        - Мои курсы (студент)
/my-courses/teaching/create - Создать курс
```

### После

```typescript
/courses                    - Все курсы
/courses?scope=me           - Мои курсы (автоматически определяет роль)
/courses/create             - Создать курс

// Старые маршруты автоматически перенаправляются на новые
/my-courses/teaching        → /courses?scope=me
/my-courses/learning        → /courses?scope=me
/my-courses/teaching/create → /courses/create
```

## Как обновить код

### 1. Обновите ссылки в шаблонах

#### Было:

```html
<a routerLink="/my-courses/teaching">Мои курсы</a>
<a routerLink="/my-courses/learning">Мои курсы</a>
<a routerLink="/my-courses/teaching/create">Создать курс</a>
```

#### Стало:

```html
<a [routerLink]="['/courses']" [queryParams]="{ scope: 'me' }">Мои курсы</a>
<a routerLink="/courses/create">Создать курс</a>
```

### 2. Обновите навигацию в компонентах

#### Было:

```typescript
this.router.navigate(['/my-courses/teaching']);
this.router.navigate(['/my-courses/learning']);
this.router.navigate(['/my-courses/teaching/create']);
```

#### Стало:

```typescript
this.router.navigate(['/courses'], { queryParams: { scope: 'me' } });
this.router.navigate(['/courses/create']);
```

## Дополнительные возможности

### Фильтрация по тегам

```typescript
this.router.navigate(['/courses'], {
  queryParams: { tag: 'фронтенд' },
});
```

### Поиск

```typescript
this.router.navigate(['/courses'], {
  queryParams: { q: 'Angular' },
});
```

### Комбинация параметров

```typescript
this.router.navigate(['/courses'], {
  queryParams: {
    scope: 'me',
    tag: 'фронтенд',
    q: 'Angular',
  },
});
```

## Удаленные компоненты

Следующие компоненты больше не используются и могут быть удалены:

- `MyLearningCoursesPage` (src/app/pages/courses/my-learning-courses/)
- `MyCreatedCoursesPage` (src/app/pages/courses/my-created-courses/)

**Примечание:** Пока эти компоненты оставлены для обратной совместимости, но рекомендуется обновить все ссылки на новый формат.

## Проверка миграции

После обновления кода проверьте:

1. ✅ Навигация "Мои курсы" работает для студентов и преподавателей
2. ✅ Кнопка "Создать курс" отображается только для преподавателей на странице "Мои курсы"
3. ✅ Старые URL автоматически перенаправляются на новые
4. ✅ Фильтрация и поиск работают корректно
5. ✅ Кнопки "Записаться"/"Отписаться" работают для студентов

## Преимущества

- 🎯 Единый компонент - проще поддерживать
- 🔄 Гибкая фильтрация через query params
- 🌐 SEO-friendly URL
- 📱 Лучшая навигация - параметры можно менять без перезагрузки
- 🚀 Меньше дублирования кода
