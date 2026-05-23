import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Zap, Bug } from 'lucide-react';
import { useState } from 'react';

interface AdminPanelProps {
  sessionId: string;
  onAuthenticate: () => void;
  isAuthenticated: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  sessionId,
  onAuthenticate,
  isAuthenticated,
}) => {
  const [testResult, setTestResult] = useState('');

  const testUpsertFlow = async () => {
    setTestResult('Testing...');
    console.log('[AdminTest] Starting upsert test for session:', sessionId);
    try {
      const { data, error } = await supabase
        .from('classroom_sessions')
        .upsert({
          session_id: sessionId,
          is_authenticated: true,
          authenticated_at: new Date().toISOString(),
        }, { onConflict: 'session_id', ignoreDuplicates: false })
        .select();
      console.log('[AdminTest] Upsert result:', JSON.stringify(data), error?.message);
      if (error) {
        setTestResult('Supabase error: ' + error.message);
      } else if (data && data.length > 0) {
        setTestResult('Upsert OK! is_authenticated=' + data[0].is_authenticated);
      } else {
        setTestResult('Upsert done, no data returned');
      }
    } catch (e: any) {
      console.error('[AdminTest] Error:', e);
      setTestResult('Error: ' + (e.message || e));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-yellow-500/50 rounded-xl p-4 max-w-xs shadow-2xl">
        <p className="text-xs text-yellow-400 mb-2 font-semibold">Development Only</p>
        <div className="text-xs text-slate-300 mb-3 break-all">
          <span className="text-slate-500">Session: </span>
          <span className="font-mono">{sessionId}</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAuthenticate}
          disabled={isAuthenticated}
          className="w-full py-2 px-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          {isAuthenticated ? 'Authenticated' : 'Simulate Auth'}
        </motion.button>
        {testResult && (
          <p className="text-xs text-slate-400 mt-2 break-all">{testResult}</p>
        )}
        {!isAuthenticated && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={testUpsertFlow}
            className="w-full mt-2 py-1.5 px-3 bg-slate-700/50 border border-blue-500/30 text-blue-400 rounded-lg text-xs hover:bg-slate-700 transition-all flex items-center justify-center gap-1"
          >
            <Bug className="w-3 h-3" />
            Test Upsert (like Telegram)
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
