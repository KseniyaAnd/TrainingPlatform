import { Routes } from '@angular/router';
import { adminGuard, authGuard, teacherGuard } from './guards/index';
import { AdminCoursesComponent } from './pages/admin/admin-courses/admin-courses.js';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.js';
import { AdminUserDetailsComponent } from './pages/admin/admin-user-details/admin-user-details.js';
import { AdminUsersComponent } from './pages/admin/admin-users/admin-users.js';
import { AssessmentGradingComponent } from './pages/courses/assessment-grading/assessment-grading.js';
import { CourseDetailsPage } from './pages/courses/course-details/course-details.js';
import { CoursesPage } from './pages/courses/courses.js';
import { CreateCoursePage } from './pages/courses/create-course/create-course.js';
import { HomePageComponent } from './pages/home/home.js';
import { LoginPage } from './pages/login/login.js';
import { RegisterPage } from './pages/register/register.js';

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
        canActivate: [authGuard],
        // Query params: ?scope=me (my courses), ?scope=all or no param (all courses)
        // Additional filters: ?tag=..., ?q=...
      },
      {
        path: 'courses/create',
        component: CreateCoursePage,
        canActivate: [authGuard, teacherGuard],
      },
      {
        path: 'courses/:courseId',
        component: CourseDetailsPage,
        canActivate: [authGuard],
      },
      {
        path: 'assessments/:assessmentId/grade',
        component: AssessmentGradingComponent,
        canActivate: [authGuard, teacherGuard],
      },
      {
        path: 'register',
        component: RegisterPage,
      },
      {
        path: 'login',
        component: LoginPage,
      },
      {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        children: [
          {
            path: '',
            component: AdminDashboardComponent,
          },
          {
            path: 'users',
            component: AdminUsersComponent,
          },
          {
            path: 'users/:userId',
            component: AdminUserDetailsComponent,
          },
          {
            path: 'courses',
            component: AdminCoursesComponent,
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
