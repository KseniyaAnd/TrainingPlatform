# Исправление ошибки в admin-user-details

## Проблема

При нажатии на кнопку "Детали" в списке пользователей возникала ошибка:

```
ERROR TypeError: Cannot read properties of undefined (reading 'length')
```

## Причина

API может возвращать `undefined` для полей `enrollments`, `courses` и `submissions` в объекте `UserDetails`, если у пользователя нет данных в этих категориях.

## Решение

### 1. Обновлена модель UserDetails

Сделаны опциональными поля массивов:

```typescript
export interface UserDetails {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  enrollments?: Array<{...}>;  // было: enrollments: Array<{...}>
  courses?: Array<{...}>;       // было: courses: Array<{...}>
  submissions?: Array<{...}>;   // было: submissions: Array<{...}>
}
```

### 2. Обновлен HTML шаблон

Добавлены проверки на undefined перед использованием `.length`:

**Было:**

```html
<h2>Записи на курсы ({{ userDetails()!.enrollments.length }})</h2>
@if (userDetails()!.enrollments.length > 0) {
<p-table [value]="userDetails()!.enrollments"></p-table>
```

**Стало:**

```html
<h2>Записи на курсы ({{ userDetails()!.enrollments?.length ?? 0 }})</h2>
@if (userDetails()!.enrollments && userDetails()!.enrollments!.length > 0) {
<p-table [value]="userDetails()!.enrollments!"></p-table>
```

Аналогичные изменения применены для `courses` и `submissions`.

## Результат

✅ Страница деталей пользователя теперь корректно отображается даже если:

- У пользователя нет записей на курсы
- У пользователя нет созданных курсов
- У пользователя нет submissions

✅ Проект успешно компилируется без ошибок TypeScript
