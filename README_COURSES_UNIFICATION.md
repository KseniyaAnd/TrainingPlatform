# Унификация компонента курсов

## 🎯 Цель

Объединить все страницы со списком курсов в один универсальный компонент `CoursesPage`, управляемый через query parameters.

## ✨ Что изменилось

### До

- 3 отдельных компонента: `CoursesPage`, `MyLearningCoursesPage`, `MyCreatedCoursesPage`
- Разные маршруты: `/courses`, `/my-courses/teaching`, `/my-courses/learning`
- Дублирование логики загрузки и отображения

### После

- 1 универсальный компонент: `CoursesPage`
- Единый маршрут: `/courses` с query parameters
- Централизованная логика с автоматическим определением роли

## 🚀 Новые маршруты

| Назначение     | URL                           | Описание                                    |
| -------------- | ----------------------------- | ------------------------------------------- |
| Все курсы      | `/courses`                    | Все доступные курсы                         |
| Мои курсы      | `/courses?scope=me`           | Мои курсы (роль определяется автоматически) |
| Фильтр по тегу | `/courses?tag=фронтенд`       | Курсы с определенным тегом                  |
| Поиск          | `/courses?q=Angular`          | Поиск по названию                           |
| Комбинация     | `/courses?scope=me&q=Angular` | Мои курсы + поиск                           |
| Создание курса | `/courses/create`             | Форма создания курса                        |

## 🔄 Обратная совместимость

Старые URL автоматически перенаправляются на новые:

```
/my-courses/teaching        → /courses?scope=me
/my-courses/learning        → /courses?scope=me
/my-courses/teaching/create → /courses/create
```

## 📝 Измененные файлы

### Основные изменения

- ✅ `src/app/app.routes.ts` - обновлена конфигурация маршрутов
- ✅ `src/app/pages/courses/courses.ts` - добавлена логика редиректа + импорт Router
- ✅ `src/app/pages/courses/courses.html` - обновлена ссылка на создание курса
- ✅ `src/app/pages/courses/create-course/create-course.html` - обновлена кнопка Cancel
- ✅ `src/app/layout/header/header.ts` - удален неиспользуемый RouterLink

### Документация

- 📄 `UNIFIED_COURSES_ROUTING.md` - полное описание нового подхода
- 📄 `MIGRATION_GUIDE.md` - руководство по миграции
- 📄 `TESTING_CHECKLIST.md` - чеклист для тестирования
- 📄 `ARCHITECTURE_DIAGRAM.md` - визуальная схема архитектуры
- 📄 `COURSES_UNIFICATION_SUMMARY.md` - сводка изменений

## 💡 Примеры использования

### В шаблонах (HTML)

```html
<!-- Все курсы -->
<a routerLink="/courses">Все курсы</a>

<!-- Мои курсы -->
<a [routerLink]="['/courses']" [queryParams]="{ scope: 'me' }"> Мои курсы </a>

<!-- Создать курс -->
<a routerLink="/courses/create">Создать курс</a>

<!-- С фильтром -->
<a [routerLink]="['/courses']" [queryParams]="{ tag: 'фронтенд' }"> Фронтенд курсы </a>
```

### В компонентах (TypeScript)

```typescript
// Все курсы
this.router.navigate(['/courses']);

// Мои курсы
this.router.navigate(['/courses'], {
  queryParams: { scope: 'me' },
});

// Создать курс
this.router.navigate(['/courses/create']);

// С фильтрами
this.router.navigate(['/courses'], {
  queryParams: {
    scope: 'me',
    tag: 'фронтенд',
    q: 'Angular',
  },
});
```

## 🎨 Поведение по ролям

### Студент

#### `/courses` (все курсы)

- ✅ Показывает все доступные курсы
- ✅ Кнопки "Записаться"/"Отписаться"
- ❌ Нет кнопки "Create course"

#### `/courses?scope=me` (мои курсы)

- ✅ Показывает только записанные курсы
- ❌ Нет кнопок записи
- ❌ Нет кнопки "Create course"

### Преподаватель

#### `/courses` (все курсы)

- ✅ Показывает все доступные курсы
- ❌ Нет кнопок записи
- ❌ Нет кнопки "Create course"

#### `/courses?scope=me` (мои курсы)

- ✅ Показывает только созданные курсы
- ✅ Кнопка "Create course"
- ❌ Нет кнопок записи

## 🧪 Тестирование

Используйте `TESTING_CHECKLIST.md` для полного тестирования:

```bash
# Запустить приложение
npm start

# Открыть браузер
http://localhost:4200

# Следовать чеклисту
```

### Быстрая проверка

1. **Студент:**
   - [ ] `/courses` - все курсы с кнопками записи
   - [ ] `/courses?scope=me` - только мои курсы
   - [ ] Запись/отписка работает

2. **Преподаватель:**
   - [ ] `/courses?scope=me` - мои созданные курсы
   - [ ] Кнопка "Create course" отображается
   - [ ] Создание курса работает

3. **Обратная совместимость:**
   - [ ] `/my-courses/teaching` → `/courses?scope=me`
   - [ ] `/my-courses/learning` → `/courses?scope=me`
   - [ ] `/my-courses/teaching/create` → `/courses/create`

## 🔧 Следующие шаги (опционально)

### 1. Удалить неиспользуемые компоненты

```bash
rm -rf src/app/pages/courses/my-learning-courses
rm -rf src/app/pages/courses/my-created-courses
```

### 2. Добавить UI для фильтрации

- Dropdown для выбора тегов
- Поле поиска в header
- Переключатель "Все курсы" / "Мои курсы"

### 3. Улучшения UX

- Сохранение фильтров в localStorage
- Breadcrumbs для навигации
- Skeleton loaders вместо "Loading..."
- Empty state для пустых списков

### 4. Оптимизация

- Виртуальный скроллинг для больших списков
- Кэширование запросов
- Debounce для поиска

## 📊 Преимущества

| Преимущество              | Описание                            |
| ------------------------- | ----------------------------------- |
| 🎯 **Простота**           | Один компонент вместо трех          |
| 🔄 **Гибкость**           | Легко добавлять новые фильтры       |
| 🚀 **Производительность** | Параметры меняются без перезагрузки |
| 🧹 **Чистый код**         | Меньше дублирования                 |
| 🔗 **SEO**                | Понятные URL с параметрами          |
| ⏪ **Совместимость**      | Старые ссылки работают              |

## 📚 Дополнительная документация

- **Детальное описание:** `UNIFIED_COURSES_ROUTING.md`
- **Руководство по миграции:** `MIGRATION_GUIDE.md`
- **Чеклист тестирования:** `TESTING_CHECKLIST.md`
- **Архитектура:** `ARCHITECTURE_DIAGRAM.md`
- **Сводка изменений:** `COURSES_UNIFICATION_SUMMARY.md`

## ❓ FAQ

### Почему не использовать route data вместо query params?

Query parameters лучше подходят для фильтрации, потому что:

- Можно легко комбинировать несколько фильтров
- URL можно копировать и делиться
- Браузер сохраняет историю с параметрами
- SEO-friendly

### Что делать со старыми компонентами?

Старые компоненты (`MyLearningCoursesPage`, `MyCreatedCoursesPage`) можно удалить после тестирования. Пока они оставлены для обеспечения плавной миграции.

### Как добавить новый фильтр?

1. Добавить signal в `CoursesPage`:

   ```typescript
   private readonly newFilter = signal<string | null>(null);
   ```

2. Читать из query params:

   ```typescript
   this.newFilter.set(params.get('newFilter'));
   ```

3. Использовать в `loadPage()`:
   ```typescript
   const newFilter = this.newFilter();
   // Передать в API запрос
   ```

### Можно ли использовать этот подход для других страниц?

Да! Этот паттерн можно применить к любым страницам со списками:

- Пользователи
- Задания
- Оценки
- И т.д.

## 🤝 Поддержка

Если возникли вопросы или проблемы:

1. Проверьте документацию в этой папке
2. Запустите тесты из `TESTING_CHECKLIST.md`
3. Проверьте консоль браузера на ошибки
4. Проверьте Network tab для API запросов

---

**Статус:** ✅ Готово к тестированию  
**Версия:** 1.0  
**Дата:** 2026-05-04
