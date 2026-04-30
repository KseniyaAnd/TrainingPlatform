import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { Course } from '../../models/course.model';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TagModule],
  templateUrl: './course-card.html',
  styleUrls: ['./course-card.css'],
})
export class CourseCardComponent {
  @Input() course!: Course;
}
