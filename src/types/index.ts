export interface SessionData {
  sessionId: string;
  isAuthenticated: boolean;
  className: string;
  subject: string;
  topic: string;
  teacherName: string;
  grade: string;
  currentTime: Date;
}

export interface Lesson {
  dayOfWeek: string;
  timeStart: string;
  timeEnd: string;
  subject: string;
  teacher: string;
  room: string;
  className: string;
}

export interface SlideData {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
}

export interface LessonSchedule {
  time: string;
  subject: string;
}

export interface AIGeneratedLesson {
  title: string;
  slides: SlideData[];
  videos: YouTubeVideo[];
  topic: string;
  generatedAt: Date;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface DockAction {
  id: string;
  label: string;
  icon: string;
  action: string;
}
