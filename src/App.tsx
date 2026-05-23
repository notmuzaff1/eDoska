import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lockscreen } from './components/Lockscreen';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { TelegramMiniApp } from './components/TelegramMiniApp';
import { sessionManager } from './lib/sessionManager';
import { realtimeManager } from './lib/realtimeManager';
import { supabase } from './lib/supabase';
import { SessionData } from './types';

function App() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appMode, setAppMode] = useState<'classroom' | 'teacher'>('classroom');
  const isAuthRef = useRef(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#/teacher' || hash.includes('tgWebApp')) {
      setAppMode('teacher');
    }
  }, []);

  useEffect(() => {
    if (appMode === 'teacher') return;

    // Clear any previous session so the app always starts at lockscreen
    localStorage.removeItem('edoska_session');
    localStorage.removeItem('edoska_auth');

    const initSession = async () => {
      // Diagnostic: check Supabase connectivity
      const { error: healthError } = await supabase.from('classroom_sessions').select('id', { count: 'exact', head: true }).limit(1);
      if (healthError) {
        console.warn('[Supabase] Connection or table issue:', healthError.message, healthError.code);
      } else {
        console.log('[Supabase] Connected — classroom_sessions table is accessible');
      }

      await sessionManager.createSession();
      const newSession = sessionManager.getSession();
      setSessionData(newSession);
      setIsLoading(false);
    };

    initSession();
  }, [appMode]);

  useEffect(() => {
    if (appMode === 'teacher' || !sessionData?.sessionId) return;

    const handleAuthentication = async () => {
      console.log('[Auth] Realtime/poll triggered authentication');
      await sessionManager.authenticateSession();
      const updatedSession = sessionManager.getSession();
      if (updatedSession?.isAuthenticated) {
        console.log('[Auth] Session updated, setting state:', updatedSession.isAuthenticated);
        setSessionData({ ...updatedSession });
        isAuthRef.current = true;
      }
    };

    // Subscribe via Supabase Realtime
    realtimeManager.subscribe(sessionData.sessionId, handleAuthentication);

    // Poll as reliable fallback (every 2s)
    const pollInterval = setInterval(async () => {
      if (isAuthRef.current) return;
      try {
        const { data, error } = await supabase
          .from('classroom_sessions')
          .select('is_authenticated')
          .eq('session_id', sessionData.sessionId)
          .single();
        console.log('[Auth] Poll result:', JSON.stringify(data), error?.message || 'ok');
        if (data?.is_authenticated) {
          console.log('[Auth] Authenticated via poll!');
          handleAuthentication();
        } else if (error && (error as any).code === 'PGRST116') {
          console.log('[Auth] Session row missing from Supabase, re-creating...');
          const { error: insertError } = await supabase
            .from('classroom_sessions')
            .upsert({
              session_id: sessionData.sessionId,
              class_name: sessionData.className || 'Class',
              subject: sessionData.subject || 'General',
              topic: sessionData.topic || '',
              teacher_name: sessionData.teacherName || '',
              is_authenticated: false,
            }, { onConflict: 'session_id' });
          if (insertError) {
            console.warn('[Auth] Cannot create session row - check Supabase setup:', insertError.message);
          }
        } else if (error) {
          console.warn('[Auth] Poll error:', error.message);
        }
      } catch (e) {
        console.error('[Auth] Poll error:', e);
      }
    }, 2000);

    return () => {
      realtimeManager.unsubscribe();
      clearInterval(pollInterval);
      isAuthRef.current = false;
    };
  }, [sessionData?.sessionId, appMode]);

  if (appMode === 'teacher') {
    return <TelegramMiniApp />;
  }

  if (isLoading || !sessionData) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const handleAuthenticate = () => {
    sessionManager.authenticateSession();
    const updatedSession = sessionManager.getSession();
    if (updatedSession) {
      setSessionData({ ...updatedSession });
    }
  };

  const handleLockScreen = () => {
    sessionManager.clearSession();
    realtimeManager.unsubscribe();
    setSessionData(null);
    setIsLoading(false);
    sessionManager.createSession().then(() => {
      const newSession = sessionManager.getSession();
      setSessionData(newSession);
    });
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!sessionData.isAuthenticated ? (
          <Lockscreen key="lockscreen" sessionData={sessionData} />
        ) : (
          <Dashboard key="dashboard" sessionData={sessionData} onLockScreen={handleLockScreen} />
        )}
      </AnimatePresence>
      <AdminPanel
        sessionId={sessionData.sessionId}
        onAuthenticate={handleAuthenticate}
        isAuthenticated={sessionData.isAuthenticated}
      />
    </>
  );
}

export default App;
