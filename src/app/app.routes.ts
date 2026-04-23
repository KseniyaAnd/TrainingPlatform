import { Routes } from '@angular/router';
import { CoursesPageComponent } from './pages/courses/courses.page';
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
        component: CoursesPageComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
