import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, User, BookOpen, ChevronRight } from 'lucide-react';
import { Lesson } from '@/types';
import { scheduleManager } from '@/lib/scheduleManager';

interface ScheduleViewProps {
  currentLesson?: Lesson | null;
  onBack: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ currentLesson, onBack }) => {
  const days = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  const dayNames = ['Du', 'Se', 'Cho', 'Pay', 'Ju', 'Sha'];
  const dayEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = (() => {
    const d = new Date().getDay();
    return d === 0 ? 5 : d - 1;
  })();
  const [selectedDay, setSelectedDay] = useState(todayIndex);

  const scheduleByDay = dayEn.map((day) => scheduleManager.getLessonsByDay(day));

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
          <h2 className="text-lg font-bold text-white">Dars Jadvali</h2>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-400">
            {currentLesson ? `Hozir: ${currentLesson.subject}` : 'Faol dars yo\'q'}
          </span>
        </div>
      </div>

      {/* Day tabs */}
      <div className="flex gap-1 px-4 py-3 border-b border-blue-500/10 overflow-x-auto flex-shrink-0">
        {days.map((day, idx) => (
          <button
            key={day}
            onClick={() => setSelectedDay(idx)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedDay === idx
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {dayNames[idx]}
          </button>
        ))}
      </div>

      {/* Schedule list */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {scheduleByDay[selectedDay].length > 0 ? (
            scheduleByDay[selectedDay].map((lesson, idx) => {
              const isCurrent = currentLesson?.subject === lesson.subject && selectedDay === todayIndex;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`rounded-xl border p-4 transition-all ${
                    isCurrent
                      ? 'bg-cyan-500/10 border-cyan-400/40 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-800/40 border-blue-500/20 hover:border-blue-500/40'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-center flex-shrink-0 w-16">
                      <p className="text-lg font-bold text-white">{lesson.timeStart}</p>
                      <p className="text-xs text-slate-500">{lesson.timeEnd}</p>
                    </div>
                    <div className="w-px h-12 bg-blue-500/20" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <h3 className="font-semibold text-white">{lesson.subject}</h3>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full font-medium">
                            HOZIR
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {lesson.teacher}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {lesson.room}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {lesson.className}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Darslar yo'q</p>
              <p className="text-sm text-slate-500 mt-1">Bo'sh vaqtingizdan zavqlaning!</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
