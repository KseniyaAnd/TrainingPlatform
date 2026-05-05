# Requirements Document

## Introduction

This document specifies the requirements for a four-level hierarchical editing system for the course details page in an Angular learning platform. The system enables teachers to edit courses, lessons, lectures, and assessments independently at different hierarchical levels, replacing the current single global "edit mode" with granular, targeted editing capabilities.

## Glossary

- **Course_Details_Page**: The page displaying a course's complete structure including lessons, lectures, and assessments
- **Edit_Mode**: A state where editing controls (edit buttons, delete buttons, forms) become visible and active
- **Course_Level_Edit_Mode**: Edit mode that enables editing of course metadata, creating/deleting lessons, but not editing lesson content or nested items
- **Lesson_Level_Edit_Mode**: Edit mode for a specific lesson that enables editing that lesson's title/description and deleting that lesson
- **Lecture_Level_Edit_Mode**: Edit mode for a specific lecture that enables editing that lecture's title/content and deleting that lecture
- **Assessment_Level_Edit_Mode**: Edit mode for a specific assessment that enables editing that assessment's title/content and deleting that assessment
- **Edit_State_Service**: A service managing which items are currently in edit mode across all hierarchy levels
- **Teacher**: A user with role TEACHER or ADMIN who can edit course content
- **Student**: A user with role STUDENT who can only view course content

## Requirements

### Requirement 1: Course Level Editing

**User Story:** As a teacher, I want to enable course-level editing mode, so that I can edit course metadata and manage lessons without affecting individual lesson/lecture/assessment editing.

#### Acceptance Criteria

1. WHEN a Teacher clicks the course-level "Edit" button, THE Course_Details_Page SHALL enter Course_Level_Edit_Mode
2. WHILE in Course_Level_Edit_Mode, THE Course_Details_Page SHALL display the course title/description form
3. WHILE in Course_Level_Edit_Mode, THE Course_Details_Page SHALL display "Delete Lesson" buttons for each lesson
4. WHILE in Course_Level_Edit_Mode, THE Course_Details_Page SHALL display an "Add Lesson" button
5. WHILE in Course_Level_Edit_Mode, THE Course_Details_Page SHALL NOT display edit controls for lectures or assessments
6. WHILE in Course_Level_Edit_Mode, THE Course_Details_Page SHALL display "Save", "Cancel", and "Delete Course" buttons
7. WHEN a Teacher clicks "Cancel" or "Save" in Course_Level_Edit_Mode, THE Course_Details_Page SHALL exit Course_Level_Edit_Mode

### Requirement 2: Lesson Level Editing

**User Story:** As a teacher, I want to edit individual lessons independently, so that I can make quick changes to a specific lesson without entering course-level edit mode.

#### Acceptance Criteria

1. THE Course_Details_Page SHALL display an "Edit" button for each lesson
2. WHEN a Teacher clicks a lesson's "Edit" button, THE Course_Details_Page SHALL enter Lesson_Level_Edit_Mode for that specific lesson
3. WHILE in Lesson_Level_Edit_Mode for a lesson, THE Course_Details_Page SHALL display an inline edit form below the lesson title showing title and description fields
4. WHILE in Lesson_Level_Edit_Mode for a lesson, THE Course_Details_Page SHALL display "Save", "Cancel", and "Delete Lesson" buttons for that lesson
5. WHILE in Lesson_Level_Edit_Mode for a lesson, THE Course_Details_Page SHALL NOT display edit controls for other lessons
6. WHILE in Lesson_Level_Edit_Mode for a lesson, THE Course_Details_Page SHALL NOT enable editing of lectures within that lesson
7. WHEN a Teacher clicks "Cancel" or "Save" for a lesson, THE Course_Details_Page SHALL exit Lesson_Level_Edit_Mode for that lesson

### Requirement 3: Lecture Level Editing

**User Story:** As a teacher, I want to edit individual lectures independently, so that I can update lecture content without affecting the lesson or other lectures.

#### Acceptance Criteria

1. THE Course_Details_Page SHALL display an "Edit" button for each lecture
2. WHEN a Teacher clicks a lecture's "Edit" button, THE Course_Details_Page SHALL enter Lecture_Level_Edit_Mode for that specific lecture
3. WHILE in Lecture_Level_Edit_Mode for a lecture, THE Course_Details_Page SHALL display an inline edit form below the lecture title showing title, videoUrl, and content fields
4. WHILE in Lecture_Level_Edit_Mode for a lecture, THE Course_Details_Page SHALL display "Save", "Cancel", and "Delete Lecture" buttons for that lecture
5. WHILE in Lecture_Level_Edit_Mode for a lecture, THE Course_Details_Page SHALL NOT display edit controls for other lectures
6. WHILE in Lecture_Level_Edit_Mode for a lecture, THE Course_Details_Page SHALL NOT enable editing of assessments within that lecture
7. WHEN a Teacher clicks "Cancel" or "Save" for a lecture, THE Course_Details_Page SHALL exit Lecture_Level_Edit_Mode for that lecture

### Requirement 4: Assessment Level Editing

**User Story:** As a teacher, I want to edit individual assessments independently, so that I can update assessment questions and criteria without affecting the lecture or other assessments.

#### Acceptance Criteria

1. THE Course_Details_Page SHALL display an "Edit" button for each assessment
2. WHEN a Teacher clicks an assessment's "Edit" button, THE Course_Details_Page SHALL enter Assessment_Level_Edit_Mode for that specific assessment
3. WHILE in Assessment_Level_Edit_Mode for an assessment, THE Course_Details_Page SHALL display an inline edit form below the assessment title showing title, description, questions, answerKey, and rubricCriteria fields
4. WHILE in Assessment_Level_Edit_Mode for an assessment, THE Course_Details_Page SHALL display "Save", "Cancel", and "Delete Assessment" buttons for that assessment
5. WHILE in Assessment_Level_Edit_Mode for an assessment, THE Course_Details_Page SHALL NOT display edit controls for other assessments
6. WHEN a Teacher clicks "Cancel" or "Save" for an assessment, THE Course_Details_Page SHALL exit Assessment_Level_Edit_Mode for that assessment

### Requirement 5: Edit Mode Exclusivity

**User Story:** As a teacher, I want only one item to be editable at a time within each hierarchy level, so that the interface remains clear and prevents conflicting edits.

#### Acceptance Criteria

1. WHEN a Teacher enters Lesson_Level_Edit_Mode for a lesson, THE Course_Details_Page SHALL exit Lesson_Level_Edit_Mode for any other lesson currently being edited
2. WHEN a Teacher enters Lecture_Level_Edit_Mode for a lecture, THE Course_Details_Page SHALL exit Lecture_Level_Edit_Mode for any other lecture currently being edited
3. WHEN a Teacher enters Assessment_Level_Edit_Mode for an assessment, THE Course_Details_Page SHALL exit Assessment_Level_Edit_Mode for any other assessment currently being edited
4. WHEN a Teacher enters Course_Level_Edit_Mode, THE Course_Details_Page SHALL exit all Lesson_Level_Edit_Mode, Lecture_Level_Edit_Mode, and Assessment_Level_Edit_Mode states
5. WHEN a Teacher enters Lesson_Level_Edit_Mode, THE Course_Details_Page SHALL NOT exit Course_Level_Edit_Mode if it is active

### Requirement 6: Edit State Management Service

**User Story:** As a developer, I want a centralized service to manage edit states across all hierarchy levels, so that edit mode state is consistent and maintainable.

#### Acceptance Criteria

1. THE Edit_State_Service SHALL maintain a signal for the current course-level edit state (boolean)
2. THE Edit_State_Service SHALL maintain a signal for the currently editing lesson ID (string or null)
3. THE Edit_State_Service SHALL maintain a signal for the currently editing lecture ID (string or null)
4. THE Edit_State_Service SHALL maintain a signal for the currently editing assessment ID (string or null)
5. THE Edit_State_Service SHALL provide a method to enter Course_Level_Edit_Mode
6. THE Edit_State_Service SHALL provide a method to enter Lesson_Level_Edit_Mode for a specific lesson ID
7. THE Edit_State_Service SHALL provide a method to enter Lecture_Level_Edit_Mode for a specific lecture ID
8. THE Edit_State_Service SHALL provide a method to enter Assessment_Level_Edit_Mode for a specific assessment ID
9. THE Edit_State_Service SHALL provide a method to exit all edit modes
10. WHEN entering Course_Level_Edit_Mode, THE Edit_State_Service SHALL clear all lesson, lecture, and assessment edit states
11. WHEN entering Lesson_Level_Edit_Mode for a lesson, THE Edit_State_Service SHALL clear any other lesson edit state
12. WHEN entering Lecture_Level_Edit_Mode for a lecture, THE Edit_State_Service SHALL clear any other lecture edit state
13. WHEN entering Assessment_Level_Edit_Mode for an assessment, THE Edit_State_Service SHALL clear any other assessment edit state

### Requirement 7: Delete Button Visibility

**User Story:** As a teacher, I want delete buttons to appear only when the corresponding edit mode is active, so that I don't accidentally delete content.

#### Acceptance Criteria

1. WHILE in Course_Level_Edit_Mode, THE Course_Details_Page SHALL display "Delete Lesson" buttons for all lessons
2. WHILE NOT in Course_Level_Edit_Mode, THE Course_Details_Page SHALL NOT display "Delete Lesson" buttons
3. WHILE in Lesson_Level_Edit_Mode for a lesson, THE Course_Details_Page SHALL display a "Delete Lesson" button for that lesson only
4. WHILE in Lecture_Level_Edit_Mode for a lecture, THE Course_Details_Page SHALL display a "Delete Lecture" button for that lecture only
5. WHILE in Assessment_Level_Edit_Mode for an assessment, THE Course_Details_Page SHALL display a "Delete Assessment" button for that assessment only
6. WHILE NOT in any edit mode for an item, THE Course_Details_Page SHALL NOT display delete buttons for that item

### Requirement 8: Form Display Behavior

**User Story:** As a teacher, I want edit forms to appear below existing content rather than replacing it, so that I can see the original content while editing.

#### Acceptance Criteria

1. WHEN entering Lesson_Level_Edit_Mode for a lesson, THE Course_Details_Page SHALL display the edit form below the lesson's title and description
2. WHEN entering Lecture_Level_Edit_Mode for a lecture, THE Course_Details_Page SHALL display the edit form below the lecture's title and content
3. WHEN entering Assessment_Level_Edit_Mode for an assessment, THE Course_Details_Page SHALL display the edit form below the assessment's title and description
4. WHILE displaying an edit form, THE Course_Details_Page SHALL NOT hide the original content being edited
5. WHEN exiting edit mode for an item, THE Course_Details_Page SHALL remove the edit form for that item

### Requirement 9: Minimalist UI Styling

**User Story:** As a teacher, I want the editing interface to remain minimalist without visual clutter, so that I can focus on content rather than interface elements.

#### Acceptance Criteria

1. THE Course_Details_Page SHALL NOT add borders around items in edit mode
2. THE Course_Details_Page SHALL NOT add shadows around items in edit mode
3. THE Course_Details_Page SHALL NOT add background colors to items in edit mode
4. THE Course_Details_Page SHALL use inline buttons and forms without additional container styling
5. THE Course_Details_Page SHALL maintain the existing visual hierarchy and spacing when entering edit mode

### Requirement 10: Backward Compatibility with Course Level Edit Mode

**User Story:** As a teacher, I want the existing course-level edit functionality to continue working, so that my current workflow is not disrupted.

#### Acceptance Criteria

1. THE Course_Details_Page SHALL preserve the existing course-level "Edit" button behavior
2. WHEN in Course_Level_Edit_Mode, THE Course_Details_Page SHALL display the "Add Lesson" button as it currently does
3. WHEN in Course_Level_Edit_Mode, THE Course_Details_Page SHALL display the course edit form as it currently does
4. WHEN in Course_Level_Edit_Mode, THE Course_Details_Page SHALL display "Save", "Cancel", and "Delete Course" buttons as they currently appear
5. THE Course_Details_Page SHALL continue to use the existing LessonFormService, LectureFormService, and AssessmentFormService for form management

### Requirement 11: Student View Isolation

**User Story:** As a student, I want to see course content without any editing controls, so that the interface is clean and focused on learning.

#### Acceptance Criteria

1. WHEN a Student views the Course_Details_Page, THE Course_Details_Page SHALL NOT display any "Edit" buttons
2. WHEN a Student views the Course_Details_Page, THE Course_Details_Page SHALL NOT display any "Delete" buttons
3. WHEN a Student views the Course_Details_Page, THE Course_Details_Page SHALL NOT display any edit forms
4. THE Course_Details_Page SHALL only display editing controls when the user role is TEACHER or ADMIN

### Requirement 12: Edit Mode Persistence During Navigation

**User Story:** As a teacher, I want edit modes to reset when I navigate away from an item, so that I don't accidentally leave items in edit mode.

#### Acceptance Criteria

1. WHEN a Teacher collapses a lesson that is in Lesson_Level_Edit_Mode, THE Course_Details_Page SHALL exit Lesson_Level_Edit_Mode for that lesson
2. WHEN a Teacher collapses a lecture that is in Lecture_Level_Edit_Mode, THE Course_Details_Page SHALL exit Lecture_Level_Edit_Mode for that lecture
3. WHEN a Teacher navigates away from the Course_Details_Page, THE Edit_State_Service SHALL clear all edit mode states
4. WHEN a Teacher refreshes the Course_Details_Page, THE Course_Details_Page SHALL load with no items in edit mode
