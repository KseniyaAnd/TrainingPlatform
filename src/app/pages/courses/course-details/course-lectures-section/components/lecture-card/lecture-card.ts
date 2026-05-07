import { Component, computed, inject, input, output } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

import { Lecture } from '../../../../../../models/lecture.model';
import { AuthStateService } from '../../../../../../services/auth/auth-state.service';
import { ButtonComponent } from '../../../../../../shared/components/ui/button/button';

@Component({
  selector: 'app-lecture-card',
  standalone: true,
  imports: [ButtonComponent, CardModule, TagModule],
  templateUrl: './lecture-card.html',
  styles: `
    :host ::ng-deep .p-card .black-color {
      color: #111827 !important;
    }
  `,
})
export class LectureCardComponent {
  private readonly authState = inject(AuthStateService);

  readonly lecture = input.required<Lecture>();
  readonly editMode = input<boolean>(false);

  readonly onEdit = output<Lecture>();
  readonly onDelete = output<Lecture>();

  readonly canEditCourse = computed(() => {
    const role = this.authState.role();
    return role === 'TEACHER' || role === 'ADMIN';
  });
}
