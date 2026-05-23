import { useEffect, useRef, useState } from 'react';

const PIN = '07100710';

interface LockdownProps {
  onUnlock: () => void;
}

export const Lockdown: React.FC<LockdownProps> = ({ onUnlock }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const unlockedRef = useRef(false);

  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }

    const onkey = (e: KeyboardEvent) => {
      if (unlockedRef.current) return;
      e.preventDefault();
      e.stopPropagation();
    };

    const onkeydown = (e: KeyboardEvent) => {
      if (unlockedRef.current) return;
      if (
        ['Escape', 'F11', 'F12'].includes(e.key) ||
        e.altKey || e.ctrlKey || e.metaKey
      ) {
        e.preventDefault();
        e.stopPropagation();
        if (e.key === 'Escape' && el.requestFullscreen) {
          el.requestFullscreen().catch(() => {});
        }
      }
    };

    const oncontext = (e: MouseEvent) => {
      if (!unlockedRef.current) e.preventDefault();
    };

    const onfschange = () => {
      if (!document.fullscreenElement && !unlockedRef.current) {
        el.requestFullscreen().catch(() => {});
      }
    };

    const onvisibility = () => {
      if (document.hidden && !unlockedRef.current) {
        setTimeout(() => {
          if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        }, 100);
      }
    };

    document.addEventListener('keydown', onkeydown, true);
    document.addEventListener('keyup', onkey, true);
    document.addEventListener('keypress', onkey, true);
    document.addEventListener('contextmenu', oncontext);
    document.addEventListener('fullscreenchange', onfschange);
    document.addEventListener('visibilitychange', onvisibility);

    const focusTimer = setTimeout(() => inputRef.current?.focus(), 200);

    return () => {
      document.removeEventListener('keydown', onkeydown, true);
      document.removeEventListener('keyup', onkey, true);
      document.removeEventListener('keypress', onkey, true);
      document.removeEventListener('contextmenu', oncontext);
      document.removeEventListener('fullscreenchange', onfschange);
      document.removeEventListener('visibilitychange', onvisibility);
      clearTimeout(focusTimer);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 8);
    setValue(v);
    setError(false);
  };

  const handleSubmit = () => {
    if (value === PIN) {
      unlockedRef.current = true;
      setValue('');
      setError(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      onUnlock();
    } else {
      setError(true);
      setValue('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center select-none">
      <div className="flex flex-col items-center gap-6 px-8">
        <svg
          className="w-20 h-20 text-yellow-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="1.5" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1.5" fill="currentColor" />
        </svg>

        <h1 className="text-3xl font-bold text-white tracking-wide">Dosk qulflangan</h1>
        <p className="text-gray-400 text-sm">PIN-kodni kiriting</p>

        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={handleChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="w-64 px-4 py-3 rounded-xl bg-white/10 text-white text-xl text-center
            tracking-[0.5em] placeholder:text-gray-600 outline-none border-2
            focus:border-yellow-400 transition-colors"
          placeholder="********"
        />

        {error && <p className="text-red-400 text-sm">Notoʻgʻri PIN</p>}

        <button
          onClick={handleSubmit}
          disabled={value.length < 8}
          className="px-10 py-3 rounded-xl bg-yellow-500 text-black font-bold text-lg
            hover:bg-yellow-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Ochish
        </button>
      </div>
    </div>
  );
};
