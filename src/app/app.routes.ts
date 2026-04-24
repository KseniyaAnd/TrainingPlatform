import { Routes } from '@angular/router';
import { CourseDetailsPage } from './pages/courses/course-details/course-details';
import { CoursesPage } from './pages/courses/courses';
import { HomePageComponent } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: HomePageComponent,
      },
      {
        path: 'courses',
        component: CoursesPage,
      },
      {
        path: 'courses/:id',
        component: CourseDetailsPage,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
