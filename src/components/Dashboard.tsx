import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SessionData } from '@/types';
import { scheduleManager } from '@/lib/scheduleManager';
import { supabase } from '@/lib/supabase';
import { Sidebar } from './Sidebar';
import { PdfReader } from './PdfReader';
import { RightPanel } from './RightPanel';
import { ActionDock } from './ActionDock';
import { StudentPicker } from './StudentPicker';
import { Whiteboard } from './Whiteboard';
import { BrowserMode } from './BrowserMode';
import { AIAssistant } from './AIAssistant';
import { AILessonGenerator } from './AILessonGenerator';
import { ScheduleView } from './ScheduleView';
import { AnalyticsView } from './AnalyticsView';
import { LessonsView } from './LessonsView';
import { SettingsModal } from './SettingsModal';
import { Toast } from './Toast';


type MainView = 'pdf' | 'schedule' | 'lessons' | 'analytics';

interface Material {
  id: string;
  name: string;
  type: string;
  url: string;
  subject: string;
}

interface DashboardProps {
  sessionData: SessionData;
  onLockScreen: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ sessionData, onLockScreen }) => {
  const [mainView, setMainView] = useState<MainView>('pdf');
  const [lessonTimeRemaining, setLessonTimeRemaining] = useState(45 * 60);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);

  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showAILesson, setShowAILesson] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Material notification toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastNewMaterial, setToastNewMaterial] = useState<Material | null>(null);
  const prevMaterialsCountRef = useRef(0);
  const prevMaterialsKeyRef = useRef('');

  const currentLesson = scheduleManager.getCurrentLesson();
  const schoolOver = scheduleManager.isSchoolOver();

  useEffect(() => {
    if (!currentLesson || schoolOver) {
      setLessonTimeRemaining(0);
      return;
    }
    const timer = setInterval(() => {
      const remaining = scheduleManager.getTimeRemainingInLesson(currentLesson);
      setLessonTimeRemaining(remaining.minutes * 60 + remaining.seconds);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentLesson, schoolOver]);

  // Load materials and students from Supabase (filtered by session_id)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [materialsRes, studentsRes] = await Promise.all([
          supabase.from('materials')
            .select('id, name, type, url, subject, created_at')
            .eq('session_id', sessionData.sessionId)
            .order('created_at', { ascending: false }),
          supabase.from('students').select('id, name').order('created_at', { ascending: true }),
        ]);
        if (!materialsRes.error && materialsRes.data) {
          const newMaterials = materialsRes.data.map((m) => ({
            id: m.id.toString(),
            name: m.name,
            type: m.type,
            url: m.url,
            subject: m.subject || '',
          }));
          const key = newMaterials.map((m) => m.id).join(',');
          if (prevMaterialsCountRef.current > 0 && newMaterials.length > prevMaterialsCountRef.current) {
            const newItem = newMaterials[0];
            setToastMsg('Fayl muvaffaqiyatli qabul qilindi!');
            setToastNewMaterial(newItem);
            setToastVisible(true);
            setTimeout(() => setToastVisible(false), 4000);
          }
          prevMaterialsCountRef.current = newMaterials.length;
          prevMaterialsKeyRef.current = key;
          setMaterials(newMaterials);
        }
        if (!studentsRes.error && studentsRes.data) {
          setStudents(studentsRes.data.map((s) => ({ id: s.id.toString(), name: s.name })));
        }
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    };
    loadData();

    // Listen for realtime updates filtered by session_id
    const matChannel = supabase.channel('dash-materials')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'materials', filter: `session_id=eq.${sessionData.sessionId}` },
        () => loadData()
      )
      .subscribe();
    const stuChannel = supabase.channel('dash-students')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(matChannel);
      supabase.removeChannel(stuChannel);
    };
  }, [sessionData.sessionId]);

  const handleSidebarNav = (section: string) => {
    switch (section) {
      case 'home':
        setMainView('pdf');
        break;
      case 'schedule':
        setMainView('schedule');
        break;
      case 'lessons':
        setMainView('lessons');
        break;
      case 'students':
        setShowStudentPicker(true);
        break;
      case 'analytics':
        setMainView('analytics');
        break;
    }
  };

  const goBackToPdf = () => setMainView('pdf');

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex overflow-hidden pb-20 md:pb-24"
      >
        {/* Left Sidebar - hidden on < lg */}
        <div className="hidden lg:flex flex-shrink-0">
          <Sidebar
            sessionData={sessionData}
            currentLesson={currentLesson}
            onNavigate={handleSidebarNav}
            onOpenSettings={() => setShowSettings(true)}
          />
        </div>

        {/* Center - Main View */}
        <AnimatePresence mode="wait">
          {mainView === 'pdf' && (
            <PdfReader key="pdf" currentLesson={currentLesson} materials={materials} />
          )}
          {mainView === 'schedule' && (
            <ScheduleView key="schedule" currentLesson={currentLesson} onBack={goBackToPdf} />
          )}
          {mainView === 'lessons' && (
            <LessonsView
              key="lessons"
              currentLesson={currentLesson}
              onBack={goBackToPdf}
              onOpenWhiteboard={() => setShowWhiteboard(true)}
              onOpenBrowser={() => setShowBrowser(true)}
            />
          )}
          {mainView === 'analytics' && (
            <AnalyticsView key="analytics" currentLesson={currentLesson} onBack={goBackToPdf} />
          )}
        </AnimatePresence>

        {/* Right Panel - hidden on < xl */}
        <div className="hidden xl:flex flex-shrink-0">
          <RightPanel
            timeRemaining={lessonTimeRemaining}
            currentLesson={currentLesson}
            materials={materials}
            onOpenBrowser={() => setShowBrowser(true)}
            onOpenWhiteboard={() => setShowWhiteboard(true)}
            onLockScreen={onLockScreen}
          />
        </div>
      </motion.div>

      {/* Action Dock */}
      <ActionDock
        onLockScreen={onLockScreen}
        onWhiteboard={() => setShowWhiteboard(true)}
        onBrowser={() => setShowBrowser(true)}
        onAI={() => setShowAI(true)}
        onStudentPicker={() => setShowStudentPicker(true)}
      />

      {/* Modals */}
      <StudentPicker
        isOpen={showStudentPicker}
        onClose={() => setShowStudentPicker(false)}
        students={students.map((s) => s.name)}
      />
      <Whiteboard isOpen={showWhiteboard} onClose={() => setShowWhiteboard(false)} />
      <BrowserMode isOpen={showBrowser} onClose={() => setShowBrowser(false)} />
      <AIAssistant isOpen={showAI} onClose={() => setShowAI(false)} subject={currentLesson?.subject} />
      <AILessonGenerator isOpen={showAILesson} onClose={() => setShowAILesson(false)} subject={currentLesson?.subject} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <Toast
        message={toastMsg}
        isVisible={toastVisible}
        type="success"
        action={toastNewMaterial ? {
          label: `${toastNewMaterial.type.toUpperCase()} ochish`,
          onClick: () => {
            setMainView('pdf');
          },
        } : undefined}
        onClose={() => { setToastVisible(false); setToastNewMaterial(null); }}
      />
    </>
  );
};
