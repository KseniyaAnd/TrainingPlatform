# 📋 Рекомендации по рефакторингу проекта

**Дата анализа:** 5 мая 2026  
**Анализатор:** Kiro AI

---

## 🎯 Краткое резюме

Проект в целом **хорошо структурирован** с использованием современных Angular паттернов (signals, standalone components). Однако есть несколько областей для улучшения:

### ✅ Что хорошо:

- ✓ Использование современных **Angular signals** вместо BehaviorSubject
- ✓ Нет компонентов с 10+ инпутами
- ✓ Хорошая организация сервисов с facade-паттерном
- ✓ Использование Tailwind CSS как основного подхода

### ⚠️ Что требует внимания:

- ⚠️ **CourseLessonsSectionComponent** (380 строк) - слишком большой
- ⚠️ Дублирование логики в form-сервисах
- ⚠️ Бизнес-логика в компонентах вместо сервисов
- ⚠️ Дублирование CSS цветов и использование `::ng-deep`
- ⚠️ Смешанный подход: Tailwind + custom CSS

---

## 🔍 Детальный анализ

### 1. 📦 Размеры компонентов и разбиение

#### 🔴 Критично: CourseLessonsSectionComponent (380 строк)

**Проблема:**
Компонент управляет слишком многими сущностями:

- Уроки (lessons)
- Лекции (lectures)
- Секции лекций (lecture sections)
- Оценки (assessments)
- Отправки работ (submissions)
- Прогресс студента

**Рекомендация:**
Разбить на 3 отдельных компонента:

```
course-lessons-section/
├── course-lessons-section.ts (координатор, 100-150 строк)
├── components/
│   ├── lesson-management/
│   │   ├── lesson-management.ts (управление уроками)
│   │   └── lesson-management.html
│   ├── lecture-management/
│   │   ├── lecture-management.ts (управление лекциями)
│   │   └── lecture-management.html
│   └── assessment-management/
│       ├── assessment-management.ts (управление оценками)
│       └── assessment-management.html
```

**Пример рефакторинга:**

```typescript
// course-lessons-section.ts (координатор)
@Component({
  selector: 'app-course-lessons-section',
  template: `
    <app-lesson-management
      [lessons]="lessonsOnly()"
      [courseId]="courseId()"
      (lessonsChange)="handleLessonsChange($event)"
    />

    <app-lecture-management
      [lectures]="lectureSectionsOnly()"
      [courseId]="courseId()"
      (lecturesChange)="handleLecturesChange($event)"
    />

    <app-assessment-management
      [assessments]="assessments()"
      [submissions]="submissions()"
      (assessmentsChange)="handleAssessmentsChange($event)"
    />
  `,
})
export class CourseLessonsSectionComponent {
  // Только координация между подкомпонентами
}
```

#### 🟡 Средний приоритет: CourseDetailsPage (280 строк)

**Проблема:**
Слишком много ответственности:

- Загрузка данных
- Управление подпиской на курс
- CRUD операции курса
- Переключение табов

**Рекомендация:**
Вынести бизнес-логику в сервис:

```typescript
// services/course-details-orchestration.service.ts
@Injectable()
export class CourseDetailsOrchestrationService {
  private readonly dataService = inject(CourseDetailsDataService);
  private readonly authState = inject(AuthStateService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly course = signal<Course | undefined>(undefined);

  async loadCourseData(courseId: string): Promise<void> {
    // Вся логика загрузки
  }

  async toggleSubscription(courseId: string, isSubscribed: boolean): Promise<void> {
    // Логика подписки/отписки
  }

  async updateCourse(courseId: string, data: Partial<Course>): Promise<void> {
    // Логика обновления
  }
}

// course-details.ts (компонент)
export class CourseDetailsPage {
  private readonly orchestration = inject(CourseDetailsOrchestrationService);

  readonly loading = this.orchestration.loading;
  readonly course = this.orchestration.course;

  async ngOnInit() {
    await this.orchestration.loadCourseData(this.courseId);
  }
}
```

#### 🟡 Средний приоритет: CourseAnalyticsComponent (280 строк)

**Проблема:**
Генерация DOCX документов (150+ строк) внутри компонента.

**Рекомендация:**
Вынести в отдельный сервис:

```typescript
// services/study-plan-document.service.ts
@Injectable({ providedIn: 'root' })
export class StudyPlanDocumentService {
  async generateAndDownload(studentId: string, plan: AiStudyPlanResponse): Promise<void> {
    const doc = this.generateDocument(studentId, plan);
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Учебный_план_${studentId}_${new Date().toISOString().split('T')[0]}.docx`);
  }

  private generateDocument(studentId: string, plan: AiStudyPlanResponse): Document {
    // Вся логика генерации документа
  }
}

// course-analytics.ts
export class CourseAnalyticsComponent {
  private readonly docService = inject(StudyPlanDocumentService);

  async downloadStudyPlan(studentId: string, plan: AiStudyPlanResponse) {
    await this.docService.generateAndDownload(studentId, plan);
  }
}
```

---

### 2. 🔄 Повторение кода

#### 🔴 Критично: Дублирование Form Services

**Проблема:**
5 почти идентичных сервисов:

- `LessonFormService`
- `LectureFormService`
- `AssessmentFormService`
- `LectureSectionFormService`
- `SubmissionFormService`

Все следуют одному паттерну:

```typescript
@Injectable()
export class XxxFormService {
  private readonly dataService = inject(CourseDetailsDataService);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({ ... });
  readonly isOpen = signal(false);
  readonly isEdit = signal(false);

  open() { this.isOpen.set(true); }
  close() { this.isOpen.set(false); }
  async submit() { ... }
}
```

**Рекомендация:**
Создать generic базовый класс:

```typescript
// services/base-form.service.ts
export abstract class BaseFormService<T, TForm> {
  protected readonly fb = inject(FormBuilder);

  readonly isOpen = signal(false);
  readonly isEdit = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  abstract readonly form: FormGroup<TForm>;

  open(): void {
    this.isOpen.set(true);
    this.isEdit.set(false);
    this.editingId.set(null);
  }

  openEdit(id: string, data: T): void {
    this.isOpen.set(true);
    this.isEdit.set(true);
    this.editingId.set(id);
    this.patchForm(data);
  }

  close(): void {
    this.isOpen.set(false);
    this.form.reset();
    this.error.set(null);
  }

  abstract patchForm(data: T): void;
  abstract submit(): Promise<void>;
}

// Использование:
@Injectable()
export class LessonFormService extends BaseFormService<Lesson, LessonFormType> {
  private readonly dataService = inject(CourseDetailsDataService);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: [''],
  });

  patchForm(lesson: Lesson): void {
    this.form.patchValue({
      title: lesson.title,
      description: lesson.description,
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;

    this.submitting.set(true);
    try {
      const data = this.form.getRawValue();
      if (this.isEdit()) {
        await this.dataService.updateLesson(this.editingId()!, data);
      } else {
        await this.dataService.createLesson(data);
      }
      this.close();
    } catch (err) {
      this.error.set('Ошибка сохранения');
    } finally {
      this.submitting.set(false);
    }
  }
}
```

**Экономия:** ~200 строк дублированного кода

---

### 3. 🧩 Логика в сервисах

#### 🔴 Критично: Бизнес-логика в компонентах

**Найденные проблемы:**

1. **CourseDetailsPage** - логика подписки/отписки:

```typescript
// ❌ Плохо: в компоненте
async toggleSubscribe(): Promise<void> {
  if (this.subscribed()) {
    await this.unsubscribe();
  } else {
    this.submitting.set(true);
    try {
      const result = await firstValueFrom(
        this.dataService.enrollInCourse(this.courseId)
      );
      this.enrollmentId.set(result.enrollmentId);
      this.subscribed.set(true);
    } catch (err) {
      this.submitError.set('Не удалось подписаться');
    } finally {
      this.submitting.set(false);
    }
  }
}
```

```typescript
// ✅ Хорошо: в сервисе
@Injectable()
export class CourseEnrollmentService {
  private readonly dataService = inject(CourseDetailsDataService);

  readonly enrollmentState = signal<{
    isEnrolled: boolean;
    enrollmentId: string | null;
    loading: boolean;
    error: string | null;
  }>({
    isEnrolled: false,
    enrollmentId: null,
    loading: false,
    error: null,
  });

  async toggleEnrollment(courseId: string): Promise<void> {
    const state = this.enrollmentState();

    this.enrollmentState.update((s) => ({ ...s, loading: true, error: null }));

    try {
      if (state.isEnrolled) {
        await firstValueFrom(this.dataService.unenrollFromCourse(courseId));
        this.enrollmentState.update((s) => ({
          ...s,
          isEnrolled: false,
          enrollmentId: null,
          loading: false,
        }));
      } else {
        const result = await firstValueFrom(this.dataService.enrollInCourse(courseId));
        this.enrollmentState.update((s) => ({
          ...s,
          isEnrolled: true,
          enrollmentId: result.enrollmentId,
          loading: false,
        }));
      }
    } catch (err) {
      this.enrollmentState.update((s) => ({
        ...s,
        loading: false,
        error: 'Ошибка изменения подписки',
      }));
    }
  }
}
```

2. **AssessmentGradingComponent** - логика оценивания:

```typescript
// ❌ Плохо: в компоненте
readonly editingScores = signal<Map<string, number>>(new Map());

startEditScore(submissionId: string, currentScore: number): void {
  this.editingScores.update(map => {
    const newMap = new Map(map);
    newMap.set(submissionId, currentScore);
    return newMap;
  });
}

async saveScore(submission: SubmissionResponse): Promise<void> {
  const newScore = this.editingScores().get(submission.id);
  // ... логика сохранения
}
```

```typescript
// ✅ Хорошо: в сервисе
@Injectable()
export class GradingService {
  private readonly submissionsService = inject(SubmissionsService);

  readonly editingScores = signal<Map<string, number>>(new Map());
  readonly savingScores = signal<Set<string>>(new Set());

  startEdit(submissionId: string, currentScore: number): void {
    this.editingScores.update((map) => {
      const newMap = new Map(map);
      newMap.set(submissionId, currentScore);
      return newMap;
    });
  }

  cancelEdit(submissionId: string): void {
    this.editingScores.update((map) => {
      const newMap = new Map(map);
      newMap.delete(submissionId);
      return newMap;
    });
  }

  async saveScore(submission: SubmissionResponse): Promise<void> {
    const newScore = this.editingScores().get(submission.id);
    if (newScore === undefined) return;

    this.savingScores.update((set) => new Set(set).add(submission.id));

    try {
      await firstValueFrom(this.submissionsService.gradeSubmission(submission.id, newScore));
      this.cancelEdit(submission.id);
    } finally {
      this.savingScores.update((set) => {
        const newSet = new Set(set);
        newSet.delete(submission.id);
        return newSet;
      });
    }
  }
}
```

---

### 4. 🎨 Tailwind CSS vs Custom CSS

#### 🔴 Критично: Дублирование цветов

**Проблема:**
Цвет `#34d399` (emerald-400) захардкожен в 3 файлах:

- `course-card.css` (7 раз)
- `course-slider.css` (2 раза)
- `course-filters.css` (4 раза)

**Рекомендация:**
Использовать Tailwind CSS переменные:

```css
/* ❌ Плохо: захардкоженные цвета */
.filter-chip {
  border: 1px solid #34d399;
  color: #34d399;
}

.filter-chip.active {
  background-color: #34d399;
  border-color: #34d399;
}
```

```html
<!-- ✅ Хорошо: Tailwind классы -->
<button
  class="px-4 py-2 rounded-full border transition-colors"
  [class.border-emerald-400]="!isActive"
  [class.text-emerald-400]="!isActive"
  [class.bg-emerald-400]="isActive"
  [class.text-white]="isActive"
>
  {{ label }}
</button>
```

Если нужны кастомные цвета, добавить в `tailwind.config.js`:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-mint': '#34d399',
        'brand-mint-light': '#d1fae5',
        'brand-mint-dark': '#059669',
      },
    },
  },
};
```

#### 🔴 Критично: Использование `::ng-deep`

**Проблема:**
`::ng-deep` deprecated и нарушает инкапсуляцию:

```css
/* ❌ Плохо: ::ng-deep */
:host ::ng-deep .glider-track {
  gap: 1.5rem !important;
}

.course-tags ::ng-deep .p-tag {
  background-color: #34d399 !important;
  color: #ffffff !important;
}
```

**Рекомендация:**
Использовать ViewEncapsulation.None или глобальные стили:

```typescript
// ✅ Вариант 1: ViewEncapsulation.None для компонента
@Component({
  selector: 'app-course-slider',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./course-slider.css'],
})
export class CourseSliderComponent {}
```

```css
/* course-slider.css */
.app-course-slider .glider-track {
  gap: 1.5rem;
}
```

```css
/* ✅ Вариант 2: Глобальные стили в styles.css */
/* styles.css */
.glider-track {
  gap: 1.5rem;
}

.p-tag {
  @apply bg-emerald-400 text-white border-0;
}
```

#### 🟡 Средний приоритет: Кастомный CSS вместо Tailwind

**Проблема:**
Много кастомного CSS, который можно заменить Tailwind:

```css
/* ❌ Плохо: course-card.css */
.course-card {
  display: flex;
  flex-direction: column;
  height: 120px;
  width: 100%;
  overflow: hidden;
}

.course-card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.course-title {
  overflow: hidden;
  text-overflow: ellipsis;
}
```

```html
<!-- ✅ Хорошо: Tailwind классы -->
<div class="flex flex-col h-[120px] w-full overflow-hidden">
  <div class="flex justify-between items-start gap-2 mb-1">
    <h2 class="overflow-hidden text-ellipsis">{{ title }}</h2>
  </div>
</div>
```

**Когда оставить custom CSS:**

- Сложные анимации
- Специфичные стили для сторонних библиотек (Glider.js, PrimeNG)
- Стили, которые нельзя выразить через Tailwind

---

### 5. 🔄 Signals vs BehaviorSubject

#### ✅ Отлично: Нет BehaviorSubject

**Результат поиска:** 0 использований `BehaviorSubject`

Проект полностью использует современные Angular signals:

```typescript
// ✅ Хорошо: signals
export class AuthStateService {
  private readonly state = signal<AuthState>(this.readInitialState());

  readonly isAuthenticated = signal<boolean>(this.state().isAuthenticated);
  readonly username = signal<string | null>(this.state().username);
  readonly role = signal<string | null>(this.state().role);
}
```

```typescript
// ✅ Хорошо: RxJS interop
export class SearchBarComponent {
  readonly search = signal('');

  readonly suggestions = toSignal(
    toObservable(this.search).pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap((q) => this.coursesService.getCourses({ q })),
    ),
    { initialValue: [] },
  );
}
```

**Рекомендация:** Продолжать использовать signals для всего нового кода.

---

## 📊 Приоритизация рефакторинга

### 🔴 Высокий приоритет (сделать в первую очередь)

1. **Разбить CourseLessonsSectionComponent** (380 строк)
   - Создать 3 подкомпонента
   - Экономия: ~250 строк, улучшение читаемости

2. **Создать BaseFormService**
   - Убрать дублирование 5 form-сервисов
   - Экономия: ~200 строк

3. **Заменить `::ng-deep` на правильные подходы**
   - 2 файла с `::ng-deep`
   - Улучшение: инкапсуляция, maintainability

4. **Вынести цвета в Tailwind config**
   - Убрать 13 захардкоженных `#34d399`
   - Улучшение: единый источник правды

### 🟡 Средний приоритет (сделать потом)

5. **Вынести бизнес-логику из CourseDetailsPage**
   - Создать CourseEnrollmentService
   - Улучшение: тестируемость, переиспользование

6. **Вынести генерацию документов в сервис**
   - Создать StudyPlanDocumentService
   - Экономия: ~150 строк в компоненте

7. **Заменить custom CSS на Tailwind**
   - course-card.css, course-filters.css
   - Улучшение: консистентность

### 🟢 Низкий приоритет (опционально)

8. **Создать GradingService**
   - Вынести логику оценивания из компонента
   - Улучшение: переиспользование

9. **Оптимизировать CourseDetailsDataService**
   - Добавить кеширование
   - Улучшение: производительность

---

## 📝 Чеклист рефакторинга

### Структура компонентов

- [ ] Разбить CourseLessonsSectionComponent на 3 подкомпонента
- [ ] Вынести логику из CourseDetailsPage в сервисы
- [ ] Вынести генерацию документов в StudyPlanDocumentService

### Повторение кода

- [ ] Создать BaseFormService
- [ ] Рефакторить 5 form-сервисов на базе BaseFormService
- [ ] Убрать дублирование логики lesson/lecture management

### Сервисы

- [ ] Создать CourseEnrollmentService
- [ ] Создать GradingService
- [ ] Создать StudyPlanDocumentService

### CSS и стили

- [ ] Добавить brand-цвета в tailwind.config.js
- [ ] Заменить все `#34d399` на Tailwind классы
- [ ] Убрать `::ng-deep` из course-slider.css
- [ ] Убрать `::ng-deep` из course-card.css
- [ ] Заменить custom CSS на Tailwind где возможно
- [ ] Оставить только необходимый custom CSS

### Signals

- [x] Проверить отсутствие BehaviorSubject ✅
- [x] Использовать signals для реактивного состояния ✅

---

## 🎯 Ожидаемые результаты

После рефакторинга:

### Метрики кода

- **-600 строк** дублированного кода
- **-13** захардкоженных цветов
- **-2** использования `::ng-deep`
- **+5** новых переиспользуемых сервисов

### Качество кода

- ✅ Все компоненты < 300 строк
- ✅ Бизнес-логика в сервисах
- ✅ Единый источник правды для стилей
- ✅ Лучшая тестируемость
- ✅ Лучшая переиспользуемость

### Maintainability

- ✅ Проще добавлять новые формы (BaseFormService)
- ✅ Проще менять цвета (Tailwind config)
- ✅ Проще тестировать (логика в сервисах)
- ✅ Проще понимать код (меньшие компоненты)

---

## 🚀 План действий

### Неделя 1: Критичные изменения

1. День 1-2: Создать BaseFormService и рефакторить form-сервисы
2. День 3-4: Разбить CourseLessonsSectionComponent
3. День 5: Настроить Tailwind config и заменить цвета

### Неделя 2: Средний приоритет

1. День 1-2: Вынести бизнес-логику в сервисы
2. День 3-4: Убрать ::ng-deep и custom CSS
3. День 5: Тестирование и документация

### Неделя 3: Полировка

1. Оптимизация производительности
2. Code review
3. Обновление документации

---

## 📚 Дополнительные ресурсы

- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)
- [Angular Component Patterns](https://angular.dev/guide/components)
- [Angular Services](https://angular.dev/guide/di)

---

**Автор:** Kiro AI  
**Дата:** 5 мая 2026
