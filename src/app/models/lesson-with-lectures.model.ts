import { Lecture } from './lecture.model';
import { Lesson } from './lesson.model';

/**
 * Урок с вложенными лекциями
 */
export type LessonWithLectures = Lesson & { lectures: Lecture[] };
