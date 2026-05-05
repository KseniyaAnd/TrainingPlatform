import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { Lecture } from '../../../../../../models/lecture.model';
import { LectureCardComponent } from '../lecture-card/lecture-card.component';

@Component({
  selector: 'app-lectures-list',
  standalone: true,
  imports: [CommonModule, LectureCardComponent],
  templateUrl: './lectures-list.component.html',
})
export class LecturesListComponent {
  readonly lectures = input.required<Lecture[]>();
  readonly editMode = input<boolean>(false);

  readonly onEdit = output<Lecture>();
  readonly onDelete = output<Lecture>();
}
