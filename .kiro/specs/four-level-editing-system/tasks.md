# Implementation Tasks

## Overview

This document outlines the implementation tasks for the four-level hierarchical editing system. Tasks are organized by component and dependency order.

---

## Task 1: Create Edit State Management Service

**Priority:** High  
**Dependencies:** None  
**Estimated Effort:** 2-3 hours

### Description

Create a centralized service to manage edit states across all hierarchy levels using Angular signals.

### Acceptance Criteria

- [ ] Create `edit-state.service.ts` in `src/app/pages/courses/course-details/course-lessons-section/services/`
- [ ] Implement signal for course-level edit state (boolean)
- [ ] Implement signal for currently editing lesson ID (string | null)
- [ ] Implement signal for currently editing lecture ID (string | null)
- [ ] Implement signal for currently editing assessment ID (string | null)
- [ ] Implement `enterCourseEditMode()` method that clears all lower-level edit states
- [ ] Implement `enterLessonEditMode(lessonId: string)` method that clears other lesson edit states
- [ ] Implement `enterLectureEditMode(lectureId: string)` method that clears other lecture edit states
- [ ] Implement `enterAssessmentEditMode(assessmentId: string)` method that clears other assessment edit states
- [ ] Implement `exitAllEditModes()` method
- [ ] Implement computed signals for checking if specific items are in edit mode
- [ ] Add service to providers in `CourseLessonsSectionComponent`

### Files to Create/Modify

- **Create:** `src/app/pages/courses/course-details/course-lessons-section/services/edit-state.service.ts`
- **Modify:** `src/app/pages/courses/course-details/course-lessons-section/course-lessons-section.ts` (add to providers)

### Implementation Notes

```typescript
// Service structure
export class EditStateService {
  // Signals
  readonly courseEditMode = signal(false);
  readonly editingLessonId = signal<string | null>(null);
  readonly editingLectureId = signal<string | null>(null);
  readonly editingAssessmentId = signal<string | null>(null);

  // Computed helpers
  readonly isLessonEditing = (lessonId: string) =>
    computed(() => this.editingLessonId() === lessonId);
  readonly isLectureEditing = (lectureId: string) =>
    computed(() => this.editingLectureId() === lectureId);
  readonly isAssessmentEditing = (assessmentId: string) =>
    computed(() => this.editingAssessmentId() === assessmentId);

  // Methods
  enterCourseEditMode(): void;
  enterLessonEditMode(lessonId: string): void;
  enterLectureEditMode(lectureId: string): void;
  enterAssessmentEditMode(assessmentId: string): void;
  exitAllEditModes(): void;
}
```

---

## Task 2: Integrate Edit State Service with Course Details Page

**Priority:** High  
**Dependencies:** Task 1  
**Estimated Effort:** 1-2 hours

### Description

Replace the existing `showCourseForm` signal with the new `EditStateService` in the course details page.

### Acceptance Criteria

- [ ] Inject `EditStateService` in `CourseDetailsPage`
- [ ] Replace `showCourseForm()` with `editStateService.courseEditMode()`
- [ ] Update `openEditCourse()` to call `editStateService.enterCourseEditMode()`
- [ ] Update `cancelCourseForm()` to call `editStateService.exitAllEditModes()`
- [ ] Update `submitCourse()` to call `editStateService.exitAllEditModes()` on success
- [ ] Update template to use `editStateService.courseEditMode()` instead of `showCourseForm()`
- [ ] Ensure "Add Lesson" button only shows when `editStateService.courseEditMode()` is true

### Files to Modify

- `src/app/pages/courses/course-details/course-details.ts`
- `src/app/pages/courses/course-details/course-details.html`

### Implementation Notes

- The service should be provided at the `CourseDetailsPage` level so it's shared across all child components
- Remove the `showCourseForm` signal completely

---

## Task 3: Add Lesson-Level Edit Controls

**Priority:** High  
**Dependencies:** Task 1, Task 2  
**Estimated Effort:** 3-4 hours

### Description

Add "Edit" buttons to each lesson and implement lesson-level editing mode.

### Acceptance Criteria

- [ ] Add "Edit" button next to each lesson title (visible only to teachers/admins)
- [ ] Button should only show when NOT in course-level edit mode
- [ ] Clicking "Edit" calls `editStateService.enterLessonEditMode(lesson.id)`
- [ ] When lesson is in edit mode, display inline edit form below lesson title
- [ ] Form should show title and description fields pre-filled with current values
- [ ] Display "Save", "Cancel", and "Delete Lesson" buttons below the form
- [ ] "Save" button updates the lesson and exits edit mode
- [ ] "Cancel" button exits edit mode without saving
- [ ] "Delete Lesson" button shows confirmation and deletes the lesson
- [ ] Only one lesson can be in edit mode at a time
- [ ] Lesson content (lectures) should remain visible while editing
- [ ] Use existing `LessonFormService` for form management

### Files to Modify

- `src/app/pages/courses/course-details/course-lessons-section/course-lessons-section.html`
- `src/app/pages/courses/course-details/course-lessons-section/course-lessons-section.ts`
- `src/app/pages/courses/course-details/course-lessons-section/services/lesson-form.service.ts`

### Implementation Notes

```html
<!-- Example structure -->
<div class="lesson-header">
  <h3>{{ lesson.title }}</h3>
  @if (canEditCourse() && !editStateService.courseEditMode() && !editStateService.editingLessonId())
  {
  <button (click)="editLesson(lesson)">Редактировать</button>
  }
</div>

@if (editStateService.editingLessonId() === lesson.id) {
<div class="lesson-edit-form">
  <app-lesson-form
    [lesson]="lesson"
    (onSave)="saveLessonEdit($event)"
    (onCancel)="cancelLessonEdit()"
    (onDelete)="deleteLesson(lesson)"
  />
</div>
}
```

---

## Task 4: Add Lecture-Level Edit Controls

**Priority:** High  
**Dependencies:** Task 1, Task 3  
**Estimated Effort:** 3-4 hours

### Description

Add "Edit" buttons to each lecture and implement lecture-level editing mode.

### Acceptance Criteria

- [ ] Add "Edit" button next to each lecture title (visible only to teachers/admins)
- [ ] Button should show regardless of course or lesson edit mode
- [ ] Clicking "Edit" calls `editStateService.enterLectureEditMode(lecture.id)`
- [ ] When lecture is in edit mode, display inline edit form below lecture title
- [ ] Form should show title, videoUrl, and content fields pre-filled with current values
- [ ] Display "Save", "Cancel", and "Delete Lecture" buttons below the form
- [ ] "Save" button updates the lecture and exits edit mode
- [ ] "Cancel" button exits edit mode without saving
- [ ] "Delete Lecture" button shows confirmation and deletes the lecture
- [ ] Only one lecture can be in edit mode at a time
- [ ] Lecture content should remain visible while editing
- [ ] Use existing `LectureFormService` for form management

### Files to Modify

- `src/app/pages/courses/course-details/course-lessons-section/course-lessons-section.html`
- `src/app/pages/courses/course-details/course-lessons-section/course-lessons-section.ts`
- `src/app/pages/courses/course-details/course-lessons-section/services/lecture-form.service.ts`

### Implementation Notes

```html
<!-- Example structure -->
<div class="lecture-header">
  <h4>{{ lecture.title }}</h4>
  @if (canEditCourse() && !editStateService.editingLectureId()) {
  <button (click)="editLecture(lecture)">Редактировать</button>
  }
</div>

@if (editStateService.editingLectureId() === lecture.id) {
<div class="lecture-edit-form">
  <app-lecture-form
    [lecture]="lecture"
    (onSave)="saveLectureEdit($event)"
    (onCancel)="cancelLectureEdit()"
    (onDelete)="deleteLecture(lecture)"
  />
</div>
}
```

---

## Task 5: Add Assessment-Level Edit Controls

**Priority:** High  
**Dependencies:** Task 1, Task 4  
**Estimated Effort:** 3-4 hours

### Description

Add "Edit" buttons to each assessment and implement assessment-level editing mode.

### Acceptance Criteria

- [ ] Add "Edit" button next to each assessment title (visible only to teachers/admins)
- [ ] Button should show regardless of course, lesson, or lecture edit mode
- [ ] Clicking "Edit" calls `editStateService.enterAssessmentEditMode(assessment.id)`
- [ ] When assessment is in edit mode, display inline edit form below assessment title
- [ ] Form should show title, description, questions, answerKey, and rubricCriteria fields
- [ ] Display "Save", "Cancel", and "Delete Assessment" buttons below the form
- [ ] "Save" button updates the assessment and exits edit mode
- [ ] "Cancel" button exits edit mode without saving
- [ ] "Delete Assessment" button shows confirmation and deletes the assessment
- [ ] Only one assessment can be in edit mode at a time
- [ ] Assessment content should remain visible while editing
- [ ] Use existing `AssessmentFormService` for form management

### Files to Modify

- `src/app/pages/courses/course-details/course-lessons-section/course-lessons-section.html`
- `src/app/pages/courses/course-details/course-lessons-section/course-lessons-section.ts`
- `src/app/pages/courses/course-details/course-lessons-section/services/assessment-form.service.ts`

### Implementation Notes

```html
<!-- Example structure -->
<div class="assessment-header">
  <h5>{{ assessment.title }}</h5>
  @if (canEditCourse() && !editStateService.editingAssessmentId()) {
  <button (click)="editAssessment(assessment)">Редактировать</button>
  }
</div>

@if (editStateService.editingAssessmentId() === assessment.id) {
<div class="assessment-edit-form">
  <app-assessment-form
    [assessment]="assessment"
    (onSave)="saveAssessmentEdit($event)"
    (onCancel)="cancelAssessmentEdit()"
    (onDelete)="deleteAssessment(assessment)"
  />
</div>
}
```

---

## Task 6: Update Delete Button Visibility Logic

**Priority:** Medium  
**Dependencies:** Task 2, Task 3, Task 4, Task 5  
**Estimated Effort:** 2 hours

### Description

Update all delete button visibility conditions to match the new hierarchical edit mode system.

### Acceptance Criteria

- [ ] Lesson delete buttons show ONLY when:
  - Course is in course-level edit mode, OR
  - That specific lesson is in lesson-level edit mode
- [ ] Lecture delete buttons show ONLY when that specific lecture is in lecture-level edit mode
- [ ] Assessment delete buttons show ONLY when that specific assessment is in assessment-level edit mode
- [ ] No delete buttons show for students
- [ ] Delete buttons maintain minimalist styling (no borders, shadows, or backgrounds)

### Files to Modify

- `src/app/pages/courses/course-details/course-lessons-section/course-lessons-section.html`

### Implementation Notes

```html
<!-- Lesson delete button -->
@if (canEditCourse() && (editStateService.courseEditMode() || editStateService.editingLessonId() ===
lesson.id)) {
<button (click)="deleteLesson(lesson)">Удалить урок</button>
}

<!-- Lecture delete button -->
@if (canEditCourse() && editStateService.editingLectureId() === lecture.id) {
<button (click)="deleteLecture(lecture)">Удалить лекцию</button>
}

<!-- Assessment delete button -->
@if (canEditCourse() && editStateService.editingAssessmentId() === assessment.id) {
<button (click)="deleteAssessment(assessment)">Удалить assessment</button>
}
```

---

## Task 7: Update Form Services for Inline Editing

**Priority:** Medium  
**Dependencies:** Task 3, Task 4, Task 5  
**Estimated Effort:** 2-3 hours

### Description

Modify the form services to support inline editing mode (edit existing items) in addition to the current "add new" mode.

### Acceptance Criteria

- [ ] `LessonFormService` supports `openEditInline(lesson: Lesson)` method
- [ ] `LectureFormService` supports `openEditInline(lecture: Lecture)` method
- [ ] `AssessmentFormService` supports `openEditInline(assessment: Assessment)` method
- [ ] Each service distinguishes between "add mode" and "edit inline mode"
- [ ] Edit inline mode pre-fills form with existing data
- [ ] Edit inline mode updates the item instead of creating new
- [ ] Services integrate with `EditStateService` to manage edit state

### Files to Modify

- `src/app/pages/courses/course-details/course-lessons-section/services/lesson-form.service.ts`
- `src/app/pages/courses/course-details/course-lessons-section/services/lecture-form.service.ts`
- `src/app/pages/courses/course-details/course-lessons-section/services/assessment-form.service.ts`

### Implementation Notes

- The existing `openEdit()` method in `LessonFormService` can be used as a reference
- Need to ensure the form appears inline below the item, not as a separate section

---

## Task 8: Update Form Components for Inline Display

**Priority:** Medium  
**Dependencies:** Task 7  
**Estimated Effort:** 2 hours

### Description

Update form components to support inline display mode with appropriate styling.

### Acceptance Criteria

- [ ] `LessonFormComponent` accepts `inline` input parameter
- [ ] `LectureFormComponent` accepts `inline` input parameter
- [ ] `AssessmentFormComponent` accepts `inline` input parameter
- [ ] When `inline` is true, forms display with minimal styling (no borders, shadows, backgrounds)
- [ ] Inline forms show "Save", "Cancel", and "Delete" buttons in a row
- [ ] Forms maintain existing functionality for "add new" mode

### Files to Modify

- `src/app/pages/courses/course-details/course-lessons-section/components/lesson-form/lesson-form.component.ts`
- `src/app/pages/courses/course-details/course-lessons-section/components/lesson-form/lesson-form.component.html`
- `src/app/pages/courses/course-details/course-lessons-section/components/lecture-form/lecture-form.component.ts`
- `src/app/pages/courses/course-details/course-lessons-section/components/lecture-form/lecture-form.component.html`
- `src/app/pages/courses/course-details/course-lessons-section/components/assessment-form/assessment-form.component.ts`
- `src/app/pages/courses/course-details/course-lessons-section/components/assessment-form/assessment-form.component.html`

---

## Task 9: Implement Edit Mode Cleanup on Navigation

**Priority:** Low  
**Dependencies:** Task 1  
**Estimated Effort:** 1 hour

### Description

Ensure edit modes are properly cleared when users navigate away or collapse items.

### Acceptance Criteria

- [ ] When a lesson is collapsed, exit lesson-level edit mode for that lesson
- [ ] When a lecture is collapsed, exit lecture-level edit mode for that lecture
- [ ] When navigating away from course details page, call `exitAllEditModes()`
- [ ] On component destroy, call `exitAllEditModes()`

### Files to Modify

- `src/app/pages/courses/course-details/course-details.ts`
- `src/app/pages/courses/course-details/course-lessons-section/course-lessons-section.ts`
- `src/app/pages/courses/course-details/course-lessons-section/services/lesson-ui-state.service.ts`

### Implementation Notes

```typescript
// In CourseDetailsPage
ngOnDestroy(): void {
  this.editStateService.exitAllEditModes();
}

// In lesson collapse handler
toggleLesson(lessonId: string): void {
  if (this.editStateService.editingLessonId() === lessonId) {
    this.editStateService.exitAllEditModes();
  }
  this.uiStateService.toggle(lessonId);
}
```

---

## Task 10: Add Unit Tests for Edit State Service

**Priority:** Low  
**Dependencies:** Task 1  
**Estimated Effort:** 2-3 hours

### Description

Create comprehensive unit tests for the `EditStateService`.

### Acceptance Criteria

- [ ] Test `enterCourseEditMode()` clears all lower-level edit states
- [ ] Test `enterLessonEditMode()` clears other lesson edit states
- [ ] Test `enterLectureEditMode()` clears other lecture edit states
- [ ] Test `enterAssessmentEditMode()` clears other assessment edit states
- [ ] Test `exitAllEditModes()` clears all edit states
- [ ] Test computed signals return correct values
- [ ] Test that entering lesson edit mode does NOT clear course edit mode

### Files to Create

- `src/app/pages/courses/course-details/course-lessons-section/services/edit-state.service.spec.ts`

---

## Task 11: Integration Testing

**Priority:** Low  
**Dependencies:** All previous tasks  
**Estimated Effort:** 2-3 hours

### Description

Perform end-to-end testing of the four-level editing system.

### Acceptance Criteria

- [ ] Test course-level editing workflow
- [ ] Test lesson-level editing workflow
- [ ] Test lecture-level editing workflow
- [ ] Test assessment-level editing workflow
- [ ] Test edit mode exclusivity (only one item per level)
- [ ] Test delete button visibility at each level
- [ ] Test form display behavior (inline, below content)
- [ ] Test student view (no edit controls visible)
- [ ] Test navigation cleanup (edit modes reset)
- [ ] Verify minimalist UI styling maintained
- [ ] Run `npm run build` to ensure no compilation errors

### Files to Test

- All modified components and services

---

## Task 12: Documentation and Code Review

**Priority:** Low  
**Dependencies:** Task 11  
**Estimated Effort:** 1-2 hours

### Description

Document the new editing system and prepare for code review.

### Acceptance Criteria

- [ ] Update component documentation with new editing behavior
- [ ] Add JSDoc comments to `EditStateService` methods
- [ ] Create user guide for the four-level editing system
- [ ] Update README if necessary
- [ ] Perform self code review
- [ ] Ensure all acceptance criteria from requirements document are met

### Files to Create/Modify

- `docs/four-level-editing-guide.md` (create)
- Various component files (add JSDoc comments)

---

## Implementation Order

1. **Phase 1: Foundation** (Tasks 1-2)
   - Create and integrate Edit State Service
   - Estimated: 3-5 hours

2. **Phase 2: Lesson & Lecture Editing** (Tasks 3-4, 7-8)
   - Implement lesson-level and lecture-level editing
   - Update form services and components
   - Estimated: 10-14 hours

3. **Phase 3: Assessment Editing** (Task 5)
   - Implement assessment-level editing
   - Estimated: 3-4 hours

4. **Phase 4: Polish** (Tasks 6, 9)
   - Update delete button logic
   - Implement navigation cleanup
   - Estimated: 3 hours

5. **Phase 5: Testing & Documentation** (Tasks 10-12)
   - Write tests and documentation
   - Estimated: 5-8 hours

**Total Estimated Effort:** 24-34 hours

---

## Risk Assessment

### High Risk

- **Form service refactoring** - Existing form services may need significant changes to support inline editing
- **State synchronization** - Ensuring edit state stays synchronized across all components

### Medium Risk

- **UI/UX complexity** - Managing multiple edit modes simultaneously may confuse users
- **Performance** - Multiple signals and computed values may impact performance with many items

### Low Risk

- **Backward compatibility** - Existing course-level edit mode should continue working
- **Student view** - Student view is already isolated from edit controls

---

## Success Metrics

- [ ] All 12 requirements from requirements document are implemented
- [ ] All 61 acceptance criteria are met
- [ ] Build passes without errors: `npm run build`
- [ ] No regression in existing functionality
- [ ] Code review approved
- [ ] User acceptance testing passed
