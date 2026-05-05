# Study Plan Download Feature

## Overview

The study plan feature has been updated to download a DOCX document instead of displaying a modal. When users click the "Скачать план" (Download Plan) button, a professionally formatted Word document is automatically generated and downloaded to their computer.

## Changes Made

### 1. Dependencies Added

- **docx**: Modern library for creating DOCX documents programmatically
- **file-saver**: Library for triggering file downloads in the browser
- **@types/file-saver**: TypeScript type definitions for file-saver

```bash
npm install docx file-saver
npm install --save-dev @types/file-saver
```

### 2. Component Updates

#### `course-analytics.ts`

- Removed modal-related signals (`selectedStudentId`, `studyPlanData`, `studyPlanError`)
- Removed `StudentStudyPlanModalComponent` import
- Added `docx` and `file-saver` imports
- Modified `viewStudentPlan()` to generate and download DOCX instead of opening modal
- Added `downloadStudyPlanAsDocx()` method to handle document generation
- Added `generateStudyPlanDocument()` method to create structured DOCX content using the docx library

#### `course-analytics.html`

- Changed button label from "Учебный план" to "Скачать план"
- Changed button icon from `pi-book` to `pi-download`
- Added loading state with spinner icon
- Added disabled state while loading
- Removed modal component reference

### 3. Document Structure

The generated DOCX document includes:

#### Header Section

- **Title**: "📚 Персональный учебный план" (Personal Study Plan)
- **Student ID**: Unique identifier for the student
- **Course ID**: Course identifier
- **Current Progress**: Percentage completion
- **Estimated Completion**: Time in weeks
- **Creation Date**: Document generation date in Russian format

#### Content Sections (dynamically included if data available)

1. **💡 Обоснование плана** (Plan Rationale) - AI-generated explanation of the plan
2. **🎯 Приоритетные цели** (Priority Goals) - Bulleted list of prioritized learning goals
3. **📅 Еженедельные задачи** (Weekly Targets) - Week-by-week tasks and milestones
4. **🔍 Области фокуса** (Focus Areas) - Key areas requiring attention
5. **✅ Рекомендации** (Recommendations) - General study recommendations
6. **📖 Рекомендуемые уроки** (Recommended Lessons) - Specific lessons to review
7. **🎓 Рекомендуемые лекции** (Recommended Lectures) - Specific lectures to watch

#### Footer

- Informational text about automated generation
- Guidance on following recommendations

### 4. Styling & Formatting

The document uses professional formatting with:

- **Hierarchical headings**: H1 for title, H2 for sections
- **Proper spacing**: Consistent spacing between sections and paragraphs
- **Bullet points**: Indented lists for better readability
- **Bold labels**: Key information highlighted
- **Centered footer**: Professional closing text
- **Border separator**: Visual separation before footer

### 5. Technical Implementation

The `docx` library provides:

- Type-safe document creation
- Professional formatting options
- Proper DOCX structure
- Cross-platform compatibility
- No HTML parsing required

## Usage

1. Navigate to the course analytics page
2. Find the student whose plan you want to download
3. Click the "Скачать план" button
4. Wait for the loading spinner (data fetching + document generation)
5. The document will be automatically downloaded with filename format: `Учебный_план_{studentId}_{date}.docx`

## Optional: Document Generator Service

A reusable `DocumentGeneratorService` has been created at `src/app/services/document-generator.service.ts` for future document generation needs. This service can be injected into any component that needs to generate DOCX documents.

### Service Methods

```typescript
// Download a Document object as DOCX
async downloadDocx(doc: Document, filename: string): Promise<void>

// Create a simple document with title and paragraphs
createSimpleDocument(title: string, paragraphs: string[]): Document

// Create a document with sections
createSectionedDocument(
  title: string,
  sections: Array<{ heading: string; content: string[] }>
): Document

// Create bulleted list paragraphs
createBulletList(items: string[]): Paragraph[]

// Create paragraph with bold label and regular text
createLabeledParagraph(boldText: string, regularText: string): Paragraph
```

### Example Usage

```typescript
import { inject } from '@angular/core';
import { DocumentGeneratorService } from './services/document-generator.service';

export class MyComponent {
  private docService = inject(DocumentGeneratorService);

  async generateReport() {
    const doc = this.docService.createSectionedDocument('My Report', [
      { heading: 'Section 1', content: ['Content here'] },
      { heading: 'Section 2', content: ['More content'] },
    ]);

    await this.docService.downloadDocx(doc, 'my-report');
  }
}
```

## Benefits

1. **Offline Access**: Students can save and review their study plans offline
2. **Sharing**: Easy to share plans with mentors, peers, or advisors
3. **Printing**: Can be printed for physical reference
4. **Archiving**: Students can track their progress over time by saving multiple versions
5. **Professional Format**: DOCX format is universally compatible and professional
6. **Editable**: Students can add their own notes and modifications
7. **No HTML Parsing**: Direct document generation without HTML intermediary
8. **Type Safety**: Full TypeScript support for document structure

## Technical Advantages of `docx` Library

- ✅ **Modern & Maintained**: Active development and community support
- ✅ **TypeScript Native**: Built with TypeScript, full type safety
- ✅ **No HTML Parsing**: Direct DOCX generation
- ✅ **Angular Compatible**: Works seamlessly with Angular's build system
- ✅ **Rich Formatting**: Supports tables, images, headers, footers, and more
- ✅ **Professional Output**: Generates proper Office Open XML format

## Future Enhancements

Possible improvements:

- Add tables for structured data (e.g., weekly schedule)
- Include charts/graphs for progress visualization
- Support for multiple languages
- Custom branding/logo in document header
- Email delivery option
- PDF export alternative using pdf-lib
- Template system for different document types
- Progress tracking with color-coded sections
