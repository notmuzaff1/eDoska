import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Palette, Monitor, Smartphone } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { theme, toggleTheme, isTelegram } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-blue-500/20 bg-surface p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Sozlamalar</h2>
                  <p className="text-xs text-text-muted">Tashqi ko'rinish va til</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-secondary transition-colors"
              >
                <X className="h-5 w-5 text-text-muted" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Theme toggle */}
              <div className="rounded-xl border border-border/50 bg-surface-secondary p-4">
                <p className="text-sm font-semibold text-text-primary mb-4">
                  {isTelegram ? 'Telegram mavzusi' : 'Mavzu'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`flex flex-1 flex-col items-center gap-2 rounded-xl p-4 transition-all ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg ring-2 ring-cyan-400/50'
                        : 'bg-surface-tertiary text-text-muted hover:bg-surface-tertiary/70'
                    }`}
                  >
                    <Moon className={`h-6 w-6 ${theme === 'dark' ? 'text-white' : ''}`} />
                    <span className="text-xs font-medium">Qorong'i</span>
                  </button>
                  <button
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className={`flex flex-1 flex-col items-center gap-2 rounded-xl p-4 transition-all ${
                      theme === 'light'
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg ring-2 ring-amber-400/50'
                        : 'bg-surface-tertiary text-text-muted hover:bg-surface-tertiary/70'
                    }`}
                  >
                    <Sun className={`h-6 w-6 ${theme === 'light' ? 'text-white' : ''}`} />
                    <span className="text-xs font-medium">Yorug'</span>
                  </button>
                </div>
                {isTelegram && (
                  <p className="mt-3 text-xs text-text-muted text-center">
                    Telegram mavzusi avtomatik sinxronlanadi
                  </p>
                )}
              </div>

              {/* Info */}
              <div className="rounded-xl border border-border/50 bg-surface-secondary p-4">
                <div className="flex items-start gap-3">
                  <Monitor className="h-5 w-5 text-text-muted flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-text-primary mb-1">Yuqori kontrast</p>
                    <p className="text-xs text-text-muted leading-relaxed">
                      Ikkala mavzu ham sinf doskasida uzoq masofadan o'qish uchun 
                      maksimal kontrast bilan sozlangan. Yorug' mavzu oq fon va qora matndan 
                      foydalanadi, qorong'i mavzu esa ko'zni charchatmaydigan chuqur 
                      ranglardan iborat.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/50 bg-surface-secondary p-4">
                <p className="text-xs text-text-muted leading-relaxed text-center">
                  Mavzu sozlamalari brauzeringizda saqlanadi va keyingi tashriflaringizda eslab qolinadi.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
