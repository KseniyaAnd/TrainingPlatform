import { Component, input, output } from '@angular/core';
import { ChipComponent } from '../ui/chip/chip';

export type RoleFilter = 'ALL' | 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface RoleFilterOption {
  label: string;
  value: RoleFilter;
}

@Component({
  selector: 'app-role-filter',
  standalone: true,
  imports: [ChipComponent],
  templateUrl: './role-filter.html',
})
export class RoleFilterComponent {
  readonly selectedRole = input<RoleFilter>('ALL');
  readonly roleChanged = output<RoleFilter>();

  readonly filters: RoleFilterOption[] = [
    { label: 'Все', value: 'ALL' },
    { label: 'Администраторы', value: 'ADMIN' },
    { label: 'Преподаватели', value: 'TEACHER' },
    { label: 'Студенты', value: 'STUDENT' },
  ];
}
