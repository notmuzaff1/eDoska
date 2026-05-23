import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, BookOpen, Clock, User, MapPin, Play, FileText, Video } from 'lucide-react';
import { Lesson } from '@/types';
import { scheduleManager } from '@/lib/scheduleManager';

interface LessonsViewProps {
  currentLesson?: Lesson | null;
  onBack: () => void;
  onOpenWhiteboard?: () => void;
  onOpenBrowser?: () => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({ currentLesson, onBack, onOpenWhiteboard, onOpenBrowser }) => {
  const todaySchedule = scheduleManager.getTodaySchedule();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const lessonResources: Record<string, { video?: string; notes?: string; links?: string[] }> = {
    'Calculus': {
      video: 'https://www.youtube.com/watch?v=WsQQvHm4lSw',
      notes: 'Derivatives and Limits - Chapter 3',
      links: ['Khan Academy Calculus', 'Paul\'s Online Math Notes'],
    },
    'Physics': {
      video: 'https://www.youtube.com/watch?v=ZM8ECpBuQYE',
      notes: 'Mechanics and Motion - Unit 2',
      links: ['Physics Classroom', 'HyperPhysics'],
    },
    'Chemistry': {
      video: 'https://www.youtube.com/watch?v=yQP4uxJANSs',
      notes: 'Atomic Structure - Chapter 5',
      links: ['ChemGuide', 'Periodic Table'],
    },
    'Biology': {
      video: 'https://www.youtube.com/watch?v=QnQe0xW_JY4',
      notes: 'Cell Biology - Unit 3',
      links: ['BioNinja', 'Khan Academy Biology'],
    },
    'English Literature': {
      video: 'https://www.youtube.com/watch?v=7YPVvMKOZ9I',
      notes: 'Literary Analysis Techniques',
      links: ['SparkNotes', 'LitCharts'],
    },
    'History': {
      video: 'https://www.youtube.com/watch?v=x0C7r1YH0kE',
      notes: 'World History Overview',
      links: ['History.com', 'Crash Course History'],
    },
    'Computer Science': {
      video: 'https://www.youtube.com/watch?v=zOjov-2OZ0E',
      notes: 'Programming Fundamentals',
      links: ['freeCodeCamp', 'Codecademy'],
    },
    'Algebra': {
      video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      notes: 'Algebra Fundamentals',
      links: ['Khan Academy Algebra', 'Math is Fun'],
    },
  };

  if (selectedLesson) {
    const resources = lessonResources[selectedLesson.subject] || {};
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex-1 flex flex-col bg-gradient-to-br from-slate-900/30 to-blue-950/20 min-w-0 overflow-hidden"
      >
        {/* Header */}
        <div className="h-14 border-b border-blue-500/20 px-4 flex items-center justify-between bg-slate-900/50 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedLesson(null)} className="p-1.5 hover:bg-slate-800 rounded-lg transition-all">
              <ChevronRight className="w-5 h-5 text-slate-400 rotate-180" />
            </button>
            <h2 className="text-lg font-bold text-white">{selectedLesson.subject}</h2>
          </div>
        </div>

        {/* Lesson details */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Info card */}
            <div className="bg-slate-800/40 border border-blue-500/20 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-3">{selectedLesson.subject}</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>{selectedLesson.timeStart} - {selectedLesson.timeEnd}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>{selectedLesson.teacher}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>Room {selectedLesson.room}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>{selectedLesson.className}</span>
                </div>
              </div>
            </div>

            {/* Video resource */}
            {resources.video && (
              <div className="bg-slate-800/40 border border-blue-500/20 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Video className="w-4 h-4 text-red-400" />
                    Video Dars
                  </h4>
                <a
                  href={resources.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-lg hover:bg-slate-700/60 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <Play className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">YouTube'da ko'rish</p>
                    <p className="text-xs text-slate-400">Video darsni ochish uchun bosing</p>
                  </div>
                </a>
              </div>
            )}

            {/* Notes */}
            {resources.notes && (
              <div className="bg-slate-800/40 border border-blue-500/20 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    Dars Yozuvlari
                  </h4>
                <p className="text-sm text-slate-300">{resources.notes}</p>
              </div>
            )}

            {/* Quick actions */}
            <div className="bg-slate-800/40 border border-blue-500/20 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-white mb-3">Tezkor Amallar</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onOpenWhiteboard}
                  className="p-3 bg-cyan-500/10 border border-cyan-400/30 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/20 transition-all"
                >
                  Doskani ochish
                </button>
                <button
                  onClick={onOpenBrowser}
                  className="p-3 bg-green-500/10 border border-green-400/30 rounded-lg text-sm text-green-400 hover:bg-green-500/20 transition-all"
                >
                  Brauzerni ochish
                </button>
              </div>
            </div>

            {/* Useful links */}
            {resources.links && (
              <div className="bg-slate-800/40 border border-blue-500/20 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-white mb-3">Foydali Havolalar</h4>
                <div className="space-y-2">
                  {resources.links.map((link) => (
                    <a
                      key={link}
                      href={`https://www.google.com/search?q=${encodeURIComponent(link)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      → {link}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex-1 flex flex-col bg-gradient-to-br from-slate-900/30 to-blue-950/20 min-w-0 overflow-hidden"
    >
      {/* Header */}
      <div className="h-14 border-b border-blue-500/20 px-4 flex items-center justify-between bg-slate-900/50 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-slate-800 rounded-lg transition-all">
            <ChevronRight className="w-5 h-5 text-slate-400 rotate-180" />
          </button>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              Bugungi Darslar
            </h2>
        </div>
        <span className="text-xs text-slate-400">{todaySchedule.length} classes</span>
      </div>

      {/* Lessons list */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {todaySchedule.length > 0 ? (
            todaySchedule.map((lesson: Lesson, idx: number) => {
              const isCurrent = currentLesson?.subject === lesson.subject;
              return (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    isCurrent
                      ? 'bg-cyan-500/10 border-cyan-400/40 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-800/40 border-blue-500/20 hover:border-blue-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <h3 className="font-semibold text-white">{lesson.subject}</h3>
                      {isCurrent && (
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full font-medium animate-pulse">
                            HOZIR
                          </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{lesson.timeStart} - {lesson.timeEnd}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {lesson.teacher}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Room {lesson.room}
                    </span>
                  </div>
                </motion.button>
              );
            })
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Bugun darslar yo'q</p>
              <p className="text-sm text-slate-500 mt-1">Ertangi kun uchun jadvalni tekshiring</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
