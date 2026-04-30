import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { firstValueFrom } from 'rxjs';
import { Course } from '../../../models/course.model';
import { Lesson } from '../../../models/lesson.model';
import { Topic } from '../../../models/topic.model';
import { CoursesService } from '../../../services/courses/courses.service';

@Component({
  selector: 'app-course-details-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule, TagModule, MessageModule],
  templateUrl: './course-details.html',
  styles: `
    :host ::ng-deep .p-card .black-color {
      color: #111827 !important;
    }

    :host ::ng-deep .custom-lesson-tag.p-tag {
      background: #34d399;
      border: none;
    }

    :host ::ng-deep .custom-lesson-tag .p-tag-value {
      color: #18181b !important;
    }

    :host ::ng-deep .p-card-body {
      display: none;
    }
  `,
})
export class CourseDetailsPage {
  readonly courseId: string;
  subscribed = false;

  private readonly coursesService = inject(CoursesService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly lessons: Lesson[] = [
    {
      id: 'aabbccdd-1122-3344-5566-778899aabbcc',
      courseId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      title: 'Введение в архитектуру',
      kind: 'lecture',
      content: 'В этом уроке рассматриваются основные принципы...',
    },
    {
      id: 'ddeeff00-1111-2222-3333-444455556666',
      courseId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      title: 'Практика: слои приложения',
      kind: 'lesson',
      content: null,
    },
  ];

  private readonly topics: Topic[] = [
    {
      id: 'ccddee11-3344-5566-7788-99aabbccddee',
      lessonId: 'aabbccdd-1122-3344-5566-778899aabbcc',
      title: 'Что такое Clean Architecture',
      videoUrl: 'https://youtube.com/watch?v=abc123',
      content: null,
    },
    {
      id: '11223344-5566-7788-99aa-bbccddeeff00',
      lessonId: 'ddeeff00-1111-2222-3333-444455556666',
      title: 'Разделяем домен и инфраструктуру',
      videoUrl: null,
      content: null,
    },
  ];

  course: Course | undefined;
  courseLessons: Array<Lesson & { topics: Topic[] }> = [];

  constructor(route: ActivatedRoute) {
    this.courseId = route.snapshot.paramMap.get('id') ?? '';

    void this.loadCourse();

    this.courseLessons = this.lessons
      .filter((l) => l.courseId === this.courseId)
      .map((l) => ({
        ...l,
        topics: this.topics.filter((t) => t.lessonId === l.id),
      }));
  }

  private async loadCourse(): Promise<void> {
    if (!this.courseId) {
      this.course = undefined;
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      this.course = await firstValueFrom(this.coursesService.getCourseById(this.courseId));
    } catch (e) {
      this.course = undefined;
      this.error.set(e instanceof Error ? e.message : 'Failed to load course');
    } finally {
      this.loading.set(false);
    }
  }

  toggleSubscribe(): void {
    this.subscribed = !this.subscribed;
  }
}
