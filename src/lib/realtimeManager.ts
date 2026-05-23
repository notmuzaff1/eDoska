import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

let channelInstance: RealtimeChannel | null = null;

export const realtimeManager = {
  subscribe: (sessionId: string, onAuthenticated: () => void): RealtimeChannel => {
    if (channelInstance) {
      supabase.removeChannel(channelInstance);
    }

    channelInstance = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'classroom_sessions',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.new?.is_authenticated) {
            onAuthenticated();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Realtime subscription failed:', status);
        }
      });

    return channelInstance;
  },

  unsubscribe: (): void => {
    if (channelInstance) {
      supabase.removeChannel(channelInstance);
      channelInstance = null;
    }
  },

  getChannel: (): RealtimeChannel | null => {
    return channelInstance;
  },
};
