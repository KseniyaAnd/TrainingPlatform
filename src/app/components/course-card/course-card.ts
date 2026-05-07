import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Course } from '../../models/course.model';
import { TagComponent } from '../../shared/components/ui/tag/tag';
import { FormatDatePipe } from '../../shared/pipes/format-date.pipe';
import { RoleCheckerService } from '../../shared/services/role-checker.service';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [RouterModule, FormatDatePipe, TagComponent],
  templateUrl: './course-card.html',
})
export class CourseCardComponent {
  @Input() course!: Course;
  @Input() clickable = true;
  @Input() showEnrollButton = false;
  @Input() isEnrolled = false;
  @Input() enrollmentId: string | null = null;

  @Output() enroll = new EventEmitter<void>();
  @Output() unenroll = new EventEmitter<void>();

  private readonly roleChecker = inject(RoleCheckerService);

  readonly isStudent = this.roleChecker.isStudent;
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
