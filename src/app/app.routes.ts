import { Routes } from '@angular/router';
import { CourseDetailsPage } from './pages/courses/course-details/course-details';
import { CoursesPage } from './pages/courses/courses';
import { HomePageComponent } from './pages/home/home';
import { LoginPage } from './pages/login/login';
import { RegisterPage } from './pages/register/register';

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
      {
        path: 'register',
        component: RegisterPage,
      },
      {
        path: 'login',
        component: LoginPage,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
