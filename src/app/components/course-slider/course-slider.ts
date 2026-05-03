import { Component, computed, effect, ElementRef, input, output, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import Glider from 'glider-js';
import { Course } from '../../models/course.model';
import { CourseCardComponent } from '../course-card/course-card';

interface ResponsiveSettings {
  breakpoint: number;
  settings: { slidesToShow: number; slidesToScroll: number };
}

@Component({
  selector: 'app-course-slider',
  imports: [CourseCardComponent],
  templateUrl: './course-slider.html',
  styleUrl: './course-slider.css',
})
export class CourseSliderComponent {
  // Inputs
  readonly courses = input.required<Course[]>();
  readonly showMoreLink = input(false);
  readonly moreLinkText = input('Смотреть все');
  readonly moreLinkUrl = input('/courses');
  readonly moreLinkQueryParams = input<Record<string, string>>({});
  readonly slidesToShow = input(1);
  readonly showDots = input(true);
  readonly showArrows = input(true);
  readonly clickable = input(true);

  // Output
  readonly courseClick = output<Course>();

  // Computed
  readonly items = computed(() => {
    const coursesList = this.courses();
    return this.showMoreLink() ? [...coursesList, 'link' as const] : coursesList;
  });

  // ViewChild
  private readonly gliderElement = viewChild<ElementRef<HTMLElement>>('gliderElement');
  private glider?: Glider<HTMLElement>;

  // Drag detection
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private readonly dragThreshold = 5; // pixels

  constructor(private readonly router: Router) {
    effect((onCleanup) => {
      const element = this.gliderElement()?.nativeElement;
      const itemsList = this.items();

      if (!element || itemsList.length === 0) return;

      const timeoutId = setTimeout(() => this.initGlider(element), 0);

      onCleanup(() => {
        clearTimeout(timeoutId);
        this.glider?.destroy();
        this.glider = undefined;
      });
    });
  }

  private initGlider(element: HTMLElement): void {
    this.glider?.destroy();

    const responsive: ResponsiveSettings[] = [
      { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 1280, settings: { slidesToShow: 4, slidesToScroll: 1 } },
    ];

    this.glider = new Glider(element, {
      slidesToShow: this.slidesToShow(),
      slidesToScroll: 1,
      draggable: true,
      dots: this.showDots() ? '.glider-dots' : undefined,
      arrows: this.showArrows() ? { prev: '.glider-prev', next: '.glider-next' } : undefined,
      responsive,
    });

    // Добавляем обработчики для отслеживания drag
    element.addEventListener('mousedown', this.handleDragStart);
    element.addEventListener('touchstart', this.handleDragStart);
    element.addEventListener('mousemove', this.handleDragMove);
    element.addEventListener('touchmove', this.handleDragMove);
    element.addEventListener('mouseup', this.handleDragEnd);
    element.addEventListener('touchend', this.handleDragEnd);
  }

  private readonly handleDragStart = (e: MouseEvent | TouchEvent): void => {
    this.isDragging = false;
    const point = e instanceof MouseEvent ? e : e.touches[0];
    this.dragStartX = point.clientX;
    this.dragStartY = point.clientY;
  };

  private readonly handleDragMove = (e: MouseEvent | TouchEvent): void => {
    const point = e instanceof MouseEvent ? e : e.touches[0];
    const deltaX = Math.abs(point.clientX - this.dragStartX);
    const deltaY = Math.abs(point.clientY - this.dragStartY);

    if (deltaX > this.dragThreshold || deltaY > this.dragThreshold) {
      this.isDragging = true;
    }
  };

  private readonly handleDragEnd = (): void => {
    // Сбрасываем флаг после небольшой задержки
    setTimeout(() => {
      this.isDragging = false;
    }, 100);
  };

  isCourse(item: Course | 'link'): item is Course {
    return item !== 'link';
  }

  onCourseClick(course: Course, event: Event): void {
    if (this.isDragging) {
      event.preventDefault();
      return;
    }
    this.courseClick.emit(course);
  }

  onMoreLinkClick(event: Event): void {
    if (this.isDragging) {
      event.preventDefault();
      return;
    }

    void this.router.navigate([this.moreLinkUrl()], {
      queryParams: this.moreLinkQueryParams(),
    });
  }
}
