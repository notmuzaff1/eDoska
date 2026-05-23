import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, FileText, Upload, X, ExternalLink, Video, Image, Link2, Sparkles, Bot, ChevronDown, Loader2 } from 'lucide-react';
import { Lesson } from '@/types';
import { generatePresentation, SlideData, QuizQuestion } from '@/lib/gemini';

interface PdfReaderProps {
  currentLesson?: Lesson | null;
  materials?: Array<{ id: string; name: string; type: string; url: string; subject: string }>;
}

export const PdfReader: React.FC<PdfReaderProps> = ({ currentLesson, materials = [] }) => {
  const [pdfUrl, setPdfUrl] = useState('');
  const [activeMaterial, setActiveMaterial] = useState<{ id: string; name: string; type: string } | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevMaterialsRef = useRef<string>('');

  // AI Presentation state
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiSubject, setAiSubject] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSlides, setAiSlides] = useState<SlideData[]>([]);
  const [aiQuiz, setAiQuiz] = useState<QuizQuestion[]>([]);
  const [aiSummary, setAiSummary] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const pdfMaterials = materials.filter((m) => m.type === 'pdf');
  const videoMaterials = materials.filter((m) => m.type === 'video');
  const imageMaterials = materials.filter((m) => m.type === 'image');
  const linkMaterials = materials.filter((m) => m.type === 'link');

  useEffect(() => {
    const materialsKey = materials.map((m) => m.id).join(',');
    if (materials.length > 0 && materialsKey !== prevMaterialsRef.current && !pdfUrl && !aiSlides.length) {
      prevMaterialsRef.current = materialsKey;
      const newest = materials[0];
      loadMaterial(newest);
    }
  }, [materials]);

  const isValidGoogleDriveUrl = (url: string): boolean => {
    return /^(https?:\/\/)?(www\.)?drive\.google\.com\/(file\/d\/|open\?id=)[a-zA-Z0-9_-]+/.test(url.trim());
  };

  const convertUrl = (url: string, type: string) => {
    let processedUrl = url.trim();
    if (processedUrl.includes('drive.google.com')) {
      if (!isValidGoogleDriveUrl(processedUrl)) {
        setError('URL yaroqsiz. Iltimos, to\'g\'ri Google Drive havolasini kiriting.');
        return '';
      }
      const fileId = processedUrl.match(/\/d\/([^/]+)/)?.[1] || processedUrl.match(/id=([^&]+)/)?.[1];
      if (fileId) processedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    }
    if (processedUrl.includes('dropbox.com')) processedUrl = processedUrl.replace('?dl=0', '?raw=1').replace('?dl=1', '?raw=1');
    if (processedUrl.includes('youtube.com/watch')) {
      const videoId = new URL(processedUrl).searchParams.get('v');
      if (videoId) processedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } else if (processedUrl.includes('youtu.be/')) {
      const videoId = processedUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) processedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return processedUrl;
  };

  const loadMaterial = (material: { id: string; name: string; type: string; url: string }) => {
    setError('');
    setIsLoading(true);
    const processedUrl = convertUrl(material.url, material.type);
    setPdfUrl(processedUrl);
    setInputUrl(processedUrl);
    setActiveMaterial({ id: material.id, name: material.name, type: material.type });
    setAiSlides([]);
  };

  const loadPdf = (url: string) => {
    if (!url.trim()) return;
    setError('');
    setIsLoading(true);
    const processedUrl = convertUrl(url, 'pdf');
    if (!processedUrl) { setIsLoading(false); return; }
    setPdfUrl(processedUrl);
    setInputUrl(processedUrl);
    setActiveMaterial(null);
    setAiSlides([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setInputUrl(url);
      setActiveMaterial(null);
      setAiSlides([]);
      setError('');
    } else {
      setError('Iltimos, PDF faylini tanlang');
    }
  };

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return;
    setAiGenerating(true);
    setError('');
    setShowQuiz(false);
    setShowSummary(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    try {
      const result = await generatePresentation(aiSubject.trim() || currentLesson?.subject || 'General', aiTopic.trim());
      setAiSlides(result.slides);
      setAiQuiz(result.quiz);
      setAiSummary(result.summary);
      setCurrentSlide(0);
      setShowAiModal(false);
      setAiTopic('');
      setPdfUrl('');
      setActiveMaterial(null);
    } catch (err: any) {
      console.error('[AI Error] Full error object:', err);
      console.error('[AI Error] Stack:', err.stack);
      setError(`AI generation failed: ${err.message}`);
    } finally {
      setAiGenerating(false);
    }
  };

  const closePresentation = () => {
    setAiSlides([]);
    setAiQuiz([]);
    setAiSummary('');
    setCurrentSlide(0);
    setShowQuiz(false);
    setShowSummary(false);
  };

  const nextSlide = () => {
    if (currentSlide < aiSlides.length - 1) setCurrentSlide((s) => s + 1);
  };
  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide((s) => s - 1);
  };

  const handleQuizAnswer = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
  };

  const score = quizSubmitted
    ? aiQuiz.reduce((acc, q, i) => acc + (quizAnswers[i] === q.correctAnswer ? 1 : 0), 0)
    : 0;

  const zoomIn = () => setZoom((z) => Math.min(z + 25, 200));
  const zoomOut = () => setZoom((z) => Math.max(z - 25, 50));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex-1 flex flex-col bg-gradient-to-br from-slate-900/30 to-blue-950/20 backdrop-blur-sm border-x border-blue-500/20 overflow-hidden min-w-0"
    >
      {/* Top toolbar */}
      <div className="h-14 border-b border-blue-500/20 px-3 md:px-4 flex items-center justify-between bg-slate-900/50 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          {aiSlides.length > 0 ? (
            <div className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg px-2 md:px-3 py-1 flex-shrink-0">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
              <span className="text-xs md:text-sm font-semibold text-white truncate max-w-[140px] md:max-w-[250px]">
                {aiSlides[0].title}
              </span>
            </div>
          ) : (
            <div className={`flex items-center gap-1.5 md:gap-2 rounded-lg px-2 md:px-3 py-1 flex-shrink-0 ${
              activeMaterial?.type === 'video' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
              activeMaterial?.type === 'image' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
              activeMaterial?.type === 'link' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
              'bg-gradient-to-br from-red-500 to-orange-500'
            }`}>
              {activeMaterial?.type === 'video' ? <Video className="w-4 h-4 md:w-5 md:h-5 text-white" /> :
               activeMaterial?.type === 'image' ? <Image className="w-4 h-4 md:w-5 md:h-5 text-white" /> :
               activeMaterial?.type === 'link' ? <Link2 className="w-4 h-4 md:w-5 md:h-5 text-white" /> :
               <FileText className="w-4 h-4 md:w-5 md:h-5 text-white" />}
              <span className="text-xs md:text-sm font-semibold text-white truncate max-w-[100px] md:max-w-[200px]">
                {activeMaterial ? activeMaterial.name : pdfUrl ? 'PDF Ko\'rish' : currentLesson ? `${currentLesson.subject}.pdf` : 'PDF O\'quvchi'}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          {!aiSlides.length && !showAiModal && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => { setShowAiModal(true); setAiTopic(''); setAiSubject(''); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI bilan yaratish
            </motion.button>
          )}
        </div>
      </div>

      {/* AI Generation Modal */}
      <AnimatePresence>
        {showAiModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-slate-900 to-slate-950 border border-purple-500/30 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Taqdimot yaratish</h3>
                  <p className="text-xs text-slate-400">Gemini AI asosida</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Mavzu *</label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !aiGenerating && handleGenerateAI()}
                    placeholder="Masalan, Derivativlar, Fotosintez..."
                    className="w-full px-3 py-2.5 bg-slate-800 border border-blue-500/20 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Fan (ixtiyoriy)</label>
                  <input
                    type="text"
                    value={aiSubject}
                    onChange={(e) => setAiSubject(e.target.value)}
                    placeholder={currentLesson?.subject || 'Masalan, Matematika, Biologiya...'}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-blue-500/20 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAiModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleGenerateAI}
                  disabled={aiGenerating || !aiTopic.trim()}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {aiGenerating ? 'Yaratilmoqda...' : 'Yaratish'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!pdfUrl && aiSlides.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            <div className="bg-gradient-to-br from-blue-950/40 to-slate-900/40 backdrop-blur-md border border-blue-500/30 rounded-2xl md:rounded-3xl p-6 md:p-10">
              <div className="text-center mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 md:w-10 md:h-10 text-red-400" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">PDF O'quvchi</h2>
                <p className="text-sm text-slate-400">PDF taqdimotni yuklang yoki AI bilan yarating</p>
              </div>

              {/* AI Generate button (big) */}
              <div className="mb-6">
                <button
                  onClick={() => { setShowAiModal(true); setAiTopic(''); setAiSubject(''); }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  AI bilan taqdimot yaratish
                </button>
              </div>

              {/* URL input */}
              <div className="space-y-3 mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadPdf(inputUrl)}
                    placeholder="PDF URL yoki Google Drive havolasini joylashtiring..."
                    className="flex-1 px-4 py-3 bg-slate-800 border border-blue-500/20 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => loadPdf(inputUrl)}
                    disabled={!inputUrl.trim()}
                    className="px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50"
                  >
                    Yuklash
                  </motion.button>
                </div>
              </div>

              {/* File upload */}
              <div className="mb-6">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-blue-500/30 rounded-xl cursor-pointer hover:border-cyan-400/50 hover:bg-cyan-500/5 transition-all">
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <p className="text-xs text-slate-400">Qurilmadan PDF yuklash</p>
                  </div>
                  <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {materials.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Yuklangan materiallar</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {materials.map((material) => (
                      <motion.button
                        key={material.id}
                        whileHover={{ x: 4 }}
                        onClick={() => loadMaterial(material)}
                        className={`w-full flex items-center gap-3 p-3 border rounded-xl hover:border-cyan-400/50 transition-all text-left ${
                          activeMaterial?.id === material.id ? 'bg-cyan-500/10 border-cyan-400/50' : 'bg-slate-800/60 border-blue-500/20'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          material.type === 'pdf' ? 'bg-red-500/20' :
                          material.type === 'video' ? 'bg-purple-500/20' :
                          material.type === 'image' ? 'bg-green-500/20' : 'bg-blue-500/20'
                        }`}>
                          {material.type === 'pdf' ? <FileText className="w-5 h-5 text-red-400" /> :
                           material.type === 'video' ? <Video className="w-5 h-5 text-purple-400" /> :
                           material.type === 'image' ? <Image className="w-5 h-5 text-green-400" /> :
                           <Link2 className="w-5 h-5 text-blue-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{material.name}</p>
                          <p className="text-xs text-slate-400">{material.subject} • {material.type.toUpperCase()}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-400 text-center mt-4">{error}</p>}
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Presentation Slides */}
      {aiSlides.length > 0 && (
        <div className="flex-1 flex flex-col">
          {/* Slide navigation */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-blue-500/20">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Slayd {currentSlide + 1} / {aiSlides.length}</span>
              <div className="flex gap-1">
                {aiSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentSlide ? 'bg-cyan-400 w-3' : 'bg-slate-600 hover:bg-slate-400'}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setShowQuiz(false); setShowSummary(false); }}
                className={`px-2 py-1 rounded text-xs ${!showQuiz && !showSummary ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
              >
                Slaydlar
              </button>
              <button
                onClick={() => { setShowQuiz(true); setShowSummary(false); }}
                className={`px-2 py-1 rounded text-xs ${showQuiz ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
              >
                Test ({aiQuiz.length})
              </button>
              <button
                onClick={() => { setShowSummary(true); setShowQuiz(false); }}
                className={`px-2 py-1 rounded text-xs ${showSummary ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
              >
                Xulosa
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-slate-800/40 p-4 md:p-8">
            {!showQuiz && !showSummary ? (
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-4xl mx-auto h-full flex flex-col"
              >
                <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/20 rounded-2xl p-8 md:p-12 flex flex-col justify-center shadow-2xl">
                  <div className="max-w-2xl mx-auto w-full">
                    <p className="text-xs text-cyan-400 uppercase tracking-widest mb-2">Slayd {currentSlide + 1}</p>
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-6">{aiSlides[currentSlide].title}</h2>
                    <div className="text-slate-200 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                      {aiSlides[currentSlide].content}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : showQuiz && !showSummary ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-3xl mx-auto space-y-6"
              >
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" /> Test
                </h3>
                {aiQuiz.map((q, qIdx) => (
                  <div key={qIdx} className="bg-slate-800/60 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-white font-semibold mb-3">{qIdx + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = quizAnswers[qIdx] === oIdx;
                        const isCorrect = quizSubmitted && q.correctAnswer === oIdx;
                        const isWrong = quizSubmitted && isSelected && q.correctAnswer !== oIdx;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleQuizAnswer(qIdx, oIdx)}
                            className={`w-full text-left p-2.5 rounded-lg text-sm transition-all border ${
                              isCorrect ? 'bg-green-500/20 border-green-400/50 text-green-300' :
                              isWrong ? 'bg-red-500/20 border-red-400/50 text-red-300' :
                              isSelected ? 'bg-cyan-500/20 border-cyan-400/50 text-white' :
                              'bg-slate-700/30 border-blue-500/20 text-slate-300 hover:bg-slate-700/50'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {!quizSubmitted && (
                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(quizAnswers).length < aiQuiz.length}
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
                  >
                    Javoblarni yuborish
                  </button>
                )}
                {quizSubmitted && (
                  <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-cyan-400">{score}/{aiQuiz.length}</p>
                    <p className="text-sm text-slate-400">Ball</p>
                  </div>
                )}
              </motion.div>
            ) : showSummary && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-3xl mx-auto"
              >
                <div className="bg-slate-800/60 border border-blue-500/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" /> Dars xulosasi
                  </h3>
                  <p className="text-slate-200 text-base leading-relaxed whitespace-pre-wrap">{aiSummary}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bottom navigation */}
          <div className="h-14 border-t border-blue-500/20 px-4 flex items-center justify-between bg-slate-900/50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={closePresentation}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
                Yopish
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs text-slate-400">{currentSlide + 1} / {aiSlides.length}</span>
              <button
                onClick={nextSlide}
                disabled={currentSlide === aiSlides.length - 1}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF/Video viewer */}
      {pdfUrl && aiSlides.length === 0 && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative bg-slate-800">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full"
                />
              </div>
            )}
            {activeMaterial?.type === 'video' ? (
              <iframe src={pdfUrl} className="w-full h-full border-0" allow="autoplay; encrypted-media" onLoad={() => setIsLoading(false)} title="Video" />
            ) : (
              <iframe
                ref={iframeRef}
                src={pdfUrl}
                className="w-full h-full border-0"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                onLoad={() => setIsLoading(false)}
                onError={() => { setIsLoading(false); setError('Yuklab bo\'lmadi. Yangi oynada ochishga harakat qiling.'); }}
                title="Viewer"
              />
            )}
          </div>
          <div className="h-10 border-t border-blue-500/20 px-4 flex items-center justify-between bg-slate-900/50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => { setPdfUrl(''); setActiveMaterial(null); }} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
                <X className="w-3 h-3" />
                Yopish
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <button onClick={zoomOut} className="p-1 hover:text-white"><ZoomOut className="w-3.5 h-3.5" /></button>
              <span>{zoom}%</span>
              <button onClick={zoomIn} className="p-1 hover:text-white"><ZoomIn className="w-3.5 h-3.5" /></button>
              <span className="text-slate-600">|</span>
              <button onClick={() => window.open(pdfUrl, '_blank')} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Yangi oynada ochish
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
