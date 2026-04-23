import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../pages/courses/course.model';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-card.html',
  styleUrls: ['./course-card.css'],
})
export class CourseCardComponent {
  @Input() course!: Course;
}
