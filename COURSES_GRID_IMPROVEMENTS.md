# Улучшения грида курсов

## Что изменилось

### 1. Адаптивный грид

**До:** 2 колонки на малых экранах  
**После:** Адаптивная сетка с breakpoints:

- **Mobile (< 640px):** 1 колонка
- **Tablet (≥ 640px):** 2 колонки
- **Desktop (≥ 1024px):** 3 колонки
- **Large Desktop (≥ 1280px):** 4 колонки

```html
<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"></div>
```

### 2. Улучшенный header

- Адаптивная раскладка (колонка на мобильных, строка на десктопе)
- Динамический подзаголовок в зависимости от контекста
- Улучшенная кнопка "Create course" с иконкой

### 3. Skeleton loading

Вместо простого текста "Loading..." теперь отображаются 8 skeleton карточек с анимацией pulse:

```html
<div class="animate-pulse">
  <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
  <div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
  ...
</div>
```

### 4. Empty state

Красивое пустое состояние с:

- Иконкой книги
- Контекстным сообщением
- Кнопкой действия (создать курс или исследовать курсы)

### 5. Улучшенное состояние ошибки

- Красная карточка с иконкой
- Четкое сообщение об ошибке
- Лучшая видимость

### 6. Индикатор загрузки "Load more"

- Spinner анимация при загрузке следующей страницы
- Улучшенная кнопка "Load more" с иконкой
- Отдельный индикатор для загрузки дополнительных курсов

### 7. Улучшенный spacing и padding

- Увеличен контейнер до `max-w-7xl` для лучшего использования пространства
- Добавлены адаптивные отступы: `px-4 sm:px-6 lg:px-8`
- Увеличен gap между карточками до `gap-6`

## Визуальное сравнение

### До

```
┌─────────────────────────────────────┐
│  Courses                            │
│  Available courses:        [Create] │
│                                     │
│  ┌──────────┐  ┌──────────┐       │
│  │ Course 1 │  │ Course 2 │       │
│  └──────────┘  └──────────┘       │
│  ┌──────────┐  ┌──────────┐       │
│  │ Course 3 │  │ Course 4 │       │
│  └──────────┘  └──────────┘       │
│                                     │
│  [Load more]                        │
└─────────────────────────────────────┘
```

### После

```
┌───────────────────────────────────────────────────────────┐
│  Courses                                      [+ Create]   │
│  Explore available courses                                │
│                                                           │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐        │
│  │Course 1│  │Course 2│  │Course 3│  │Course 4│        │
│  └────────┘  └────────┘  └────────┘  └────────┘        │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐        │
│  │Course 5│  │Course 6│  │Course 7│  │Course 8│        │
│  └────────┘  └────────┘  └────────┘  └────────┘        │
│                                                           │
│                  [🔄 Load more courses]                   │
└───────────────────────────────────────────────────────────┘
```

## Breakpoints

### Mobile (< 640px)

```
┌─────────────┐
│   Course 1  │
├─────────────┤
│   Course 2  │
├─────────────┤
│   Course 3  │
└─────────────┘
```

### Tablet (640px - 1023px)

```
┌──────────┬──────────┐
│ Course 1 │ Course 2 │
├──────────┼──────────┤
│ Course 3 │ Course 4 │
└──────────┴──────────┘
```

### Desktop (1024px - 1279px)

```
┌────────┬────────┬────────┐
│Course 1│Course 2│Course 3│
├────────┼────────┼────────┤
│Course 4│Course 5│Course 6│
└────────┴────────┴────────┘
```

### Large Desktop (≥ 1280px)

```
┌──────┬──────┬──────┬──────┐
│Cours1│Cours2│Cours3│Cours4│
├──────┼──────┼──────┼──────┤
│Cours5│Cours6│Cours7│Cours8│
└──────┴──────┴──────┴──────┘
```

## Новые состояния

### 1. Loading (первая загрузка)

- 8 skeleton карточек с pulse анимацией
- Адаптивный грид

### 2. Empty State

**Для студента (мои курсы):**

```
📚
No courses found
You haven't enrolled in any courses yet.
Explore available courses to get started.
[Explore courses]
```

**Для преподавателя (мои курсы):**

```
📚
No courses found
You haven't created any courses yet.
Start by creating your first course!
[Create your first course]
```

### 3. Error State

```
❌ Error loading courses
[Detailed error message]
```

### 4. Loading More

```
[Course 1] [Course 2] [Course 3] [Course 4]
[Course 5] [Course 6] [Course 7] [Course 8]

⟳ Loading more courses...
```

## CSS классы

### Контейнер

```html
class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
```

### Грид

```html
class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
```

### Кнопка Create

```html
class="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-violet-600 text-white
font-medium hover:bg-violet-700 transition-colors shadow-sm"
```

### Кнопка Load More

```html
class="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium
rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2
focus:ring-offset-2 focus:ring-violet-500 transition-colors"
```

## Преимущества

✅ **Лучшее использование пространства** - до 4 колонок на больших экранах  
✅ **Адаптивность** - отлично выглядит на всех устройствах  
✅ **Лучший UX** - skeleton loading вместо текста  
✅ **Информативность** - контекстные сообщения и empty states  
✅ **Визуальная иерархия** - четкое разделение состояний  
✅ **Accessibility** - семантические иконки и ARIA labels  
✅ **Производительность** - CSS Grid вместо Flexbox для сетки

## Тестирование

### Проверьте на разных размерах экрана:

- [ ] Mobile (375px) - 1 колонка
- [ ] Tablet (768px) - 2 колонки
- [ ] Desktop (1280px) - 3 колонки
- [ ] Large Desktop (1920px) - 4 колонки

### Проверьте все состояния:

- [ ] Loading (первая загрузка) - skeleton карточки
- [ ] Empty state - иконка и сообщение
- [ ] Error state - красная карточка
- [ ] Loaded - грид с курсами
- [ ] Loading more - spinner внизу
- [ ] Load more button - кнопка с иконкой

### Проверьте интерактивность:

- [ ] Hover на кнопках
- [ ] Клик на "Load more"
- [ ] Клик на "Create course"
- [ ] Клик на карточки курсов
