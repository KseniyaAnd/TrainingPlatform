# Утилиты приложения

Этот каталог содержит переиспользуемые утилиты для работы с общими паттернами в приложении.

## 📦 Доступные утилиты

### 1. `role.utils.ts` - Работа с ролями пользователей

Утилиты для отображения и форматирования ролей пользователей.

**Функции:**

- `getRoleSeverity(role: string): RoleSeverity` - Получить severity для PrimeNG компонентов
- `getRoleLabel(role: string): string` - Получить локализованное название роли

**Пример использования:**

```typescript
import { getRoleLabel, getRoleSeverity } from '@shared/utils/role.utils';

@Component({...})
export class MyComponent {
  // Expose для использования в шаблоне
  readonly getRoleSeverity = getRoleSeverity;
  readonly getRoleLabel = getRoleLabel;
}
```

```html
<p-tag [value]="getRoleLabel(user.role)" [severity]="getRoleSeverity(user.role)" />
```

---

### 2. `loading-state.ts` - Управление состоянием загрузки

Унифицированный паттерн для управления состоянием загрузки данных с типизацией.

**Интерфейс:**

```typescript
interface LoadingState<T> {
  data: WritableSignal<T | null>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
}
```

**Функции:**

- `createLoadingState<T>(initialData?)` - Создать новое состояние загрузки
- `resetLoadingState<T>(state)` - Сбросить состояние (начать загрузку)
- `setLoadingSuccess<T>(state, data)` - Установить успешное состояние
- `setLoadingError<T>(state, error)` - Установить состояние ошибки

**Пример использования:**

```typescript
import {
  createLoadingState,
  resetLoadingState,
  setLoadingSuccess,
  setLoadingError
} from '@shared/utils/loading-state';

@Component({...})
export class MyComponent {
  private readonly state = createLoadingState<User[]>([]);

  // Expose signals для шаблона
  readonly users = this.state.data;
  readonly loading = this.state.loading;
  readonly error = this.state.error;

  loadUsers(): void {
    resetLoadingState(this.state);

    this.service.getUsers().subscribe({
      next: (users) => setLoadingSuccess(this.state, users),
      error: (err) => setLoadingError(this.state, 'Ошибка загрузки'),
    });
  }
}
```

---

### 3. `error-handler.utils.ts` - Обработка ошибок

Стандартизированная обработка ошибок с логированием и локализацией.

**Функции:**

- `handleLoadError(error, context, customMessage?)` - Обработать ошибку загрузки
- `extractErrorMessage(error, fallback?)` - Извлечь сообщение из ошибки
- `isAuthError(error)` - Проверить, является ли ошибка ошибкой авторизации

**Пример использования:**

```typescript
import { handleLoadError, isAuthError } from '@shared/utils/error-handler.utils';

@Component({...})
export class MyComponent {
  loadData(): void {
    this.service.getData().subscribe({
      error: (err) => {
        const errorMessage = handleLoadError(err, 'users');
        setLoadingError(this.state, errorMessage);

        // Проверка на ошибку авторизации
        if (isAuthError(err)) {
          this.router.navigate(['/login']);
        }
      },
    });
  }
}
```

**Поддерживаемые контексты:**

- `'users'` → "Не удалось загрузить список пользователей"
- `'courses'` → "Не удалось загрузить список курсов"
- `'user details'` → "Не удалось загрузить данные пользователя"
- `'platform statistics'` → "Не удалось загрузить статистику платформы"
- `'submissions'` → "Не удалось загрузить список работ"
- `'course'` → "Не удалось загрузить курс"

---

## 🎯 Преимущества использования

### До рефакторинга:

```typescript
// Дублирование кода в каждом компоненте
readonly users = signal<User[]>([]);
readonly loading = signal(true);
readonly error = signal<string | null>(null);

loadUsers(): void {
  this.loading.set(true);
  this.error.set(null);

  this.service.getUsers().subscribe({
    next: (users) => {
      this.users.set(users);
      this.loading.set(false);
    },
    error: (err) => {
      console.error('Failed to load users:', err);
      this.error.set('Не удалось загрузить список пользователей');
      this.loading.set(false);
    },
  });
}

getRoleLabel(role: string): string {
  switch (role) {
    case 'ADMIN': return 'Администратор';
    case 'TEACHER': return 'Преподаватель';
    case 'STUDENT': return 'Студент';
    default: return role;
  }
}
```

### После рефакторинга:

```typescript
// Чистый, переиспользуемый код
private readonly state = createLoadingState<User[]>([]);
readonly users = this.state.data;
readonly loading = this.state.loading;
readonly error = this.state.error;
readonly getRoleLabel = getRoleLabel;

loadUsers(): void {
  resetLoadingState(this.state);

  this.service.getUsers().subscribe({
    next: (users) => setLoadingSuccess(this.state, users),
    error: (err) => {
      const errorMessage = handleLoadError(err, 'users');
      setLoadingError(this.state, errorMessage);
    },
  });
}
```

## 📊 Результаты рефакторинга

- ✅ Удалено ~150 строк дублирующегося кода
- ✅ Унифицирован паттерн загрузки данных
- ✅ Централизована обработка ошибок
- ✅ Улучшена типизация с помощью generics
- ✅ Упрощена поддержка и тестирование
