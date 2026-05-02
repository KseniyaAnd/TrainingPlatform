import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { Course } from '../../models/course.model';
import { AuthStateService } from '../../services/auth/auth-state.service';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TagModule],
  templateUrl: './course-card.html',
  styleUrls: ['./course-card.css'],
})
export class CourseCardComponent {
  @Input() course!: Course;
  @Input() clickable = true;
  @Input() showEnrollButton = false;
  @Input() isEnrolled = false;
  @Input() enrollmentId: string | null = null;

  @Output() enroll = new EventEmitter<void>();
  @Output() unenroll = new EventEmitter<void>();

  private readonly authState = inject(AuthStateService);

  readonly isStudent = computed(() => this.authState.role() === 'STUDENT');
  readonly enrolling = signal(false);

  async handleEnroll(event?: Event): Promise<void> {
    event?.preventDefault();
    event?.stopPropagation();

    if (this.enrolling() || this.isEnrolled) return;
    if (!this.course?.id) return;

    this.enrolling.set(true);
    try {
      this.enroll.emit();
    } finally {
      // Keep enrolling state until parent updates isEnrolled
      setTimeout(() => this.enrolling.set(false), 500);
    }
  }

  async handleUnenroll(event?: Event): Promise<void> {
    event?.preventDefault();
    event?.stopPropagation();

    if (this.enrolling() || !this.isEnrolled || !this.enrollmentId) return;

    this.enrolling.set(true);
    try {
      this.unenroll.emit();
    } finally {
      // Keep enrolling state until parent updates isEnrolled
      setTimeout(() => this.enrolling.set(false), 500);
    }
  }
}
