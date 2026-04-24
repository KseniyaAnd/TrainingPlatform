import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CourseCardComponent } from '../../components/course-card/course-card';
import { Course } from '../../models/course.model';

@Component({
  selector: 'app-courses-page',
  standalone: true,
  imports: [CommonModule, CourseCardComponent],
  templateUrl: './courses.html',
})
export class CoursesPage {
  items: Course[] = [
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      title: 'Java Architecture',
      description: 'Advanced backend course',
      teacherId: '1a2b3c4d-...',
      createdAt: '2026-04-20T19:10:00+00:00',
    },
  ];
}
