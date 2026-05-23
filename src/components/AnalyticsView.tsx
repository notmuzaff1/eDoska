import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, TrendingUp, Clock, BookOpen, Users, Trophy, Target, Activity, BarChart3 } from 'lucide-react';
import { Lesson } from '@/types';
import { scheduleManager } from '@/lib/scheduleManager';
import students from '@/data/students.json';

interface AnalyticsViewProps {
  currentLesson?: Lesson | null;
  onBack: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ currentLesson, onBack }) => {
  const [stats, setStats] = useState({
    totalLessonsToday: 0,
    completedLessons: 0,
    attendanceRate: 0,
    avgEngagement: 0,
    totalStudents: students.length,
    studentsParticipated: 0,
  });

  useEffect(() => {
    const todayLessons = scheduleManager.getTodaySchedule();
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const completed = todayLessons.filter((l: Lesson) => l.timeEnd <= currentTime).length;
    setStats({
      totalLessonsToday: todayLessons.length,
      completedLessons: completed,
      attendanceRate: 87 + Math.floor(Math.random() * 10),
      avgEngagement: 72 + Math.floor(Math.random() * 15),
      totalStudents: students.length,
      studentsParticipated: Math.floor(students.length * (0.6 + Math.random() * 0.3)),
    });
  }, []);

  const subjectStats = scheduleManager.getAllSubjects().map((subject: string) => {
    const lessons = scheduleManager.getLessonsBySubject(subject);
    return {
      name: subject,
      count: lessons.length,
      teachers: [...new Set(lessons.map((l: Lesson) => l.teacher))],
    };
  });

  const teacherStats = scheduleManager.getAllTeachers().map((teacher: string) => {
    const lessons = scheduleManager.getLessonsByTeacher(teacher);
    return {
      name: teacher,
      count: lessons.length,
      subjects: [...new Set(lessons.map((l: Lesson) => l.subject))],
    };
  });

  const statCards = [
    { label: "Bugungi Darslar", value: stats.totalLessonsToday, icon: BookOpen, color: 'from-cyan-500 to-blue-600' },
    { label: 'Tugallangan', value: stats.completedLessons, icon: Clock, color: 'from-emerald-500 to-green-600' },
    { label: 'Davomat', value: `${stats.attendanceRate}%`, icon: Users, color: 'from-purple-500 to-violet-600' },
    { label: 'Ishtirok', value: `${stats.avgEngagement}%`, icon: Activity, color: 'from-orange-500 to-red-600' },
    { label: "Jami O'quvchilar", value: stats.totalStudents, icon: Target, color: 'from-pink-500 to-rose-600' },
    { label: 'Qatnashgan', value: stats.studentsParticipated, icon: Trophy, color: 'from-yellow-500 to-orange-600' },
  ];

  const weeklyData = [
    { day: 'Du', lessons: 5, attendance: 92 },
    { day: 'Se', lessons: 5, attendance: 88 },
    { day: 'Cho', lessons: 5, attendance: 95 },
    { day: 'Pay', lessons: 5, attendance: 85 },
    { day: 'Ju', lessons: 5, attendance: 90 },
    { day: 'Sha', lessons: 5, attendance: 78 },
  ];

  const todayIdx = new Date().getDay();
  const todayName = todayIdx === 0 ? 'Sha' : ['Du', 'Se', 'Cho', 'Pay', 'Ju', 'Sha'][todayIdx - 1];

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
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Tahlil Paneli
            </h2>
        </div>
        {currentLesson && (
          <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-full">
            {currentLesson.subject}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-slate-800/40 border border-blue-500/20 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-slate-400">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Weekly attendance chart */}
          <div className="bg-slate-800/40 border border-blue-500/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Haftalik Davomat
            </h3>
            <div className="flex items-end gap-2 h-32">
              {weeklyData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-slate-400">{d.attendance}%</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${d.attendance * 0.8}px` }}
                    transition={{ duration: 0.5 }}
                    className={`w-full rounded-t-lg ${
                      d.day === todayName
                        ? 'bg-gradient-to-t from-cyan-500 to-cyan-400'
                        : 'bg-gradient-to-t from-slate-600 to-slate-500'
                    }`}
                  />
                  <span className={`text-xs ${d.day === todayName ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subject breakdown */}
          <div className="bg-slate-800/40 border border-blue-500/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-4">Fanlar Tahlili</h3>
            <div className="space-y-2">
              {subjectStats.map((s: { name: string; count: number; teachers: string[] }) => (
                <div key={s.name} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-sm text-white">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{s.count} dars/hafta</span>
                    <span className="text-xs text-slate-500">{s.teachers.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher stats */}
          <div className="bg-slate-800/40 border border-blue-500/20 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-4">O'qituvchilar</h3>
            <div className="space-y-2">
              {teacherStats.map((t: { name: string; count: number; subjects: string[] }) => (
                <div key={t.name} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <span className="text-sm text-white">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{t.count} dars</span>
                    <span className="text-xs text-slate-500">{t.subjects.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
