import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, BookOpen, Users, BarChart3, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { SessionData, Lesson } from '@/types';
import { scheduleManager } from '@/lib/scheduleManager';

interface SidebarProps {
  sessionData: SessionData;
  currentLesson?: Lesson | null;
  onNavigate?: (section: string) => void;
  onOpenSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sessionData, currentLesson, onNavigate, onOpenSettings }) => {
  const [activeNav, setActiveNav] = useState('home');
  const [scheduleExpanded, setScheduleExpanded] = useState(true);

  const duration = currentLesson ? (() => {
    const [startH, startM] = currentLesson.timeStart.split(':').map(Number);
    const [endH, endM] = currentLesson.timeEnd.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  })() : 45;

  const remaining = currentLesson ? (() => {
    const now = new Date();
    const [endH, endM] = currentLesson.timeEnd.split(':').map(Number);
    const endTime = new Date();
    endTime.setHours(endH, endM, 0, 0);
    return Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 60000));
  })() : 45;

  const progress = Math.min(100, Math.max(0, Math.round(((duration - remaining) / duration) * 100)));

  const navItems = [
    { id: 'home', icon: Home, label: 'Bosh sahifa', color: 'from-blue-500 to-cyan-500' },
    { id: 'schedule', icon: Calendar, label: 'Jadval', color: 'from-emerald-500 to-green-500' },
    { id: 'lessons', icon: BookOpen, label: 'Darslar', color: 'from-purple-500 to-violet-500' },
    { id: 'students', icon: Users, label: "O'quvchilar", color: 'from-orange-500 to-red-500' },
    { id: 'analytics', icon: BarChart3, label: 'Tahlil', color: 'from-pink-500 to-rose-500' },
  ];

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    onNavigate?.(id);
  };

  const todaySchedule = scheduleManager.getTodaySchedule();

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="w-80 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-xl border-r border-blue-500/20 flex flex-col overflow-y-auto flex-shrink-0"
    >
      {/* Navigation Icons */}
      <div className="p-6 flex flex-col gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05, x: 4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? `bg-gradient-to-r ${item.color} shadow-lg`
                  : 'hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Class Info */}
      <div className="px-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-950/40 to-slate-900/40 backdrop-blur-md border border-blue-500/30 rounded-2xl p-4"
        >
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">SINF MA'LUMOTI</p>
          <h2 className="text-2xl font-bold text-white mb-1">{sessionData.grade}</h2>
          <p className="text-sm text-slate-400 mb-4">
            {currentLesson ? currentLesson.subject : sessionData.subject}
          </p>
          <p className="text-xs text-slate-500">Fan</p>
        </motion.div>
      </div>

      {/* Teacher Info */}
      <div className="px-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-950/40 to-slate-900/40 backdrop-blur-md border border-blue-500/30 rounded-2xl p-4"
        >
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">O'QITUVCHI</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">
                {currentLesson ? currentLesson.teacher : sessionData.teacherName}
              </p>
              <p className="text-xs text-slate-400">
                {currentLesson ? currentLesson.subject : sessionData.subject} o'qituvchisi
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Lesson Info */}
      <div className="px-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-blue-950/40 to-slate-900/40 backdrop-blur-md border border-blue-500/30 rounded-2xl p-4"
        >
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">BUGUNGI MAVZU</p>
          <p className="text-sm font-semibold text-white mb-4">
            {currentLesson ? `${currentLesson.subject} - Xona: ${currentLesson.room}` : sessionData.topic}
          </p>
          <p className="text-xs text-slate-500">
            {currentLesson ? `${currentLesson.timeStart} - ${currentLesson.timeEnd}` : "Mavzu daftardan"}
          </p>
        </motion.div>
      </div>

      {/* Progress */}
      <div className="px-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-blue-950/40 to-slate-900/40 backdrop-blur-md border border-blue-500/30 rounded-2xl p-4"
        >
          {scheduleManager.isSchoolOver() ? (
            <>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">DARS JARAYONI</p>
              <div className="py-4 text-center">
                <svg className="w-12 h-12 text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold text-white">Darslar tugadi</p>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">DARS JARAYONI</p>
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-white">Dars: {progress}% tugallandi</p>
                <p className="text-xs text-cyan-400">{progress}%</p>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-600"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {currentLesson ? `${currentLesson.timeStart} - ${currentLesson.timeEnd}` : ''}
              </p>
            </>
          )}
        </motion.div>
      </div>

      {/* Schedule */}
      <div className="px-6 pb-4 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-gradient-to-br from-blue-950/40 to-slate-900/40 backdrop-blur-md border border-blue-500/30 rounded-2xl p-4"
        >
          <button
            onClick={() => setScheduleExpanded(!scheduleExpanded)}
            className="w-full flex items-center justify-between mb-3"
          >
            <p className="text-xs text-slate-400 uppercase tracking-widest">DARS JADVALI</p>
            {scheduleExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          {scheduleExpanded && (
            <div className="space-y-2 text-sm">
              {todaySchedule.length > 0 ? (
                todaySchedule.map((lesson: Lesson, idx: number) => (
                  <div
                    key={idx}
                    className={`flex justify-between p-2 rounded-lg transition-all ${
                      currentLesson?.subject === lesson.subject
                        ? 'bg-cyan-500/20 border border-cyan-400/30'
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <span className="text-slate-400">{lesson.timeStart}</span>
                    <div className="text-right">
                      <span className="text-white font-medium block">{lesson.subject}</span>
                      <span className="text-xs text-slate-500">{lesson.className}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">Bugun darslar yo'q</p>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Settings */}
      <div className="px-6 pb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSettings}
          className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-all mx-auto"
        >
          <Settings className="w-6 h-6 text-slate-400" />
        </motion.button>
      </div>
    </motion.div>
  );
};
