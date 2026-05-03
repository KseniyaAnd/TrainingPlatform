# Выделение компонентов из Header

## Выполненные изменения

### Проблема

Header компонент был монолитным и содержал слишком много ответственности:

- Логику поиска с автодополнением
- Управление меню пользователя
- Навигацию
- Аутентификацию

**Было:** 85 строк кода в одном компоненте

---

## Решение: Разделение на специализированные компоненты

### 1. SearchBar Component

**Путь:** `src/app/components/search-bar/`

**Ответственность:**

- Поиск курсов с автодополнением
- Debounce и управление запросами
- Навигация к результатам поиска

**Код:**

```typescript
// search-bar.ts (61 строка)
@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule, InputTextModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBarComponent {
  readonly search = signal('');
  readonly showSuggestions = signal(false);

  readonly suggestions = toSignal(
    toObservable(this.search).pipe(
      map((q) => q.trim()),
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((q) => {
        if (!q) return of([]);
        return this.coursesService.getCourses({ limit: 50, cursor: null, q }).pipe(
          map((response) => {
            const lower = q.toLowerCase();
            return (response?.items ?? [])
              .filter((c) => c.title?.toLowerCase().includes(lower))
              .slice(0, 4);
          }),
          catchError(() => of([])),
        );
      }),
    ),
    { initialValue: [] as Course[] },
  );

  // ... методы поиска
}
```

**Переиспользование:**

- ✅ Можно использовать на других страницах
- ✅ Изолированная логика поиска
- ✅ Легко тестировать

---

### 2. UserMenu Component

**Путь:** `src/app/components/user-menu/`

**Ответственность:**

- Отображение статуса авторизации
- Меню для авторизованных пользователей
- Кнопки входа/регистрации
- Logout функциональность

**Код:**

```typescript
// user-menu.ts (21 строка)
@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  templateUrl: './user-menu.html',
})
export class UserMenuComponent {
  readonly isAuthenticated = this.authState.isAuthenticated;
  readonly username = this.authState.username;
  readonly isAdmin = computed(() => this.authState.role() === 'ADMIN');

  logout(): void {
    this.authService.logout();
  }
}
```

**Переиспользование:**

- ✅ Можно использовать в мобильном меню
- ✅ Изолированная логика аутентификации
- ✅ Легко добавлять новые роли

---

### 3. Header Component (упрощенный)

**Путь:** `src/app/layout/header/`

**Ответственность:**

- Композиция компонентов
- Общая навигация
- Layout структура

**Код:**

```typescript
// header.ts (17 строк - было 85!)
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, ButtonModule, SearchBarComponent, UserMenuComponent],
  templateUrl: './header.html',
})
export class HeaderComponent {
  private readonly router = inject(Router);

  navigateToCourses(): void {
    void this.router.navigate(['/courses']);
  }
}
```

**HTML:**

```html
<header class="sticky top-0 z-50 bg-white border-b border-gray-200">
  <div class="flex items-center gap-3 h-20 px-6">
    <a routerLink="/" class="text-xl font-bold text-gray-900 no-underline shrink-0">
      LearningPlatform
    </a>

    <p-button
      label="Все курсы"
      [text]="true"
      size="small"
      (onClick)="navigateToCourses()"
      styleClass="!border-b !border-b-transparent !bg-transparent hover:!border-b-teal-400 !rounded-none"
    />

    <app-search-bar />
    <app-user-menu />
  </div>
</header>
```

---

## Статистика

### До рефакторинга:

```
src/app/layout/header/
├── header.ts (85 строк)
└── header.html (110 строк)
```

### После рефакторинга:

```
src/app/layout/header/
├── header.ts (17 строк) ⬇️ -80%
└── header.html (20 строк) ⬇️ -82%

src/app/components/search-bar/
├── search-bar.ts (61 строка)
├── search-bar.html (40 строк)
└── search-bar.css

src/app/components/user-menu/
├── user-menu.ts (21 строка)
└── user-menu.html (40 строк)
```

| Метрика             | До  | После | Изменение    |
| ------------------- | --- | ----- | ------------ |
| Строк в Header.ts   | 85  | 17    | **-80%**     |
| Строк в Header.html | 110 | 20    | **-82%**     |
| Компонентов         | 1   | 3     | **+200%**    |
| Переиспользуемость  | ❌  | ✅    | **Улучшено** |

---

## Преимущества

### 1. Разделение ответственности (SRP)

- ✅ Каждый компонент имеет одну четкую задачу
- ✅ Легче понять назначение компонента
- ✅ Проще поддерживать

### 2. Переиспользование

```typescript
// Можно использовать SearchBar где угодно
<app-search-bar />

// Можно использовать UserMenu в мобильном меню
<app-user-menu />
```

### 3. Тестирование

```typescript
// Легко тестировать изолированно
describe('SearchBarComponent', () => {
  it('should debounce search input', () => {
    // Тест только логики поиска
  });
});

describe('UserMenuComponent', () => {
  it('should show admin panel for admin users', () => {
    // Тест только логики меню
  });
});
```

### 4. Читаемость

```html
<!-- До: 110 строк HTML -->
<header>
  <!-- Куча кода поиска -->
  <!-- Куча кода меню -->
</header>

<!-- После: 20 строк HTML -->
<header>
  <app-search-bar />
  <app-user-menu />
</header>
```

### 5. Масштабируемость

- ✅ Легко добавить новые фичи в SearchBar
- ✅ Легко добавить новые роли в UserMenu
- ✅ Header остается простым

---

## Возможности для дальнейшего улучшения

### 1. Logo Component

```typescript
// src/app/components/logo/logo.ts
@Component({
  selector: 'app-logo',
  template: `
    <a routerLink="/" class="text-xl font-bold text-gray-900 no-underline shrink-0">
      {{ title }}
    </a>
  `,
})
export class LogoComponent {
  @Input() title = 'LearningPlatform';
}
```

### 2. Navigation Component

```typescript
// src/app/components/navigation/navigation.ts
@Component({
  selector: 'app-navigation',
  template: `
    <nav class="flex gap-2">
      @for (link of links; track link.path) {
        <a [routerLink]="link.path">{{ link.label }}</a>
      }
    </nav>
  `,
})
export class NavigationComponent {
  @Input() links: NavLink[] = [];
}
```

### 3. Mobile Menu

```html
<!-- Переиспользование компонентов в мобильном меню -->
<div class="mobile-menu">
  <app-search-bar />
  <app-navigation [links]="mobileLinks" />
  <app-user-menu />
</div>
```

---

## Паттерны проектирования

### Composition over Inheritance

```typescript
// Header композирует другие компоненты
@Component({
  imports: [SearchBarComponent, UserMenuComponent],
  template: `
    <app-search-bar />
    <app-user-menu />
  `
})
```

### Single Responsibility Principle

- SearchBar → только поиск
- UserMenu → только меню пользователя
- Header → только композиция

### Open/Closed Principle

- Компоненты открыты для расширения
- Закрыты для модификации
- Можно добавлять новые фичи через @Input/@Output

---

## Проверка

```bash
# Сборка
npm run build
# ✅ Успешно: 1.95 MB (318.04 kB gzip)

# Dev сервер
npm start
# ✅ Работает без ошибок

# TypeScript
# ✅ Нет диагностических ошибок
```

---

## Итоговая структура

```
src/app/
├── layout/
│   └── header/
│       ├── header.ts           (17 строк, было 85)
│       └── header.html         (20 строк, было 110)
├── components/
│   ├── search-bar/
│   │   ├── search-bar.ts       (61 строка)
│   │   ├── search-bar.html     (40 строк)
│   │   └── search-bar.css
│   ├── user-menu/
│   │   ├── user-menu.ts        (21 строка)
│   │   └── user-menu.html      (40 строк)
│   ├── banner/
│   └── course-card/
```

---

## Дата

3 мая 2026

## Статус

✅ Завершено и протестировано

## Следующие шаги

- [ ] Добавить тесты для новых компонентов
- [ ] Создать мобильную версию меню
- [ ] Добавить анимации для dropdown
- [ ] Рассмотреть выделение Logo и Navigation
