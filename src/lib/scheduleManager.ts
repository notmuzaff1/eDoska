import { Lesson } from '@/types';
import scheduleData from '@/data/schedule.json';

export const scheduleManager = {
  getAllLessons: (): Lesson[] => {
    return scheduleData as Lesson[];
  },

  getCurrentLesson: (): Lesson | null => {
    const now = new Date();
    const dayOfWeek = getDayName(now.getDay());
    const currentTime = formatTime(now);

    const lessons = scheduleData as Lesson[];
    const currentLesson = lessons.find(
      (lesson) =>
        lesson.dayOfWeek === dayOfWeek &&
        lesson.timeStart <= currentTime &&
        lesson.timeEnd >= currentTime
    );

    return currentLesson || null;
  },

  getNextLesson: (): Lesson | null => {
    const now = new Date();
    const dayOfWeek = getDayName(now.getDay());
    const currentTime = formatTime(now);

    const lessons = scheduleData as Lesson[];
    const todayLessons = lessons.filter((l) => l.dayOfWeek === dayOfWeek);

    const nextLesson = todayLessons.find((lesson) => lesson.timeStart > currentTime);
    return nextLesson || null;
  },

  getLessonsByDay: (dayOfWeek: string): Lesson[] => {
    const lessons = scheduleData as Lesson[];
    return lessons.filter((l) => l.dayOfWeek === dayOfWeek).sort((a, b) => {
      return a.timeStart.localeCompare(b.timeStart);
    });
  },

  getLessonsByTeacher: (teacher: string): Lesson[] => {
    const lessons = scheduleData as Lesson[];
    return lessons.filter((l) => l.teacher === teacher);
  },

  getLessonsBySubject: (subject: string): Lesson[] => {
    const lessons = scheduleData as Lesson[];
    return lessons.filter((l) => l.subject === subject);
  },

  getTimeUntilNextLesson: (): { minutes: number; seconds: number } | null => {
    const nextLesson = scheduleManager.getNextLesson();
    if (!nextLesson) return null;

    const now = new Date();
    const [hours, minutes] = nextLesson.timeStart.split(':').map(Number);
    const lessonTime = new Date();
    lessonTime.setHours(hours, minutes, 0, 0);

    const diff = Math.max(0, lessonTime.getTime() - now.getTime());
    return {
      minutes: Math.floor(diff / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  },

  getLessonDuration: (lesson: Lesson): number => {
    const [startH, startM] = lesson.timeStart.split(':').map(Number);
    const [endH, endM] = lesson.timeEnd.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  },

  getTimeRemainingInLesson: (lesson: Lesson): { minutes: number; seconds: number } => {
    const now = new Date();
    const [endH, endM] = lesson.timeEnd.split(':').map(Number);
    const endTime = new Date();
    endTime.setHours(endH, endM, 0, 0);

    const diff = Math.max(0, endTime.getTime() - now.getTime());
    return {
      minutes: Math.floor(diff / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  },

  getAllTeachers: (): string[] => {
    const lessons = scheduleData as Lesson[];
    const teachers = new Set(lessons.map((l) => l.teacher));
    return Array.from(teachers).sort();
  },

  getAllSubjects: (): string[] => {
    const lessons = scheduleData as Lesson[];
    const subjects = new Set(lessons.map((l) => l.subject));
    return Array.from(subjects).sort();
  },

  isSchoolOver: (): boolean => {
    const now = new Date();
    return now.getHours() >= 13;
  },

  getTodaySchedule: (): Lesson[] => {
    const now = new Date();
    const dayOfWeek = getDayName(now.getDay());
    return scheduleManager.getLessonsByDay(dayOfWeek);
  },
};

function getDayName(dayIndex: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
