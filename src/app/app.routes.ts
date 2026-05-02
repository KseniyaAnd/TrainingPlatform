import { Routes } from '@angular/router';
import { CourseDetailsPage } from './pages/courses/course-details/course-details';
import { CourseStudentViewPage } from './pages/courses/course-student-view/course-student-view';
import { CoursesPage } from './pages/courses/courses';
import { CreateCoursePage } from './pages/courses/create-course/create-course';
import { MyCreatedCoursesPage } from './pages/courses/my-created-courses/my-created-courses';
import { MyLearningCoursesPage } from './pages/courses/my-learning-courses/my-learning-courses';
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
        path: 'my-courses/teaching',
        component: MyCreatedCoursesPage,
      },
      {
        path: 'my-courses/teaching/create',
        component: CreateCoursePage,
      },
      {
        path: 'my-courses/learning',
        component: MyLearningCoursesPage,
      },
      {
        path: 'courses/:courseId/student',
        component: CourseStudentViewPage,
      },
      {
        path: 'courses/:courseId',
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
