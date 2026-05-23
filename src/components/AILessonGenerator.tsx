import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Play, Loader2, Check, X as XIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { generatePresentation } from '@/lib/gemini';
import { SlideData, QuizQuestion } from '@/lib/gemini';

interface AILessonGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  subject?: string;
}

export const AILessonGenerator: React.FC<AILessonGeneratorProps> = ({ isOpen, onClose, subject }) => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [summary, setSummary] = useState('');
  const [currentTab, setCurrentTab] = useState<'slides' | 'quiz' | 'summary'>('slides');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [error, setError] = useState('');

  const generateLesson = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setError('');
    setQuizAnswers({});
    setQuizSubmitted(false);
    setCurrentSlide(0);

    try {
      const result = await generatePresentation(subject || 'General', topic);
      setSlides(result.slides);
      setQuiz(result.quiz);
      setSummary(result.summary);
      setCurrentTab('slides');
    } catch (err: any) {
      console.error('[AI Error] Full error object:', err);
      console.error('[AI Error] Stack:', err.stack);
      setError(err.message || 'Dars yaratilmadi');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetLesson = () => {
    setSlides([]);
    setQuiz([]);
    setSummary('');
    setTopic('');
    setCurrentTab('slides');
    setQuizAnswers({});
    setQuizSubmitted(false);
    setError('');
  };

  const nextSlide = () => setCurrentSlide((s) => Math.min(s + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide((s) => Math.max(s - 1, 0));

  const handleQuizAnswer = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const submitQuiz = () => setQuizSubmitted(true);

  const score = quizSubmitted
    ? quiz.reduce((acc, q, i) => acc + (quizAnswers[i] === q.correctAnswer ? 1 : 0), 0)
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-slate-900 to-slate-950 border border-blue-500/30 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="h-14 border-b border-blue-500/20 px-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-md flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">AI Dars Yaratuvchi</h2>
                  <p className="text-xs text-slate-400">{subject || 'Har qanday fan'}</p>
                </div>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-slate-400" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              {slides.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col items-center justify-center gap-6"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Dars mavzusini kiriting</h3>
                    <p className="text-slate-400 mb-6">AI slaydlar, test savollari va xulosalarni yaratadi</p>
                  </div>

                  <div className="w-full max-w-md">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isGenerating) generateLesson();
                      }}
                      placeholder="Masalan: Derivativlar, Fotosintez, Ikkinchi Jahon Urushi..."
                      className="w-full px-4 py-3 bg-slate-800 border border-blue-500/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 bg-red-500/10 px-4 py-2 rounded-lg max-w-md text-center">{error}</p>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={generateLesson}
                    disabled={isGenerating || !topic.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                    {isGenerating ? 'Gemini bilan yaratilmoqda...' : 'Darsni yaratish'}
                  </motion.button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {/* Tabs */}
                  <div className="flex gap-1 border-b border-blue-500/20 overflow-x-auto flex-shrink-0">
                    {[
                      { id: 'slides' as const, label: 'Slaydlar', icon: '📊' },
                      { id: 'quiz' as const, label: 'Test', icon: '❓' },
                      { id: 'summary' as const, label: 'Xulosa', icon: '📝' },
                    ].map((tab) => (
                      <motion.button
                        key={tab.id}
                        onClick={() => setCurrentTab(tab.id)}
                        className={`px-3 py-2 flex items-center gap-1.5 border-b-2 transition-all text-sm whitespace-nowrap ${
                          currentTab === tab.id
                            ? 'border-cyan-400 text-cyan-400'
                            : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab.icon} {tab.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Tab content */}
                  <motion.div
                    key={currentTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {currentTab === 'slides' && (
                      <div>
                        {/* Slide navigation dots */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>Slayd {currentSlide + 1} / {slides.length}</span>
                            <div className="flex gap-1">
                              {slides.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setCurrentSlide(i)}
                                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentSlide ? 'bg-cyan-400 w-3' : 'bg-slate-600 hover:bg-slate-400'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={prevSlide} disabled={currentSlide === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30">
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={nextSlide} disabled={currentSlide === slides.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30">
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <motion.div
                          key={currentSlide}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/20 rounded-xl p-6 min-h-[300px] flex flex-col justify-center"
                        >
                          <p className="text-xs text-cyan-400 uppercase tracking-widest mb-2">Slayd {currentSlide + 1}</p>
                          <h4 className="text-xl font-bold text-white mb-4">{slides[currentSlide].title}</h4>
                          <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{slides[currentSlide].content}</p>
                        </motion.div>
                      </div>
                    )}

                    {currentTab === 'quiz' && (
                      <div className="space-y-6">
                        {quiz.map((q, qIdx) => (
                          <motion.div
                            key={qIdx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: qIdx * 0.05 }}
                            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/20 rounded-xl p-4"
                          >
                            <p className="text-white font-semibold mb-3">{qIdx + 1}. {q.question}</p>
                            <div className="space-y-2">
                              {q.options.map((opt, oIdx) => {
                                const isSelected = quizAnswers[qIdx] === oIdx;
                                const isCorrect = quizSubmitted && q.correctAnswer === oIdx;
                                const isWrong = quizSubmitted && isSelected && q.correctAnswer !== oIdx;
                                return (
                                  <motion.button
                                    key={oIdx}
                                    whileHover={!quizSubmitted ? { x: 4 } : {}}
                                    onClick={() => handleQuizAnswer(qIdx, oIdx)}
                                    className={`w-full text-left p-2.5 rounded-lg text-sm transition-all border flex items-center justify-between ${
                                      isCorrect ? 'bg-green-500/20 border-green-400/50 text-green-300' :
                                      isWrong ? 'bg-red-500/20 border-red-400/50 text-red-300' :
                                      isSelected ? 'bg-cyan-500/20 border-cyan-400/50 text-white' :
                                      'bg-slate-700/30 border-blue-500/20 text-slate-300 hover:bg-slate-700/50'
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {isCorrect && <Check className="w-4 h-4 text-green-400" />}
                                    {isWrong && <XIcon className="w-4 h-4 text-red-400" />}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </motion.div>
                        ))}

                        {!quizSubmitted ? (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            onClick={submitQuiz}
                            disabled={Object.keys(quizAnswers).length < quiz.length}
                            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
                          >
                            Javoblarni yuborish
                          </motion.button>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-6 text-center"
                          >
                            <p className="text-3xl font-bold text-cyan-400">{score}/{quiz.length}</p>
                            <p className="text-sm text-slate-400">Natija</p>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {currentTab === 'summary' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/20 rounded-xl p-6"
                      >
                        <p className="text-slate-100 whitespace-pre-wrap text-base leading-relaxed">
                          {summary}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              )}
            </div>

            {/* Footer */}
            {slides.length > 0 && (
              <div className="h-14 border-t border-blue-500/20 px-6 flex items-center justify-end gap-3 bg-slate-900/50 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={resetLesson}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-all"
                >
                  Yangi Dars
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={onClose}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                >
                  Yakunlash
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
