import { motion, AnimatePresence } from 'framer-motion';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastProps {
  message: string;
  isVisible: boolean;
  type?: 'success' | 'error' | 'info';
  action?: ToastAction;
  onClose?: () => void;
  duration?: number;
}

export const Toast = ({ message, isVisible, type = 'success', action, onClose, duration }: ToastProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl min-w-[280px] max-w-md"
          style={{
            background: type === 'success'
              ? 'linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))'
              : type === 'error'
              ? 'linear-gradient(135deg, rgba(239,68,68,0.95), rgba(220,38,38,0.95))'
              : 'linear-gradient(135deg, rgba(6,182,212,0.95), rgba(37,99,235,0.95))',
            borderColor: type === 'success'
              ? 'rgba(16,185,129,0.5)'
              : type === 'error'
              ? 'rgba(239,68,68,0.5)'
              : 'rgba(6,182,212,0.5)',
          }}
        >
          <div className="flex-1 text-white text-sm font-medium">{message}</div>
          {action && (
            <button
              onClick={() => { action.onClick(); onClose?.(); }}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition-all whitespace-nowrap"
            >
              {action.label}
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-all">
              <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
