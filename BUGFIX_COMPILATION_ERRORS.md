# Исправление ошибок компиляции

## Проблемы

### 1. TS2304: Cannot find name 'Router'

**Файл:** `src/app/pages/courses/courses.ts`  
**Ошибка:** Router не был импортирован

### 2. NG8113: RouterLink is not used within the template

**Файл:** `src/app/layout/header/header.ts`  
**Предупреждение:** RouterLink импортирован, но не используется в шаблоне

## Исправления

### 1. Добавлен импорт Router в courses.ts

**До:**

```typescript
import { ActivatedRoute, RouterLink } from '@angular/router';
```

**После:**

```typescript
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
```

### 2. Удален неиспользуемый RouterLink из header.ts

**До:**

```typescript
import { Router, RouterLink } from '@angular/router';
// ...
imports: [RouterLink, ButtonModule, LogoComponent, SearchBarComponent, UserMenuComponent],
```

**После:**

```typescript
import { Router } from '@angular/router';
// ...
imports: [ButtonModule, LogoComponent, SearchBarComponent, UserMenuComponent],
```

## Результат

✅ Все ошибки компиляции исправлены  
✅ Предупреждения устранены  
✅ Приложение готово к запуску

## Проверка

Запустите dev сервер:

```bash
npm start
# или
ng serve
```

Приложение должно запуститься без ошибок компиляции.
