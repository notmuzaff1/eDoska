import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '@/lib/supabase';
import { Toast } from './Toast';
import { Check, X, Upload, Users, Key, Plus, Trash2, Edit2, Save, QrCode, FileText, BookOpen, Camera, StopCircle, Link2, Video, File, Image, Loader2, LogOut, Smartphone, ShieldCheck } from 'lucide-react';

const TEACHER_IDS = ['ID001', 'ID002', 'ID003', 'ID004'];

const UZBEK_STUDENTS = [
  'Abdullayev Asadbek', 'Axmedova Dilnoza', 'Karimov Shahzod', 'Rahimova Madina',
  'Xasanov Jasur', 'Umarova Malika', 'Tursunov Behruz', 'Qodirova Nigora',
  'Raximov Jamshid', 'Abdurahimova Zilola', 'Sattorov Elbek', 'Murodova Sevara',
  'Nazarov Farrux', 'Ismoilova Nozima', 'Xolmatov Aziz', 'Raxmatullayeva Sabina',
  'Yusupov Bobur', 'Toshpo\'latova Shahlo', 'Komilov Sardor', 'Xayrullayeva Feruza',
  'Ergashev Diyor', 'Jo\'rayeva Mahbuba', 'Raxmonov Temur', 'Sultanova Laylo',
  'Mirzayev Dilmurod', 'Aliyeva Mohichehra', 'Xudoyberdiyev Javlon', 'Nishonova Robiya',
  'To\'rayev Shohjahon', 'Inomova Muslima', 'Ahmedov Sarvar',
];

interface Student { id: string; name: string; }

interface Material {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'link' | 'image';
  url: string;
  subject: string;
  sessionId?: string;
  date: string;
}

type AppStep = 'auth' | 'scan' | 'dashboard';

export const TelegramMiniApp: React.FC = () => {
  const [step, setStep] = useState<AppStep>('auth');
  const [teacherId, setTeacherId] = useState('');
  const [teacherError, setTeacherError] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [materialSubject, setMaterialSubject] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [materialType, setMaterialType] = useState<Material['type']>('pdf');
  const [materialUrl, setMaterialUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast state
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  useEffect(() => {
    const savedAuth = localStorage.getItem('edoska_auth') === 'true';
    const savedTeacherId = localStorage.getItem('edoska_teacher_id') || '';
    const savedCode = localStorage.getItem('edoska_session_code') || '';
    if (savedAuth && savedTeacherId) {
      setTeacherId(savedTeacherId);
      setSessionCode(savedCode);
    }
    loadData();
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    const studentsChannel = supabase
      .channel('tg-students')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => loadStudents())
      .subscribe();
    const materialsChannel = supabase
      .channel('tg-materials')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'materials' }, () => loadMaterials())
      .subscribe();
    return () => {
      supabase.removeChannel(studentsChannel);
      supabase.removeChannel(materialsChannel);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadStudents(), loadMaterials()]);
    setLoading(false);
  };

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase.from('students').select('id, name').order('created_at', { ascending: true });
      if (!error && data) setStudents(data.map((s) => ({ id: s.id.toString(), name: s.name })));
    } catch (e) { console.error('Failed to load students:', e); }
  };

  const loadMaterials = async () => {
    try {
      const { data, error } = await supabase.from('materials').select('id, name, type, url, subject, session_id, created_at').order('created_at', { ascending: false });
      if (!error && data) {
        setMaterials(data.map((m) => ({
          id: m.id.toString(),
          name: m.name,
          type: m.type as Material['type'],
          url: m.url,
          subject: m.subject || '',
          sessionId: m.session_id || '',
          date: new Date(m.created_at).toLocaleDateString(),
        })));
      }
    } catch (e) { console.error('Failed to load materials:', e); }
  };

  // ── Step 1: Teacher Authentication ──
  const handleTeacherAuth = () => {
    const id = teacherId.trim().toUpperCase();
    if (!TEACHER_IDS.includes(id)) {
      setTeacherError('Noto\'g\'ri o\'qituvchi ID. ID001-ID004 ni kiriting.');
      return;
    }
    setTeacherError('');
    localStorage.setItem('edoska_auth', 'true');
    localStorage.setItem('edoska_teacher_id', id);
    showToast('O\'qituvchi ID tasdiqlandi!', 'success');
    setStep('scan');
  };

  // ── Step 2: QR Scanner ──
  const startScanner = async () => {
    setScanError('');
    try {
      if (!scannerRef.current) scannerRef.current = new Html5Qrcode('qr-scanner-container');
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopScanner();
          setSessionCode(decodedText);
          completePairing(decodedText);
        },
        () => {}
      );
      setIsScanning(true);
    } catch (err) {
      setScanError('Kameraga ruxsat berilmadi. Iltimos, kamera ruxsatini yoqing.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) { try { await scannerRef.current.stop(); } catch (e) {} }
    setIsScanning(false);
  };

  const completePairing = async (code: string) => {
    localStorage.setItem('edoska_session_code', code);
    try {
      const { error } = await supabase
        .from('classroom_sessions')
        .upsert({
          session_id: code,
          is_authenticated: true,
          authenticated_at: new Date().toISOString(),
        }, { onConflict: 'session_id', ignoreDuplicates: false })
        .select();
      if (error) {
        showToast('Ulanishda xatolik: ' + error.message, 'error');
        return;
      }
      showToast('Sinf doskasiga muvaffaqiyatli ulandi!', 'success');
      setStep('dashboard');
    } catch (err: any) {
      showToast('Ulanishda xatolik yuz berdi', 'error');
    }
  };

  const handleManualPair = async () => {
    if (sessionCode.trim().length >= 4) {
      await completePairing(sessionCode.trim());
    }
  };

  const handleLogout = () => {
    stopScanner();
    localStorage.removeItem('edoska_auth');
    localStorage.removeItem('edoska_teacher_id');
    localStorage.removeItem('edoska_session_code');
    setTeacherId('');
    setSessionCode('');
    setStep('auth');
    showToast('Tizimdan chiqildi', 'info');
  };

  // ── Step 3: Dashboard ──
  const addStudent = async () => {
    if (newStudentName.trim()) {
      const { data, error } = await supabase.from('students').insert({ name: newStudentName.trim() }).select().single();
      if (!error && data) { setStudents((prev) => [...prev, { id: data.id.toString(), name: data.name }]); setNewStudentName(''); showToast('O\'quvchi qo\'shildi!', 'success'); }
    }
  };

  const removeStudent = async (id: string) => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (!error) { setStudents((prev) => prev.filter((s) => s.id !== id)); showToast('O\'quvchi o\'chirildi', 'success'); }
  };

  const seedStudents = async () => {
    const existing = await supabase.from('students').select('id').limit(1);
    if (existing.data && existing.data.length > 0) {
      showToast('O\'quvchilar mavjud', 'info');
      return;
    }
    const { error } = await supabase.from('students').insert(UZBEK_STUDENTS.map((name) => ({ name })));
    if (!error) { await loadStudents(); showToast('30 ta o\'quvchi yuklandi!', 'success'); }
    else showToast('Xatolik: ' + error.message, 'error');
  };

  const startEdit = (student: Student) => { setEditingStudent(student.id); setEditName(student.name); };

  const saveEdit = async (id: string) => {
    if (editName.trim()) {
      const { error } = await supabase.from('students').update({ name: editName.trim() }).eq('id', id);
      if (!error) { setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, name: editName.trim() } : s))); setEditingStudent(null); showToast('O\'quvchi yangilandi!', 'success'); }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    let type: Material['type'] = 'link';
    if (file.type === 'application/pdf') type = 'pdf';
    else if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('text/') || file.name.endsWith('.docx') || file.name.endsWith('.pptx')) type = 'pdf';

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `materials/${fileName}`;

    try {
      const { error } = await supabase.storage.from('classroom-files').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;

      const { data: urlData } = supabase.storage.from('classroom-files').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      const name = materialName.trim() || file.name;
      const subject = materialSubject.trim() || 'General';
      const currentSessionId = localStorage.getItem('edoska_session_code') || '';

      const { error: dbError } = await supabase.from('materials').insert({
        name, type, url: publicUrl, subject,
        session_id: currentSessionId,
      });
      if (!dbError) {
        await loadMaterials();
        setMaterialName('');
        setMaterialSubject('');
        showToast('Fayl muvaffaqiyatli yuklandi!', 'success');
      } else {
        throw dbError;
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      const msg = err?.message || err?.error || 'Xatolik yuz berdi, qaytadan urinib ko\'ring.';
      showToast(msg, 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const addMaterialUrl = async () => {
    if (materialName.trim() && materialUrl.trim()) {
      const currentSessionId = localStorage.getItem('edoska_session_code') || '';
      const { data, error } = await supabase.from('materials').insert({
        name: materialName.trim(),
        type: materialType,
        url: materialUrl.trim(),
        subject: materialSubject.trim() || 'General',
        session_id: currentSessionId,
      }).select().single();
      if (!error && data) {
        await loadMaterials();
        setMaterialName('');
        setMaterialUrl('');
        setMaterialSubject('');
        showToast('Material qo\'shildi!', 'success');
      } else {
        showToast('Xatolik: ' + (error?.message || 'Qaytadan urinib ko\'ring.'), 'error');
      }
    }
  };

  const removeMaterial = async (id: string) => {
    const mat = materials.find((m) => m.id === id);
    if (mat && mat.url.includes('classroom-files')) {
      const path = mat.url.split('/materials/')[1];
      if (path) await supabase.storage.from('classroom-files').remove([`materials/${path}`]);
    }
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (!error) { setMaterials((prev) => prev.filter((m) => m.id !== id)); showToast('Material o\'chirildi', 'success'); }
  };

  const fileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <File className="w-5 h-5 text-red-400" />;
      case 'video': return <Video className="w-5 h-5 text-purple-400" />;
      case 'image': return <Image className="w-5 h-5 text-green-400" />;
      default: return <Link2 className="w-5 h-5 text-blue-400" />;
    }
  };
  const fileBg = (type: string) => {
    switch (type) {
      case 'pdf': return 'bg-red-500/20';
      case 'video': return 'bg-purple-500/20';
      case 'image': return 'bg-green-500/20';
      default: return 'bg-blue-500/20';
    }
  };

  const connectedStep = step === 'scan' || step === 'dashboard';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Toast */}
      <Toast message={toastMsg} isVisible={toastVisible} type={toastType} onClose={() => setToastVisible(false)} />

      {/* Step indicator */}
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-blue-500/20 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold">eDoska</h1>
              <p className="text-xs text-slate-400">
                {step === 'auth' ? "O'qituvchi" :
                 step === 'scan' ? 'QR skaner' :
                 "O'quv materiallari"}
              </p>
            </div>
          </div>
          {/* Step dots */}
          <div className="flex items-center gap-2">
            {(['auth', 'scan', 'dashboard'] as AppStep[]).map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full transition-all ${
                  step === s ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50 w-3 h-3' :
                  ['auth', 'scan', 'dashboard'].indexOf(step) > i ? 'bg-green-400' : 'bg-slate-600'
                }`} />
                {i < 2 && <div className={`w-4 h-0.5 ${['auth', 'scan', 'dashboard'].indexOf(step) > i ? 'bg-green-400/50' : 'bg-slate-700'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto p-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* ═══════ STEP 1: Auth ═══════ */}
            {step === 'auth' && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center min-h-[70vh]"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/30"
                >
                  <ShieldCheck className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">O'qituvchi Autentifikatsiyasi</h2>
                <p className="text-sm text-slate-400 mb-8 text-center max-w-xs">
                  Sinf doskasiga ulanish uchun o'qituvchi ID-ingizni kiriting
                </p>

                <div className="w-full max-w-sm bg-slate-800/40 border border-blue-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Key className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-slate-300">O'qituvchi ID</h3>
                  </div>
                  <input
                    type="text"
                    value={teacherId}
                    onChange={(e) => { setTeacherId(e.target.value.toUpperCase()); setTeacherError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleTeacherAuth()}
                    placeholder="ID001 - ID004"
                    autoFocus
                    className="w-full px-4 py-3 bg-slate-700/50 border border-blue-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-center font-mono text-lg tracking-wider"
                  />
                  {teacherError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm text-red-400 text-center">
                      {teacherError}
                    </motion.p>
                  )}
                  <p className="mt-2 text-xs text-slate-500 text-center">Mavjud ID: ID001, ID002, ID003, ID004</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleTeacherAuth}
                  disabled={!TEACHER_IDS.includes(teacherId.trim().toUpperCase())}
                  className="mt-6 px-10 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all"
                >
                  {/* Kirish */}
                  Kirish
                </motion.button>
              </motion.div>
            )}

            {/* ═══════ STEP 2: QR Scan ═══════ */}
            {step === 'scan' && (
              <motion.div
                key="scan"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Connected badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-500/10 border border-green-400/30 rounded-xl p-3 mb-4 flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-300">O'qituvchi ID tasdiqlandi</p>
                    <p className="text-xs text-green-400/70">{teacherId}</p>
                  </div>
                  <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                    <LogOut className="w-4 h-4" />
                  </button>
                </motion.div>

                <div className="bg-slate-800/40 border border-blue-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <QrCode className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-semibold text-white">QR kodni skaner qiling</h3>
                  </div>

                  <div className="relative mb-4">
                    <div id="qr-scanner-container" className="w-full aspect-square bg-black rounded-xl overflow-hidden border-2 border-cyan-400/30" />
                    {!isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-xl">
                        <div className="text-center">
                          <Camera className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-400 font-medium">Kamerani yoqish</p>
                          <p className="text-xs text-slate-500 mt-1">Sinf doskasidagi QR kodni skaner qiling</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {!isScanning ? (
                      <button onClick={startScanner} className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                        <Camera className="w-5 h-5" /> QR skaner qilish
                      </button>
                    ) : (
                      <button onClick={stopScanner} className="flex-1 py-3 bg-red-500/20 border border-red-400/30 text-red-400 rounded-xl font-semibold flex items-center justify-center gap-2">
                        <StopCircle className="w-5 h-5" /> Kamerani to'xtatish
                      </button>
                    )}
                  </div>
                  {scanError && <p className="mt-3 text-sm text-red-400 text-center bg-red-500/10 rounded-lg p-2">{scanError}</p>}
                </div>

                {/* Manual code entry */}
                <div className="mt-4 bg-slate-800/40 border border-blue-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Key className="w-4 h-4 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-300">Yoki kodni qo'lda kiriting</h3>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleManualPair()}
                      placeholder="SESSION_XXXXX"
                      className="flex-1 px-3 py-2 bg-slate-700/50 border border-blue-500/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-mono"
                    />
                    <button onClick={handleManualPair} disabled={sessionCode.trim().length < 4} className="px-4 py-2 bg-slate-700/50 border border-blue-500/20 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-700 transition-all">
                      Ulash
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══════ STEP 3: Dashboard ═══════ */}
            {step === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Connected banner */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-400/30 rounded-xl p-3 flex items-center gap-3"
                >
                  <Smartphone className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-300">Doskaga ulangan</p>
                    <p className="text-xs text-green-400/70 truncate">{localStorage.getItem('edoska_session_code') || ''}</p>
                  </div>
                  <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0">
                    <LogOut className="w-4 h-4" />
                  </button>
                </motion.div>

                {/* Upload file section */}
                <div className="bg-slate-800/40 border border-blue-500/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-white">Fayl yuklash</h3>
                  </div>
                  <input
                    type="text"
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    placeholder="Fayl nomi (ixtiyoriy)"
                    className="w-full px-3 py-2 bg-slate-700/50 border border-blue-500/20 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="text"
                    value={materialSubject}
                    onChange={(e) => setMaterialSubject(e.target.value)}
                    placeholder="Fan nomi (ixtiyoriy)"
                    className="w-full px-3 py-2 bg-slate-700/50 border border-blue-500/20 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.webm,.txt" onChange={handleFileUpload} className="hidden" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full py-4 border-2 border-dashed border-cyan-400/30 rounded-xl text-cyan-400 hover:border-cyan-400/60 hover:bg-cyan-500/5 transition-all flex flex-col items-center gap-2 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-sm">Yuklanmoqda... {uploadProgress}%</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6" />
                        <span className="text-sm">Fayl tanlash uchun bosing</span>
                        <span className="text-xs text-slate-500">PDF, DOCX, PPTX, Rasmlar, Videolar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* URL paste section */}
                <div className="bg-slate-800/40 border border-blue-500/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 className="w-4 h-4 text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-300">Yoki URL joylashtiring</h3>
                  </div>
                  <input
                    type="text"
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    placeholder="Material nomi"
                    className="w-full px-3 py-2 bg-slate-700/50 border border-blue-500/20 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="text"
                    value={materialUrl}
                    onChange={(e) => setMaterialUrl(e.target.value)}
                    placeholder="https://... (PDF, YouTube, veb-sayt)"
                    className="w-full px-3 py-2 bg-slate-700/50 border border-blue-500/20 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={materialSubject}
                      onChange={(e) => setMaterialSubject(e.target.value)}
                      placeholder="Fan"
                      className="flex-1 px-3 py-2 bg-slate-700/50 border border-blue-500/20 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                    <select
                      value={materialType}
                      onChange={(e) => setMaterialType(e.target.value as Material['type'])}
                      className="px-3 py-2 bg-slate-700/50 border border-blue-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
                    >
                      <option value="pdf">PDF</option>
                      <option value="video">Video</option>
                      <option value="image">Rasm</option>
                      <option value="link">Havola</option>
                    </select>
                  </div>
                  <button
                    onClick={addMaterialUrl}
                    disabled={!materialName.trim() || !materialUrl.trim()}
                    className="w-full py-2.5 bg-slate-700/50 border border-blue-500/20 text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-slate-700 transition-all"
                  >
                    URL qo'shish
                  </button>
                </div>

                {/* Material list */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Materiallar ({materials.length})</h3>
                  </div>
                  {materials.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium">Hozircha materiallar yo'q</p>
                      <p className="text-sm text-slate-500 mt-1">Fayl yuklang yoki URL qo'shing</p>
                    </div>
                  ) : (
                    materials.map((material) => (
                      <div key={material.id} className="bg-slate-800/40 border border-blue-500/20 rounded-xl p-3 flex items-center justify-between">
                        <a href={material.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${fileBg(material.type)}`}>
                            {fileIcon(material.type)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{material.name}</p>
                            <p className="text-xs text-slate-400">{material.subject} • {material.type.toUpperCase()} • {material.date}</p>
                          </div>
                        </a>
                        <button onClick={() => removeMaterial(material.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-all ml-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Student management */}
                <div className="bg-slate-800/40 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-white">O'quvchilar ({students.length})</h3>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addStudent()}
                      placeholder="Yangi o'quvchi qo'shish..."
                      className="flex-1 px-3 py-2 bg-slate-700/50 border border-blue-500/20 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                    <button onClick={addStudent} disabled={!newStudentName.trim()} className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Qo'shish
                    </button>
                  </div>
                  <button onClick={seedStudents} className="w-full py-2 bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-all">
                    + 30 ta o'quvchini yuklash
                  </button>
                  <div className="space-y-1 mt-3 max-h-40 overflow-y-auto">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-2 hover:bg-slate-700/30 rounded-lg transition-all">
                        {editingStudent === student.id ? (
                          <div className="flex-1 flex gap-2">
                            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveEdit(student.id)} className="flex-1 px-2 py-1 bg-slate-700/50 border border-cyan-400/30 rounded text-white text-sm focus:outline-none" autoFocus />
                            <button onClick={() => saveEdit(student.id)} className="p-1 text-green-400 hover:bg-green-500/20 rounded"><Save className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setEditingStudent(null)} className="p-1 text-slate-400 hover:bg-slate-700 rounded"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">{student.name.charAt(0)}</div>
                              <span className="text-sm text-white truncate">{student.name}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button onClick={() => startEdit(student)} className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => removeStudent(student.id)} className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
