import { motion } from 'framer-motion';
import { Play, Download, FileText, FileCode, Link2, Send, Wifi, Gauge, Video, ExternalLink } from 'lucide-react';
import { Lesson } from '@/types';
import { scheduleManager } from '@/lib/scheduleManager';

interface Material {
  id: string;
  name: string;
  type: string;
  url: string;
  subject: string;
}

interface RightPanelProps {
  timeRemaining: number;
  currentLesson?: Lesson | null;
  materials?: Material[];
  onOpenBrowser?: () => void;
  onOpenWhiteboard?: () => void;
  onLockScreen?: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ timeRemaining, currentLesson, materials = [], onOpenBrowser, onOpenWhiteboard, onLockScreen }) => {
  const progressPercent = Math.min(100, Math.max(0, Math.round((timeRemaining / (45 * 60)) * 100)));

  const videoUrl = currentLesson
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(currentLesson.subject + ' lesson')}`
    : 'https://www.youtube.com/results?search_query=calculus+lesson';

  const pdfMaterials = materials.filter((m) => m.type === 'pdf');
  const videoMaterials = materials.filter((m) => m.type === 'video');
  const linkMaterials = materials.filter((m) => m.type === 'link');

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-80 bg-gradient-to-b from-slate-900/50 to-slate-950/50 backdrop-blur-xl border-l border-blue-500/20 flex flex-col overflow-y-auto flex-shrink-0"
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-blue-500/20">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex items-center justify-between"
        >
          <p className="text-xs text-slate-400 uppercase tracking-widest">QO'SHIMCHA MANBALAR</p>
          <div className="flex gap-2">
            <Wifi className="w-4 h-4 text-cyan-400" />
            <Gauge className="w-4 h-4 text-slate-400" />
          </div>
        </motion.div>
      </div>

      {/* Video section */}
      <div className="px-6 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-blue-950/40 to-slate-900/40 backdrop-blur-md border border-blue-500/30 rounded-2xl overflow-hidden"
        >
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative h-40 bg-slate-800 flex items-center justify-center group block"
          >
            <img
              src="https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Lesson video"
              className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-all"
            />
            <motion.div
              whileHover={{ scale: 1.15 }}
              className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50 group-hover:shadow-cyan-500/70 transition-all"
            >
              <Play className="w-8 h-8 text-white fill-white" />
            </motion.div>
          </a>
          <div className="p-4">
            <p className="text-sm font-semibold text-white mb-1">DARS VIDEOSI</p>
            <p className="text-xs text-slate-400 mb-3">
              {currentLesson ? `${currentLesson.subject} - O'quv videosi` : 'Introduction to derivatives explained'}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.5 2C3.12 2 2 3.12 2 4.5v11C2 16.88 3.12 18 4.5 18h11c1.38 0 2.5-1.12 2.5-2.5v-11C18 3.12 16.88 2 15.5 2h-11zM5 4h10v10H5V4z" />
              </svg>
              YouTube'da ko'rish
            </div>
          </div>
        </motion.div>
      </div>

      {/* Timer section */}
      <div className="px-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-gradient-to-br from-blue-950/40 to-slate-900/40 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 text-center"
        >
          {scheduleManager.isSchoolOver() ? (
            <>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">DARS TAYMERI</p>
              <div className="py-6">
                <svg className="w-16 h-16 text-green-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-bold text-white">Darslar tugadi</p>
                <p className="text-xs text-slate-400 mt-1">Bugungi barcha darslar yakunlandi</p>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">DARS TAYMERI</p>
              <div className="relative w-40 h-40 mx-auto mb-4">
                <svg className="absolute inset-0 w-40 h-40" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#1e293b" strokeWidth="8" />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeDasharray="439.8"
                    initial={{ strokeDashoffset: 439.8 }}
                    animate={{ strokeDashoffset: 439.8 - (439.8 * progressPercent) / 100 }}
                    transition={{ duration: 0.5 }}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl font-bold text-white"
                  >
                    {Math.floor(timeRemaining / 60)}
                  </motion.div>
                  <p className="text-xs text-slate-400">Qolgan vaqt</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <span>Dars tugashiga</span>
                <span className="text-cyan-400">{progressPercent}%</span>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Materials from Telegram bot */}
      {materials.length > 0 && (
        <div className="px-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-blue-950/40 to-slate-900/40 backdrop-blur-md border border-blue-500/30 rounded-2xl p-4"
          >
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">O'QITUVCHI MATERIALLARI</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {pdfMaterials.map((m) => (
                <a
                  key={m.id}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 hover:bg-slate-800/50 rounded-lg transition-all group"
                >
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{m.name}</p>
                    <p className="text-[10px] text-slate-500">{m.subject}</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-all" />
                </a>
              ))}
              {videoMaterials.map((m) => (
                <a
                  key={m.id}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 hover:bg-slate-800/50 rounded-lg transition-all group"
                >
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Video className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{m.name}</p>
                    <p className="text-[10px] text-slate-500">{m.subject}</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-all" />
                </a>
              ))}
              {linkMaterials.map((m) => (
                <a
                  key={m.id}
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 hover:bg-slate-800/50 rounded-lg transition-all group"
                >
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Link2 className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{m.name}</p>
                    <p className="text-[10px] text-slate-500">{m.subject}</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-all" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Bot section */}
      <div className="px-6 flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-gradient-to-br from-blue-950/40 to-slate-900/40 backdrop-blur-md border border-blue-500/30 rounded-2xl p-4 flex flex-col flex-1"
        >
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">O'qituvchi paneli</p>
          <div className="flex-1 flex items-center justify-center">
            <Send className="w-8 h-8 text-cyan-400/50" />
          </div>
          <motion.a
            whileHover={{ scale: 1.05 }}
            href="https://t.me/edoskateacher_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Telegram Bot
          </motion.a>
        </motion.div>
      </div>

      {/* Bottom menu */}
      <div className="px-6 pb-6 border-t border-blue-500/20 pt-4 mt-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-between text-xs text-slate-400"
        >
          <button onClick={onLockScreen} className="hover:text-cyan-400 transition-all">Qulf</button>
          <button onClick={onOpenWhiteboard} className="hover:text-cyan-400 transition-all">Yozish</button>
          <button onClick={onOpenBrowser} className="hover:text-cyan-400 transition-all">Brauzer</button>
          <button className="hover:text-cyan-400 transition-all">Bosh sahifa</button>
        </motion.div>
      </div>
    </motion.div>
  );
};
