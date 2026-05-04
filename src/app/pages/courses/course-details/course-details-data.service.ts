import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';

import {
  AssessmentDifficulty,
  CourseContentService,
  CreateAssessmentFromDraftRequest,
  CreateAssessmentRequest,
  CreateLectureRequest,
  CreateLessonRequest,
  GenerateAssessmentDraftRequest,
  UpdateAssessmentRequest,
  UpdateLectureRequest,
  UpdateLessonRequest,
} from '../../../services/courses/course-content.service';
import { CoursesService, UpdateCourseRequest } from '../../../services/courses/courses.service';
import { ProgressService } from '../../../services/progress/progress.service';
import { SubmissionsService } from '../../../services/submissions/submissions.service';

export type {
  AssessmentDifficulty,
  CreateAssessmentFromDraftRequest,
  CreateAssessmentRequest,
  CreateLectureRequest,
  CreateLessonRequest,
  GenerateAssessmentDraftRequest,
  UpdateAssessmentRequest,
  UpdateCourseRequest,
  UpdateLectureRequest,
  UpdateLessonRequest,
};

@Injectable({ providedIn: 'root' })
export class CourseDetailsDataService {
  private readonly coursesService = inject(CoursesService);
  private readonly courseContent = inject(CourseContentService);
  private readonly progressService = inject(ProgressService);
  private readonly submissionsService = inject(SubmissionsService);

  getCourse(courseId: string) {
    return this.coursesService.getCourseById(courseId);
  }

  updateCourse(courseId: string, payload: UpdateCourseRequest) {
    return this.coursesService.updateCourse(courseId, payload);
  }

  deleteCourse(courseId: string) {
    return this.coursesService.deleteCourse(courseId);
  }

  getLessons(courseId: string) {
    return this.courseContent.getLessonsByCourseId(courseId);
  }

  getLectures(lessonId: string) {
    return this.courseContent.getLecturesByLessonId(lessonId);
  }

  getAssessments(courseId: string) {
    return this.courseContent.getAssessmentsByCourseId(courseId);
  }

  getAssessmentsForStudent(courseId: string) {
    return this.submissionsService.getCourseAssessments(courseId);
  }

  getMySubmissions() {
    return this.submissionsService.getMySubmissions();
  }

  createSubmission(assessmentId: string, answerText: string) {
    return this.submissionsService.createSubmission({ assessmentId, answerText });
  }

  getCourseProgress(courseId: string) {
    return this.progressService.getCourseProgress(courseId);
  }

  markLectureCompleted(courseId: string, userId: string, lectureId: string) {
    return this.progressService.markLectureCompleted(courseId, userId, lectureId);
  }

  createLesson(payload: CreateLessonRequest) {
    return this.courseContent.createLesson(payload);
  }

  updateLesson(lessonId: string, payload: UpdateLessonRequest) {
    return this.courseContent.updateLesson(lessonId, payload);
  }

  deleteLesson(lessonId: string) {
    return this.courseContent.deleteLesson(lessonId);
  }

  createLecture(payload: CreateLectureRequest) {
    return this.courseContent.createLecture(payload);
  }

  updateLecture(lectureId: string, payload: UpdateLectureRequest) {
    return this.courseContent.updateLecture(lectureId, payload);
  }

  deleteLecture(lectureId: string) {
    return this.courseContent.deleteLecture(lectureId);
  }

  createAssessment(payload: CreateAssessmentRequest) {
    return this.courseContent.createAssessment(payload);
  }

  updateAssessment(assessmentId: string, payload: UpdateAssessmentRequest) {
    return this.courseContent.updateAssessment(assessmentId, payload);
  }

  deleteAssessment(assessmentId: string) {
    return this.courseContent.deleteAssessment(assessmentId);
  }

  generateAssessmentDraft(payload: GenerateAssessmentDraftRequest) {
    return this.courseContent.generateAssessmentDraft(payload);
  }

  createAssessmentFromDraft(payload: CreateAssessmentFromDraftRequest) {
    return this.courseContent.createAssessmentFromDraft(payload);
  }

  enroll(courseId: string) {
    return this.coursesService.enroll(courseId);
  }

  checkEnrollmentStatus(courseId: string) {
    return this.coursesService.getEnrolledCourses({ limit: 200 }).pipe(
      map((response) => {
        const enrollment = response.items.find((e) => e.course.id === courseId);
        return enrollment
          ? { isEnrolled: true, enrollmentId: enrollment.enrollmentId }
          : { isEnrolled: false, enrollmentId: null };
      }),
    );
  }

  getCourseStudentAnalytics(courseId: string) {
    return this.progressService.getCourseStudentAnalytics(courseId);
  }

  getStudentAiStudyPlan(courseId: string, studentId: string) {
    return this.progressService.getStudentAiStudyPlan(courseId, studentId);
  }
}
