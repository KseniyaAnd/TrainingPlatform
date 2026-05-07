import { Component, input, output } from '@angular/core';

import { Lecture } from '../../../../../../models/lecture.model';
import { LectureCardComponent } from '../lecture-card/lecture-card';

@Component({
  selector: 'app-lectures-list',
  standalone: true,
  imports: [LectureCardComponent],
  templateUrl: './lectures-list.html',
})
export class LecturesListComponent {
  readonly lectures = input.required<Lecture[]>();
  readonly editMode = input<boolean>(false);

  readonly onEdit = output<Lecture>();
  readonly onDelete = output<Lecture>();
}
