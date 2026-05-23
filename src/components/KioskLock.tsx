import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TEACHER_IDS = ['ID001', 'ID002', 'ID003', 'ID004'];

interface KioskLockProps {
  isLocked: boolean;
  onUnlock: () => void;
}

export const KioskLock: React.FC<KioskLockProps> = ({ isLocked, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [tabWarn, setTabWarn] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lockedRef = useRef(isLocked);
  lockedRef.current = isLocked;

  const requestFullscreen = useCallback(() => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      }
    } catch {}
  }, []);

  const exitFullscreen = useCallback(() => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!isLocked) return;

    requestFullscreen();

    const handleFSChange = () => {
      if (!document.fullscreenElement && lockedRef.current) {
        requestFullscreen();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lockedRef.current) return;
      const isF11 = e.key === 'F11';
      const isEscape = e.key === 'Escape';
      const isAltF4 = e.altKey && e.key === 'F4' && e.key.toLowerCase() === 'f4';
      const isCtrlW = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w';
      const isCtrlT = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't';
      const isCtrlN = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n';
      const isCtrlShiftI = e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i';
      const isCtrlShiftJ = e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'j';
      const isCtrlShiftC = e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c';
      const isF12 = e.key === 'F12';
      const isCtrlR = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r';
      const isCtrlShiftR = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r';

      if (
        isF11 || isEscape || isAltF4 || isCtrlW || isCtrlT || isCtrlN ||
        isCtrlShiftI || isCtrlShiftJ || isCtrlShiftC || isF12 ||
        isCtrlR || isCtrlShiftR
      ) {
        e.preventDefault();
        e.stopPropagation();
        if (isEscape) requestFullscreen();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (lockedRef.current) e.preventDefault();
    };

    const handleVisibilityChange = () => {
      if (document.hidden && lockedRef.current) {
        setTabWarn(true);
        setTimeout(() => setTabWarn(false), 3000);
      }
    };

    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLocked, requestFullscreen]);

  const handleSubmit = () => {
    const normalized = pin.trim().toUpperCase();
    if (TEACHER_IDS.includes(normalized)) {
      setError('');
      setPin('');
      exitFullscreen();
      onUnlock();
    } else {
      setError('Notoʻgʻri PIN. Qaytadan urinib koʻring.');
      setPin('');
      inputRef.current?.focus();
    }
  };

  const fillPin = (val: string) => {
    if (pin.length < 5) {
      const next = pin + val;
      setPin(next);
      setError('');
      if (next.length === 5) {
        setTimeout(() => {
          const normalized = next.trim().toUpperCase();
          if (TEACHER_IDS.includes(normalized)) {
            setError('');
            setPin('');
            exitFullscreen();
            onUnlock();
          } else {
            setError('Notoʻgʻri PIN. Qaytadan urinib koʻring.');
            setPin('');
          }
        }, 200);
      }
    }
  };

  if (!isLocked) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center select-none"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex flex-col items-center gap-6 px-8"
        >
          <motion.svg
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 text-yellow-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="1.5" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
          </motion.svg>

          <h1 className="text-3xl font-bold text-white tracking-wide">
            Dosk qulflangan
          </h1>
          <p className="text-gray-400 text-sm text-center max-w-xs">
            Oʻqituvchi PIN-kodingizni kiriting
          </p>

          <div className="flex gap-3 items-center justify-center mt-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-colors ${
                  pin.length > i
                    ? 'bg-yellow-400 border-yellow-400'
                    : 'border-gray-600 bg-transparent'
                }`}
              />
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-red-400 text-sm"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-3 gap-3 mt-4 w-64">
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => {
              if (k === '') return <div key={i} />;
              return (
                <motion.button
                  key={k}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (k === '⌫') {
                      setPin((p) => p.slice(0, -1));
                      setError('');
                    } else {
                      fillPin(k);
                    }
                  }}
                  className="h-14 rounded-xl bg-white/10 text-white text-xl font-semibold
                    hover:bg-white/20 active:bg-white/30 transition-colors
                    disabled:opacity-30"
                >
                  {k}
                </motion.button>
              );
            })}
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={pin.length !== 5}
            className="mt-2 px-10 py-3 rounded-xl bg-yellow-500 text-black font-bold text-lg
              hover:bg-yellow-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Ochish
          </motion.button>
        </motion.div>

        {tabWarn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl
              bg-red-600/90 text-white text-sm font-medium"
          >
            Dosk bloklangan! Brauzer yorligʻini oʻzgartirmang.
          </motion.div>
        )}

        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          value={pin}
          onChange={(e) => {
            const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5);
            setPin(val);
            setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          className="absolute opacity-0 pointer-events-none"
          aria-hidden
        />
      </motion.div>
    </AnimatePresence>
  );
};
