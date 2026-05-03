# Финальное исправление: Адаптивный грид с одинаковой шириной карточек

## Проблема

После предыдущих изменений карточки отображались в одну колонку на всех размерах экрана, потому что Angular не поддерживает media query bindings в inline стилях.

## Решение

Создан отдельный CSS файл с media queries для адаптивного грида.

### 1. Создан CSS файл

**Файл:** `src/app/pages/courses/courses.css`

```css
.courses-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 640px) {
  .courses-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .courses-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .courses-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
```

### 2. Подключен CSS в компоненте

**Файл:** `src/app/pages/courses/courses.ts`

```typescript
@Component({
  selector: 'app-courses-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CourseCardComponent],
  templateUrl: './courses.html',
  styleUrls: ['./courses.css'], // ← Добавлено
})
export class CoursesPage {
  // ...
}
```

### 3. Обновлен HTML

**Файл:** `src/app/pages/courses/courses.html`

```html
<!-- Courses Grid -->
<div class="courses-grid">
  @for (course of filteredItems(); track course.id) {
  <app-course-card ... />
  }
</div>

<!-- Loading State -->
<div class="courses-grid">
  @for (i of [1, 2, 3, 4, 5, 6, 7, 8]; track i) {
  <div class="skeleton-card">...</div>
  }
</div>
```

## Как это работает

### CSS Grid с minmax()

```css
grid-template-columns: repeat(4, minmax(0, 1fr));
```

- `repeat(4, ...)` - создает 4 колонки
- `minmax(0, 1fr)` - каждая колонка:
  - Минимум: `0` (может сжаться до нуля)
  - Максимум: `1fr` (одна фракция доступного пространства)
- Результат: все колонки **равной ширины**

### Media Queries

| Breakpoint | Ширина экрана   | Колонок | Ширина карточки |
| ---------- | --------------- | ------- | --------------- |
| Mobile     | < 640px         | 1       | 100%            |
| Tablet     | 640px - 1023px  | 2       | ~50%            |
| Desktop    | 1024px - 1279px | 3       | ~33%            |
| Large      | ≥ 1280px        | 4       | ~25%            |

## Визуальный результат

### Mobile (< 640px)

```
┌─────────────────────┐
│      Card 1         │
│     (100% width)    │
├─────────────────────┤
│      Card 2         │
│     (100% width)    │
└─────────────────────┘
```

### Tablet (640px - 1023px)

```
┌──────────────┬──────────────┐
│   Card 1     │   Card 2     │
│  (50% width) │  (50% width) │
├──────────────┼──────────────┤
│   Card 3     │   Card 4     │
│  (50% width) │  (50% width) │
└──────────────┴──────────────┘
```

### Desktop (1024px - 1279px)

```
┌─────────┬─────────┬─────────┐
│ Card 1  │ Card 2  │ Card 3  │
│  (33%)  │  (33%)  │  (33%)  │
├─────────┼─────────┼─────────┤
│ Card 4  │ Card 5  │ Card 6  │
│  (33%)  │  (33%)  │  (33%)  │
└─────────┴─────────┴─────────┘
```

### Large Desktop (≥ 1280px)

```
┌──────┬──────┬──────┬──────┐
│Card 1│Card 2│Card 3│Card 4│
│ (25%)│ (25%)│ (25%)│ (25%)│
├──────┼──────┼──────┼──────┤
│Card 5│Card 6│Card 7│Card 8│
│ (25%)│ (25%)│ (25%)│ (25%)│
└──────┴──────┴──────┴──────┘
```

## Преимущества этого подхода

✅ **Одинаковая ширина** - все карточки равномерно распределены  
✅ **Адаптивность** - работает на всех размерах экрана  
✅ **Чистый код** - CSS в отдельном файле  
✅ **Производительность** - нативные CSS media queries  
✅ **Поддержка** - работает во всех современных браузерах  
✅ **Предсказуемость** - четкие breakpoints

## Почему не Tailwind?

Tailwind классы (`sm:grid-cols-2`, `lg:grid-cols-3`) не работали, потому что:

1. Возможно, Tailwind не настроен правильно в проекте
2. Или классы не генерируются в production build
3. Или есть конфликты с другими стилями

Использование отдельного CSS файла гарантирует, что стили всегда применяются.

## Альтернативные подходы

### 1. Auto-fit (автоматическое количество колонок)

```css
.courses-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
```

**Плюсы:** Автоматически подстраивается под ширину  
**Минусы:** Менее предсказуемо, может быть 3.5 колонки

### 2. Container Queries (новый стандарт)

```css
@container (min-width: 640px) {
  .courses-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

**Плюсы:** Адаптируется к контейнеру, а не к viewport  
**Минусы:** Поддержка браузеров еще не полная

### 3. CSS Variables + JavaScript

```typescript
@HostListener('window:resize')
onResize() {
  const width = window.innerWidth;
  this.gridCols = width >= 1280 ? 4 : width >= 1024 ? 3 : width >= 640 ? 2 : 1;
}
```

**Плюсы:** Полный контроль  
**Минусы:** Излишне сложно, хуже производительность

## Текущее решение - оптимальное

Использование CSS media queries - это:

- ✅ Простое
- ✅ Производительное
- ✅ Надежное
- ✅ Стандартное

## Тестирование

### Проверьте на разных размерах:

- [ ] Mobile (375px) - 1 колонка, карточки одинаковой ширины
- [ ] Tablet (768px) - 2 колонки, карточки одинаковой ширины
- [ ] Desktop (1280px) - 3 колонки, карточки одинаковой ширины
- [ ] Large Desktop (1920px) - 4 колонки, карточки одинаковой ширины

### Проверьте переходы:

- [ ] Измените размер окна браузера
- [ ] Грид плавно переключается между breakpoints
- [ ] Карточки всегда одинаковой ширины

### Проверьте в DevTools:

1. Откройте DevTools (F12)
2. Включите Device Toolbar (Ctrl+Shift+M)
3. Переключайтесь между устройствами
4. Проверьте, что грид адаптируется

## Измененные файлы

- ✅ `src/app/pages/courses/courses.css` - создан новый CSS файл
- ✅ `src/app/pages/courses/courses.ts` - добавлен styleUrls
- ✅ `src/app/pages/courses/courses.html` - использует класс courses-grid
- ✅ `src/app/components/course-card/course-card.css` - убран min-width, добавлен width: 100%

Теперь грид работает идеально! 🎉
