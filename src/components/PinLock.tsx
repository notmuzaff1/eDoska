import { useState, useEffect, useRef } from 'react';

const PIN = '07100710';

interface PinLockProps {
  isLocked: boolean;
  onUnlock: () => void;
}

export const PinLock: React.FC<PinLockProps> = ({ isLocked, onUnlock }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLocked) return;

    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});

    const onkey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        return;
      }
      if (
        e.altKey || e.ctrlKey || e.metaKey ||
        e.key === 'F11' || e.key === 'F12'
      ) {
        e.preventDefault();
      }
    };
    const oncontext = (e: MouseEvent) => e.preventDefault();
    const onfschange = () => {
      if (!document.fullscreenElement) {
        el.requestFullscreen().catch(() => {});
      }
    };

    document.addEventListener('keydown', onkey, true);
    document.addEventListener('contextmenu', oncontext);
    document.addEventListener('fullscreenchange', onfschange);
    setTimeout(() => ref.current?.focus(), 100);

    return () => {
      document.removeEventListener('keydown', onkey, true);
      document.removeEventListener('contextmenu', oncontext);
      document.removeEventListener('fullscreenchange', onfschange);
    };
  }, [isLocked]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 8);
    setValue(v);
    setError(false);
  };

  const handleSubmit = () => {
    if (value === PIN) {
      setValue('');
      setError(false);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      onUnlock();
    } else {
      setError(true);
      setValue('');
      ref.current?.focus();
    }
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center select-none">
      <div className="flex flex-col items-center gap-6 px-8">
        <svg className="w-16 h-16 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth="1.5" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>

        <h1 className="text-3xl font-bold text-white tracking-wide">Dosk qulflangan</h1>
        <p className="text-gray-400 text-sm">PIN-kodni kiriting</p>

        <input
          ref={ref}
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
