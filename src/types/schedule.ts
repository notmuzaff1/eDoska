/**
 * School schedule types for eDoska classroom platform
 * Supports Uzbek-language lesson data with teacher and room information
 */

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export interface Lesson {
  dayOfWeek: DayOfWeek;
  timeStart: string; // HH:MM format
  timeEnd: string; // HH:MM format
  subject: string; // Subject name (supports Uzbek text)
  teacher: string; // Full name of teacher
  room: string; // Room number or location
  className: string; // Class identifier (e.g., "10-V")
}

export interface Schedule {
  className: string;
  date: string; // Date when schedule is valid
  lessons: Lesson[];
}

export interface ScheduleResponse {
  success: boolean;
  data?: Schedule;
  error?: string;
}
