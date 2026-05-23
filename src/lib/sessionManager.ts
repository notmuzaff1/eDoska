import { supabase } from './supabase';
import { SessionData } from '@/types';

const SESSION_KEY = 'edoska_session';

export const sessionManager = {
  createSession: async (): Promise<string> => {
    const sessionId = `SESSION_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    const { error } = await supabase.from('classroom_sessions').insert({
      session_id: sessionId,
      class_name: '10-A Class',
      subject: 'Calculus',
      topic: 'Derivatives and Applications',
      teacher_name: 'J. Martinez',
      is_authenticated: false,
    });

    if (error) {
      console.error('[Session] Failed to create session in Supabase:', error);
    } else {
      console.log('[Session] Created in Supabase:', sessionId);
    }

    const session: SessionData = {
      sessionId,
      isAuthenticated: false,
      className: '10-A Class',
      subject: 'Calculus',
      topic: 'Derivatives and Applications',
      teacherName: 'J. Martinez',
      grade: '10-A',
      currentTime: new Date(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    console.log('[Session] Saved to localStorage:', sessionId);
    return sessionId;
  },

  getSession: (): SessionData | null => {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },

  authenticateSession: async (): Promise<void> => {
    const session = sessionManager.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('classroom_sessions')
      .update({
        is_authenticated: true,
        authenticated_at: new Date().toISOString(),
      })
      .eq('session_id', session.sessionId);

    if (error) {
      console.error('Failed to authenticate session in Supabase:', error);
    }

    session.isAuthenticated = true;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  clearSession: (): void => {
    localStorage.removeItem(SESSION_KEY);
  },

  generateMockSession: (): SessionData => {
    return {
      sessionId: `SESSION_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      isAuthenticated: false,
      className: '10-A Class',
      subject: 'Calculus',
      topic: 'Derivatives and Applications',
      teacherName: 'J. Martinez',
      grade: '10-A',
      currentTime: new Date(),
    };
  },
};
