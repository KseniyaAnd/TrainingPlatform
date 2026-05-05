import { Routes } from '@angular/router';
import { AssessmentGradingComponent } from './pages/courses/assessment-grading/assessment-grading';
import { CourseDetailsPage } from './pages/courses/course-details/course-details';
import { CoursesPage } from './pages/courses/courses';
import { CreateCoursePage } from './pages/courses/create-course/create-course';
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
        // Query params: ?scope=me (my courses), ?scope=all or no param (all courses)
        // Additional filters: ?tag=..., ?q=...
      },
      {
        path: 'courses/create',
        component: CreateCoursePage,
      },
      {
        path: 'courses/:courseId',
        component: CourseDetailsPage,
      },
      {
        path: 'assessments/:assessmentId/grade',
        component: AssessmentGradingComponent,
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
