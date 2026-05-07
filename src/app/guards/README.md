# Guards - Защита маршрутов

Этот каталог содержит guards для защиты маршрутов приложения на основе авторизации и ролей пользователей.

## Доступные Guards

### 1. `authGuard`

Проверяет, авторизован ли пользователь. Если нет - перенаправляет на страницу входа.

**Использование:**

```typescript
{
  path: 'courses',
  component: CoursesPage,
  canActivate: [authGuard]
}
```

**Поведение:**

- ✅ Пропускает авторизованных пользователей
- ❌ Перенаправляет неавторизованных на `/login` с параметром `returnUrl`

---

### 2. `roleGuard`

Проверяет, имеет ли пользователь одну из разрешенных ролей.

**Использование:**

```typescript
{
  path: 'courses/create',
  component: CreateCoursePage,
  canActivate: [authGuard, roleGuard],
  data: { roles: ['TEACHER', 'ADMIN'] }
}
```

**Поведение:**

- ✅ Пропускает пользователей с указанными ролями
- ❌ Перенаправляет остальных на главную страницу `/`
- ℹ️ Если роли не указаны в `data`, пропускает всех

---

### 3. `teacherGuard`

Специализированный guard для проверки прав преподавателя или администратора.

**Использование:**

```typescript
{
  path: 'assessments/:assessmentId/grade',
  component: AssessmentGradingComponent,
  canActivate: [authGuard, teacherGuard]
}
```

**Поведение:**

- ✅ Пропускает пользователей с ролями `TEACHER` или `ADMIN`
- ❌ Перенаправляет остальных на главную страницу `/`

---

### 4. `adminGuard`

Специализированный guard для проверки прав администратора.

**Использование:**

```typescript
{
  path: 'admin',
  canActivate: [authGuard, adminGuard],
  children: [...]
}
```

**Поведение:**

- ✅ Пропускает пользователей с ролью `ADMIN`
- ❌ Перенаправляет остальных на главную страницу `/`

---

## Комбинирование Guards

Guards можно комбинировать для создания сложных правил доступа:

```typescript
{
  path: 'admin/users',
  component: AdminUsersComponent,
  canActivate: [authGuard, adminGuard] // Сначала проверка авторизации, затем роли
}
```

**Порядок выполнения:**

1. `authGuard` - проверяет авторизацию
2. `adminGuard` - проверяет роль администратора

Если любой guard возвращает `false`, доступ блокируется.

---

## Защита дочерних маршрутов

Guards можно применять к родительским маршрутам для защиты всех дочерних:

```typescript
{
  path: 'admin',
  canActivate: [authGuard, adminGuard], // Защищает все дочерние маршруты
  children: [
    { path: '', component: AdminDashboardComponent },
    { path: 'users', component: AdminUsersComponent },
    { path: 'courses', component: AdminCoursesComponent }
  ]
}
```

---

## RoleCheckerService

Для проверки ролей в компонентах используйте `RoleCheckerService` вместо прямого обращения к `AuthStateService`:

```typescript
import { RoleCheckerService } from '@shared/services/role-checker.service';

export class MyComponent {
  private readonly roleChecker = inject(RoleCheckerService);

  readonly isStudent = this.roleChecker.isStudent;
  readonly isTeacher = this.roleChecker.isTeacher;
  readonly isAdmin = this.roleChecker.isAdmin;
  readonly canManageCourses = this.roleChecker.canManageCourses;
}
```

**Преимущества:**

- ✅ Централизованная логика проверки ролей
- ✅ Избегание дублирования кода
- ✅ Легкость тестирования
- ✅ Единообразие в проекте

---

## Текущая защита маршрутов

### Публичные маршруты (без guards)

- `/` - Главная страница
- `/login` - Страница входа
- `/register` - Страница регистрации

### Защищенные маршруты (требуют авторизации)

- `/courses` - Список курсов (все авторизованные)
- `/courses/:courseId` - Детали курса (все авторизованные)

### Маршруты для преподавателей

- `/courses/create` - Создание курса (TEACHER, ADMIN)
- `/assessments/:assessmentId/grade` - Оценивание (TEACHER, ADMIN)

### Административные маршруты

- `/admin` - Панель администратора (только ADMIN)
- `/admin/users` - Управление пользователями (только ADMIN)
- `/admin/users/:userId` - Детали пользователя (только ADMIN)
- `/admin/courses` - Управление курсами (только ADMIN)

---

## Тестирование Guards

Каждый guard имеет соответствующий spec-файл с тестами:

```bash
npm test -- --include='**/*.guard.spec.ts'
```

Тесты проверяют:

- ✅ Корректное разрешение доступа для авторизованных пользователей
- ✅ Корректное блокирование доступа для неавторизованных
- ✅ Правильное перенаправление при отказе в доступе
- ✅ Сохранение `returnUrl` для возврата после авторизации
