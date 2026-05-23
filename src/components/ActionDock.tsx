import { motion } from 'framer-motion';
import { Lock, PenTool, Globe, Zap, Users, Sparkles } from 'lucide-react';

interface ActionDockProps {
  onLockScreen: () => void;
  onWhiteboard: () => void;
  onBrowser: () => void;
  onAI: () => void;
  onStudentPicker: () => void;
  onAILesson?: () => void;
}

export const ActionDock: React.FC<ActionDockProps> = ({
  onLockScreen,
  onWhiteboard,
  onBrowser,
  onAI,
  onStudentPicker,
  onAILesson,
}) => {
  const actions = [
    { id: 'whiteboard', label: 'Doska', icon: PenTool, color: 'from-orange-500 to-red-500', action: onWhiteboard },
    { id: 'browser', label: 'Brauzer', icon: Globe, color: 'from-green-500 to-emerald-500', action: onBrowser },
    { id: 'ai', label: 'AI Yordam', icon: Zap, color: 'from-yellow-500 to-orange-500', action: onAI },
    ...(onAILesson ? [{ id: 'ailesson', label: 'AI Dars', icon: Sparkles, color: 'from-purple-500 to-pink-500', action: onAILesson }] : []),
    { id: 'students', label: "O'quvchi", icon: Users, color: 'from-violet-500 to-indigo-500', action: onStudentPicker },
    { id: 'lock', label: 'Qulf', icon: Lock, color: 'from-red-500 to-rose-500', action: onLockScreen },
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-40 h-16 md:h-20 border-t border-blue-500/20 bg-gradient-to-t from-slate-900/95 to-slate-900/80 backdrop-blur-xl flex items-center justify-center gap-1 md:gap-3 px-2 md:px-6 overflow-x-auto"
    >
      {actions.map((action, idx) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.action}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + idx * 0.05 }}
            className="group relative flex flex-col items-center gap-0.5 md:gap-1 px-2 md:px-4 py-1.5 md:py-2 hover:bg-slate-800/50 rounded-xl transition-all flex-shrink-0"
          >
            <div
              className={`w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br ${action.color} rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all`}
            >
              <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-[10px] md:text-xs font-semibold text-slate-300 text-center max-w-[60px] md:max-w-[70px] truncate">{action.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
};
