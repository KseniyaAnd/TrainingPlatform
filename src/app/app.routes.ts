import { Routes } from '@angular/router';
import { HeaderComponent } from './header/header';
import { CoursesPageComponent } from './pages/courses/courses.page';
import { HomePageComponent } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: HeaderComponent,
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
