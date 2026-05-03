# Компонент фильтров курсов

## Обзор

Создан новый компонент `CourseFiltersComponent` для фильтрации и сортировки курсов в мятном стиле.

## Функциональность

### Фильтрация по тегам

- дизайн
- фронтенд
- бэкенд
- машинное обучение
- DevOps
- Мобильная разработка

### Сортировка

- По дате создания (новые первыми)
- По алфавиту (A-Z)

### Очистка фильтров

Кнопка "Очистить фильтры" появляется, когда выбран хотя бы один фильтр.

## Дизайн

### Неактивный фильтр

```
┌─────────────┐
│  фронтенд   │  ← Мятная граница 1px (#34d399)
└─────────────┘     Мятный текст (#34d399)
                    Прозрачный фон
```

### Активный фильтр

```
┌─────────────┐
│  фронтенд   │  ← Мятный фон (#34d399)
└─────────────┘     Белый текст (#ffffff)
                    Мятная граница (#34d399)
```

### Hover эффект

- **Неактивный:** Светло-мятный фон (#d1fae5) + подъем на 1px
- **Активный:** Темно-мятный фон (#10b981)

## Структура файлов

```
src/app/components/course-filters/
├── course-filters.ts       # Логика компонента
├── course-filters.html     # Шаблон
└── course-filters.css      # Стили (мятная тема)
```

## API компонента

### Inputs

```typescript
@Input() selectedTag: string | null = null;
@Input() selectedSort: 'date' | 'title' | null = null;
```

### Outputs

```typescript
@Output() filtersChange = new EventEmitter<CourseFilters>();

interface CourseFilters {
  tag: string | null;
  sortBy: 'date' | 'title' | null;
}
```

### Методы

```typescript
selectTag(tag: string): void          // Выбрать/снять тег
selectSort(sort: 'date' | 'title'): void  // Выбрать/снять сортировку
clearFilters(): void                  // Очистить все фильтры
```

## Использование

### В шаблоне

```html
<app-course-filters
  [selectedTag]="tag()"
  [selectedSort]="sortBy()"
  (filtersChange)="onFiltersChange($event)"
></app-course-filters>
```

### В компоненте

```typescript
onFiltersChange(filters: CourseFilters): void {
  // Обновить query параметры
  this.router.navigate([], {
    queryParams: {
      tag: filters.tag,
      sortBy: filters.sortBy,
    },
    queryParamsHandling: 'merge',
  });
}
```

## Интеграция с CoursesPage

### 1. Импорты

```typescript
import {
  CourseFilters,
  CourseFiltersComponent,
} from '../../components/course-filters/course-filters';
```

### 2. Добавлен в imports

```typescript
@Component({
  imports: [CommonModule, RouterLink, CourseCardComponent, CourseFiltersComponent],
})
```

### 3. Обновлена логика фильтрации

```typescript
readonly filteredItems = computed(() => {
  let items = this.items();

  // Фильтрация по тегу
  if (tag) {
    items = items.filter((c) => (c.tags ?? []).includes(tag));
  }

  // Фильтрация по поиску
  if (q) {
    items = items.filter((c) => c.title.toLowerCase().includes(q));
  }

  // Сортировка
  const sortBy = this.route.snapshot.queryParamMap.get('sortBy');
  if (sortBy === 'title') {
    items = [...items].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'date') {
    items = [...items].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return items;
});
```

### 4. Добавлен обработчик

```typescript
onFiltersChange(filters: CourseFilters): void {
  const queryParams: Record<string, string | null> = {
    tag: filters.tag,
    sortBy: filters.sortBy,
  };

  // Сохраняем существующие параметры (scope, q)
  const currentParams = this.route.snapshot.queryParamMap;
  if (currentParams.has('scope')) {
    queryParams['scope'] = currentParams.get('scope');
  }
  if (currentParams.has('q')) {
    queryParams['q'] = currentParams.get('q');
  }

  void this.router.navigate([], {
    relativeTo: this.route,
    queryParams,
    queryParamsHandling: 'merge',
  });
}
```

## Query Parameters

### Примеры URL

```
/courses?tag=фронтенд
/courses?sortBy=date
/courses?tag=фронтенд&sortBy=title
/courses?scope=me&tag=дизайн&sortBy=date
```

### Параметры

| Параметр | Значения          | Описание          |
| -------- | ----------------- | ----------------- |
| `tag`    | string            | Фильтр по тегу    |
| `sortBy` | `date` \| `title` | Сортировка        |
| `scope`  | `me` \| `all`     | Мои/все курсы     |
| `q`      | string            | Поиск по названию |

## CSS классы

### Контейнер

```css
.filters-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
```

### Фильтр чип

```css
.filter-chip {
  padding: 0.5rem 1rem;
  border: 1px solid #34d399; /* Мятная граница */
  border-radius: 9999px; /* Полностью скругленный */
  background-color: transparent;
  color: #34d399; /* Мятный текст */
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-chip.active {
  background-color: #34d399; /* Мятный фон */
  color: #ffffff; /* Белый текст */
}
```

### Кнопка очистки

```css
.clear-button {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: transparent;
  color: #6b7280;
}
```

## Адаптивность

### Mobile (< 640px)

- Уменьшенные отступы: `padding: 0.375rem 0.75rem`
- Уменьшенный шрифт: `font-size: 0.8125rem`
- Уменьшенный gap: `gap: 0.375rem`

### Desktop (≥ 640px)

- Стандартные отступы: `padding: 0.5rem 1rem`
- Стандартный шрифт: `font-size: 0.875rem`
- Стандартный gap: `gap: 0.5rem`

## Визуальный пример

```
┌─────────────────────────────────────────────────────┐
│ Теги                                                │
│ ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐  │
│ │ дизайн  │ │фронтенд  │ │ бэкенд │ │машинное  │  │
│ └─────────┘ └──────────┘ └────────┘ │обучение  │  │
│ ┌────────┐ ┌──────────────────┐     └──────────┘  │
│ │DevOps  │ │Мобильная         │                   │
│ └────────┘ │разработка        │                   │
│            └──────────────────┘                    │
│                                                     │
│ Сортировка                                          │
│ ┌──────────────────┐ ┌─────────────┐              │
│ │По дате создания  │ │По алфавиту  │              │
│ └──────────────────┘ └─────────────┘              │
│                                                     │
│ ┌──────────────────┐                               │
│ │✕ Очистить фильтры│                               │
│ └──────────────────┘                               │
└─────────────────────────────────────────────────────┘
```

## Преимущества

✅ **Мятный стиль** - соответствует дизайну приложения  
✅ **Интуитивность** - понятные чипы с toggle поведением  
✅ **Адаптивность** - работает на всех устройствах  
✅ **Производительность** - использует query parameters  
✅ **Переиспользуемость** - standalone компонент  
✅ **Accessibility** - семантические кнопки

## Тестирование

### Функциональность

- [ ] Клик на тег активирует фильтр
- [ ] Повторный клик на тег снимает фильтр
- [ ] Клик на сортировку активирует её
- [ ] Повторный клик на сортировку снимает её
- [ ] Можно выбрать только один тег
- [ ] Можно выбрать только одну сортировку
- [ ] Кнопка "Очистить" появляется при выборе фильтра
- [ ] Кнопка "Очистить" сбрасывает все фильтры

### URL

- [ ] Выбор тега обновляет `?tag=...`
- [ ] Выбор сортировки обновляет `?sortBy=...`
- [ ] Очистка удаляет параметры из URL
- [ ] Другие параметры (scope, q) сохраняются

### Визуал

- [ ] Неактивный: мятная граница, мятный текст
- [ ] Активный: мятный фон, белый текст
- [ ] Hover на неактивном: светло-мятный фон
- [ ] Hover на активном: темно-мятный фон
- [ ] Адаптивность на мобильных

## Измененные файлы

- ✅ `src/app/components/course-filters/course-filters.ts` - создан
- ✅ `src/app/components/course-filters/course-filters.html` - создан
- ✅ `src/app/components/course-filters/course-filters.css` - создан
- ✅ `src/app/pages/courses/courses.ts` - интегрирован компонент
- ✅ `src/app/pages/courses/courses.html` - добавлен компонент
- 📄 `COURSE_FILTERS_COMPONENT.md` - документация
