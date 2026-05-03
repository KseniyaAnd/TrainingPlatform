import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

export interface CourseFilters {
  tag: string | null;
  sortBy: 'date' | 'title' | null;
}

@Component({
  selector: 'app-course-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-filters.html',
  styleUrls: ['./course-filters.css'],
})
export class CourseFiltersComponent {
  // Inputs как signals
  selectedTag = input<string | null>(null);
  selectedSort = input<'date' | 'title' | null>(null);

  // Output как signal-based output
  filtersChange = output<CourseFilters>();

  readonly tags = [
    'дизайн',
    'фронтенд',
    'бэкенд',
    'машинное обучение',
    'DevOps',
    'Мобильная разработка',
  ];

  readonly sortOptions: Array<{ value: 'date' | 'title'; label: string }> = [
    { value: 'date', label: 'По дате создания' },
    { value: 'title', label: 'По алфавиту' },
  ];

  selectTag(tag: string | null): void {
    this.filtersChange.emit({
      tag: tag,
      sortBy: this.selectedSort(),
    });
  }

  selectSort(sort: 'date' | 'title'): void {
    const newSort = this.selectedSort() === sort ? null : sort;
    this.filtersChange.emit({
      tag: this.selectedTag(),
      sortBy: newSort,
    });
  }
}
