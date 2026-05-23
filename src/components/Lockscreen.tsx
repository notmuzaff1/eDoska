import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode.react';
import { Lock, BookOpen, Calendar, Gamepad2, Brain, Trophy, X, RotateCcw, Play, ChevronRight, Video, Grid3X3 } from 'lucide-react';
import { SessionData } from '@/types';

interface LockscreenProps {
  sessionData: SessionData;
}

type GameType = 'none' | 'math' | 'memory' | 'word' | 'quiz' | 'sudoku' | 'videos';

interface MathQuestion {
  question: string;
  answer: number;
  options: number[];
}

interface MemoryCard {
  id: number;
  value: string;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface WordQuestion {
  word: string;
  scrambled: string;
  hint: string;
}

interface TriviaQuestion {
  question: string;
  answer: string;
  options: string[];
}

interface ApprovedVideo {
  title: string;
  channel: string;
  duration: string;
  videoId: string;
  subject: string;
}

const MATH_QUESTIONS: MathQuestion[] = [
  { question: '12 × 8 = ?', answer: 96, options: [86, 96, 106, 92] },
  { question: '144 ÷ 12 = ?', answer: 12, options: [11, 12, 13, 14] },
  { question: '15² = ?', answer: 225, options: [215, 225, 235, 250] },
  { question: '√49 = ?', answer: 7, options: [6, 7, 8, 9] },
  { question: '23 + 47 = ?', answer: 70, options: [60, 70, 80, 65] },
  { question: '100 - 37 = ?', answer: 63, options: [53, 63, 73, 67] },
  { question: '9 × 7 = ?', answer: 63, options: [56, 63, 72, 54] },
  { question: '56 ÷ 8 = ?', answer: 7, options: [6, 7, 8, 9] },
  { question: '18 × 5 = ?', answer: 90, options: [80, 85, 90, 95] },
  { question: '256 ÷ 16 = ?', answer: 16, options: [14, 15, 16, 18] },
  { question: '7² + 3² = ?', answer: 58, options: [52, 58, 62, 48] },
  { question: '1000 ÷ 25 = ?', answer: 40, options: [35, 40, 45, 50] },
  { question: '13 × 11 = ?', answer: 143, options: [133, 143, 153, 131] },
  { question: '√144 = ?', answer: 12, options: [10, 11, 12, 14] },
  { question: '2⁸ = ?', answer: 256, options: [128, 256, 512, 64] },
  { question: '45 × 20 = ?', answer: 900, options: [800, 850, 900, 950] },
  { question: '17 + 28 + 35 = ?', answer: 80, options: [70, 75, 80, 85] },
  { question: '3³ = ?', answer: 27, options: [9, 18, 27, 81] },
  { question: '200 - 87 = ?', answer: 113, options: [103, 113, 123, 117] },
  { question: '15 × 15 = ?', answer: 225, options: [200, 215, 225, 250] },
];

const MEMORY_PAIRS = [
  { value: 'π', symbol: '3.14' },
  { value: '∞', symbol: 'Infinity' },
  { value: '√', symbol: 'Square Root' },
  { value: 'Δ', symbol: 'Delta' },
  { value: 'Σ', symbol: 'Sigma' },
  { value: 'θ', symbol: 'Theta' },
];

const WORD_QUESTIONS: WordQuestion[] = [
  { word: 'CALCULUS', scrambled: 'LULCCASU', hint: 'Branch of mathematics' },
  { word: 'PHYSICS', scrambled: 'SPYHICS', hint: 'Science of matter and energy' },
  { word: 'ALGEBRA', scrambled: 'BLAGREA', hint: 'Math with variables' },
  { word: 'GEOMETRY', scrambled: 'OEMGTRYE', hint: 'Study of shapes' },
  { word: 'BIOLOGY', scrambled: 'BIOOLYG', hint: 'Study of life' },
  { word: 'CHEMISTRY', scrambled: 'HEMISTRYC', hint: 'Study of substances' },
  { word: 'HISTORY', scrambled: 'ORYHIST', hint: 'Study of the past' },
  { word: 'LITERATURE', scrambled: 'TERATURELI', hint: 'Written works' },
  { word: 'PROGRAM', scrambled: 'MARGORP', hint: 'Set of coded instructions' },
  { word: 'EQUATION', scrambled: 'UATIONEQ', hint: 'Mathematical statement' },
  { word: 'THEOREM', scrambled: 'REMTHEO', hint: 'Proven mathematical statement' },
  { word: 'VELOCITY', scrambled: 'LOCIVETY', hint: 'Speed in a direction' },
];

const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  { question: 'What planet is known as the Red Planet?', answer: 'Mars', options: ['Mars', 'Venus', 'Jupiter', 'Saturn'] },
  { question: 'What is the speed of light?', answer: '300,000 km/s', options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '100,000 km/s'] },
  { question: 'Who developed the theory of relativity?', answer: 'Einstein', options: ['Newton', 'Einstein', 'Tesla', 'Hawking'] },
  { question: 'What is the largest organ in the human body?', answer: 'Skin', options: ['Liver', 'Brain', 'Skin', 'Heart'] },
  { question: 'What gas do plants absorb?', answer: 'CO₂', options: ['Oxygen', 'CO₂', 'Nitrogen', 'Hydrogen'] },
  { question: 'How many bones in adult human body?', answer: '206', options: ['186', '206', '226', '256'] },
  { question: 'What is H₂O commonly known as?', answer: 'Water', options: ['Salt', 'Water', 'Sugar', 'Oil'] },
  { question: 'What year did WW2 end?', answer: '1945', options: ['1943', '1944', '1945', '1946'] },
  { question: 'What is the capital of Japan?', answer: 'Tokyo', options: ['Tokyo', 'Osaka', 'Kyoto', 'Seoul'] },
  { question: 'Which element has symbol "Au"?', answer: 'Gold', options: ['Silver', 'Gold', 'Aluminum', 'Argon'] },
  { question: 'What is the hardest natural substance?', answer: 'Diamond', options: ['Iron', 'Diamond', 'Quartz', 'Granite'] },
  { question: 'How many continents are there?', answer: '7', options: ['5', '6', '7', '8'] },
  { question: 'What is the largest ocean?', answer: 'Pacific', options: ['Atlantic', 'Pacific', 'Indian', 'Arctic'] },
  { question: 'Who painted the Mona Lisa?', answer: 'Da Vinci', options: ['Da Vinci', 'Picasso', 'Monet', 'Van Gogh'] },
  { question: 'What is the boiling point of water?', answer: '100°C', options: ['90°C', '100°C', '110°C', '120°C'] },
  { question: 'What is DNA short for?', answer: 'Deoxyribonucleic Acid', options: ['Deoxyribonucleic Acid', 'Dynamic Nuclear Atom', 'Digital Network Access', 'Dual Neutron Array'] },
  { question: 'What force keeps us on the ground?', answer: 'Gravity', options: ['Magnetism', 'Gravity', 'Friction', 'Inertia'] },
  { question: 'What is the smallest unit of matter?', answer: 'Atom', options: ['Cell', 'Molecule', 'Atom', 'Electron'] },
  { question: 'Which country has the most people?', answer: 'India', options: ['China', 'India', 'USA', 'Indonesia'] },
  { question: 'What is the currency of UK?', answer: 'Pound', options: ['Euro', 'Dollar', 'Pound', 'Yen'] },
];

const APPROVED_VIDEOS: ApprovedVideo[] = [
  { title: 'Calculus 1 - Full College Course', channel: 'freeCodeCamp', duration: '2:35:00', videoId: 'WsQQvHm4lSw', subject: 'Math' },
  { title: 'Derivatives Explained Simply', channel: '3Blue1Brown', duration: '28:15', videoId: 'HfACrKJ_Y2w', subject: 'Math' },
  { title: 'Physics - Mechanics Introduction', channel: 'Crash Course', duration: '45:20', videoId: 'ZM8ECpBuQYE', subject: 'Science' },
  { title: 'Chemistry Basics - Atoms', channel: 'Khan Academy', duration: '52:55', videoId: 'yQP4uxJANSs', subject: 'Science' },
  { title: 'Biology - Cell Structure', channel: 'Amoeba Sisters', duration: '38:15', videoId: 'QnQe0xW_JY4', subject: 'Science' },
  { title: 'Literary Analysis Techniques', channel: 'TED-Ed', duration: '42:30', videoId: '7YPVvMKOZ9I', subject: 'Literature' },
  { title: 'World History Overview', channel: 'Crash Course', duration: '1:05:00', videoId: 'x0C7r1YH0kE', subject: 'History' },
  { title: 'Programming Fundamentals', channel: 'freeCodeCamp', duration: '55:40', videoId: 'zOjov-2OZ0E', subject: 'CS' },
  { title: 'Algebra Fundamentals', channel: 'Khan Academy', duration: '45:32', videoId: 'dQw4w9WgXcQ', subject: 'Math' },
  { title: 'The Art of Problem Solving', channel: 'TED', duration: '18:30', videoId: 'riXcZT2ICjA', subject: 'Math' },
  { title: 'How to Study Effectively', channel: 'Thomas Frank', duration: '12:45', videoId: 'IlU-zDU6aQ0', subject: 'Study Skills' },
  { title: 'The Power of Habit', channel: 'TED', duration: '15:20', videoId: 'lP3lBPHEJqo', subject: 'Psychology' },
  { title: 'Introduction to Economics', channel: 'Crash Course', duration: '42:00', videoId: 'G_16wBRMkkg', subject: 'Economics' },
  { title: 'Philosophy - What is Justice?', channel: 'TED-Ed', duration: '10:30', videoId: 'HxblsQjMH7s', subject: 'Philosophy' },
  { title: 'Music Theory Basics', channel: 'Rick Beato', duration: '35:00', videoId: '1Gwwbe1HdIo', subject: 'Music' },
  { title: 'Public Speaking Tips', channel: 'TED', duration: '20:15', videoId: 'Unzc731iCUY', subject: 'Skills' },
];

const SUDOKU_PUZZLES = [
  {
    puzzle: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ],
  },
  {
    puzzle: [
      [0, 0, 0, 2, 6, 0, 7, 0, 1],
      [6, 8, 0, 0, 7, 0, 0, 9, 0],
      [1, 9, 0, 0, 0, 4, 5, 0, 0],
      [8, 2, 0, 1, 0, 0, 0, 4, 0],
      [0, 0, 4, 6, 0, 2, 9, 0, 0],
      [0, 5, 0, 0, 0, 3, 0, 2, 8],
      [0, 0, 9, 3, 0, 0, 0, 7, 4],
      [0, 4, 0, 0, 5, 0, 0, 3, 6],
      [7, 0, 3, 0, 1, 8, 0, 0, 0],
    ],
    solution: [
      [4, 3, 5, 2, 6, 9, 7, 8, 1],
      [6, 8, 2, 5, 7, 1, 4, 9, 3],
      [1, 9, 7, 8, 3, 4, 5, 6, 2],
      [8, 2, 6, 1, 9, 5, 3, 4, 7],
      [3, 7, 4, 6, 8, 2, 9, 1, 5],
      [9, 5, 1, 7, 4, 3, 6, 2, 8],
      [5, 1, 9, 3, 2, 6, 8, 7, 4],
      [2, 4, 8, 9, 5, 7, 1, 3, 6],
      [7, 6, 3, 4, 1, 8, 2, 5, 9],
    ],
  },
];

export const Lockscreen: React.FC<LockscreenProps> = ({ sessionData }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeGame, setActiveGame] = useState<GameType>('none');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<ApprovedVideo | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('edoska_highscore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('edoska_highscore', score.toString());
    }
  }, [score, highScore]);

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', weekday: 'short' });

  const closeGame = () => {
    setActiveGame('none');
    setSelectedVideo(null);
  };

  const games = [
    { id: 'math' as GameType, icon: Brain, label: 'Matematika Challenge', desc: 'Tez aqliy hisob', color: 'from-cyan-500 to-blue-600' },
    { id: 'memory' as GameType, icon: Gamepad2, label: 'Xotira o\'yini', desc: 'Mos juftlarni toping', color: 'from-purple-500 to-pink-600' },
    { id: 'word' as GameType, icon: BookOpen, label: 'So\'z topish', desc: 'So\'zni toping', color: 'from-emerald-500 to-green-600' },
    { id: 'quiz' as GameType, icon: Trophy, label: 'Bilim sinovi', desc: 'Bilimingizni sinang', color: 'from-orange-500 to-red-600' },
    { id: 'sudoku' as GameType, icon: Grid3X3, label: 'Sudoku', desc: 'Raqamli boshqotirma', color: 'from-indigo-500 to-violet-600' },
    { id: 'videos' as GameType, icon: Video, label: 'Video ko\'rish', desc: 'O\'qituvchi tasdiqlagan', color: 'from-red-500 to-rose-600' },
  ];

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" animate={{ y: [0, 100, 0], x: [0, 50, 0] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" animate={{ y: [0, -100, 0], x: [0, -50, 0] }} transition={{ duration: 8, repeat: Infinity, delay: 2 }} />
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 6, repeat: Infinity }} />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 md:p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 md:w-7 md:h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">eDoska</h1>
            <p className="text-xs text-slate-400 hidden sm:block">Aqlli Sinf Platformasi</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-right">
          <div className="text-3xl md:text-5xl font-bold text-white tracking-tight">{formatTime(currentTime)}</div>
          <div className="text-xs md:text-sm text-slate-400 mt-1 flex items-center justify-end gap-1">
            <Calendar className="w-3 h-3 md:w-4 md:h-4" />
            {formatDate(currentTime)}
          </div>
        </motion.div>
      </div>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {activeGame === 'none' ? (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4">
            {/* Score badge */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-4 mb-6">
              <div className="bg-slate-800/60 border border-blue-500/30 rounded-full px-4 py-2 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-white font-semibold">Eng yaxshi: {highScore}</span>
              </div>
              {score > 0 && <div className="bg-cyan-500/20 border border-cyan-400/30 rounded-full px-4 py-2"><span className="text-sm text-cyan-400 font-semibold">Ball: {score}</span></div>}
            </motion.div>

            {/* QR Code */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1 }} className="relative mb-6 md:mb-8">
              <motion.div className="absolute inset-0 -m-8 md:-m-12 rounded-3xl border-2 border-cyan-400/30" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} />
              <div className="relative bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl">
                <QRCode value={sessionData.sessionId} size={window.innerWidth < 768 ? 160 : 220} level="H" includeMargin={false} renderAs="canvas" />
                <motion.div className="absolute inset-0 flex items-center justify-center" animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 md:w-7 md:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0m5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.336-.375-.123l-6.869 4.332-2.97-.924c-.644-.213-.658-.644.136-.953l11.583-4.461c.538-.196 1.006.128.832.941z" />
                    </svg>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Lock info */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center mb-6 md:mb-8">
              <p className="text-lg md:text-xl font-semibold text-white mb-1">Ekran qulflangan</p>
              <p className="text-sm text-slate-400">Qulfni ochish uchun Telegram orqali QR kodni skanerlang</p>
            </motion.div>

            {/* Games section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Gamepad2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-semibold text-white">Kutish vaqti</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {games.map((game, idx) => {
                  const Icon = game.icon;
                  return (
                    <motion.button
                      key={game.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + idx * 0.08 }}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveGame(game.id)}
                      className={`bg-gradient-to-br ${game.color} rounded-xl p-3 md:p-4 text-left hover:shadow-xl transition-all group`}
                    >
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-white mb-1 md:mb-2" />
                      <p className="text-xs md:text-sm font-bold text-white">{game.label}</p>
                      <p className="text-[10px] md:text-xs text-white/70 mt-0.5">{game.desc}</p>
                      <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-white/50 mt-1 md:mt-2 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Class info */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="absolute bottom-4 md:bottom-8 left-4 md:left-8">
              <div className="bg-gradient-to-br from-blue-950/40 to-slate-900/40 backdrop-blur-md border border-blue-500/30 rounded-2xl md:rounded-3xl p-4 max-w-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Joriy dars:</p>
                    <h2 className="text-lg md:text-xl font-bold text-white">{sessionData.grade}</h2>
                    <p className="text-sm text-cyan-400">{sessionData.subject}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-4 md:bottom-8 right-4 md:right-8">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-950/40 to-slate-900/40 backdrop-blur-md border border-blue-500/30 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
              </div>
            </motion.div>
          </motion.div>
        ) : activeGame === 'videos' ? (
          <motion.div key="videos" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 z-30 flex flex-col">
            {/* Video header */}
            <div className="flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-blue-500/20">
              <div className="flex items-center gap-3">
                {selectedVideo ? (
                  <button onClick={() => setSelectedVideo(null)} className="p-1.5 hover:bg-slate-800 rounded-lg transition-all">
                    <ChevronRight className="w-5 h-5 text-slate-400 rotate-180" />
                  </button>
                ) : null}
                <h2 className="text-lg font-bold text-white">{selectedVideo ? 'Hozir ijro etilmoqda' : 'O\'qituvchi tasdiqlagan videolar'}</h2>
              </div>
              <div className="flex items-center gap-2">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={closeGame} className="p-2 hover:bg-slate-800 rounded-lg transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </motion.button>
              </div>
            </div>

            {/* Video content */}
            <div className="flex-1 overflow-auto">
              {selectedVideo ? (
                <div className="h-full flex flex-col">
                  <div className="flex-1 bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={selectedVideo.title}
                    />
                  </div>
                  <div className="p-4 bg-slate-900/50 border-t border-blue-500/20">
                    <h3 className="text-white font-semibold">{selectedVideo.title}</h3>
                    <p className="text-sm text-slate-400">{selectedVideo.channel} • {selectedVideo.duration}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {APPROVED_VIDEOS.map((video) => (
                      <motion.button
                        key={video.videoId}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedVideo(video)}
                        className="bg-slate-800/60 border border-blue-500/20 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all text-left group"
                      >
                        <div className="relative h-36 bg-slate-700">
                          <img src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`} alt={video.title} className="w-full h-full object-cover group-hover:opacity-80 transition-all" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/480x360/1e293b/64748b?text=Video'; }} />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all">
                            <div className="w-12 h-12 rounded-full bg-red-500/90 flex items-center justify-center"><Play className="w-6 h-6 text-white fill-white ml-0.5" /></div>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-xs text-white">{video.duration}</div>
                          <div className="absolute top-2 left-2 bg-cyan-500/80 px-2 py-0.5 rounded text-xs text-white font-medium">{video.subject}</div>
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-semibold text-white line-clamp-2">{video.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{video.channel}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="game" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 z-30 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-white font-semibold">{score} pts</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => { setScore(0); }} className="p-2 hover:bg-slate-800 rounded-lg transition-all">
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={closeGame} className="p-2 hover:bg-slate-800 rounded-lg transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </motion.button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {activeGame === 'math' && <MathGame setScore={setScore} />}
              {activeGame === 'memory' && <MemoryGame setScore={setScore} />}
              {activeGame === 'word' && <WordGame setScore={setScore} />}
              {activeGame === 'quiz' && <QuizGame setScore={setScore} />}
              {activeGame === 'sudoku' && <SudokuGame />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* Math Challenge */
const MathGame: React.FC<{ setScore: (fn: (s: number) => number) => void }> = ({ setScore }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<{ value: number; isCorrect: boolean }[]>([]);

  const question = MATH_QUESTIONS[questionIndex % MATH_QUESTIONS.length];

  useEffect(() => {
    // Shuffle options so correct answer is randomly placed
    const opts = question.options.map((opt) => ({
      value: opt,
      isCorrect: opt === question.answer,
    }));
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    setShuffledOptions(opts);
    setSelected(null);
    setShowResult(false);
  }, [questionIndex]);

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    const chosen = shuffledOptions[idx];
    setSelected(idx);
    setShowResult(true);
    if (chosen.isCorrect) { setScore((s) => s + 10 + streak * 2); setStreak((s) => s + 1); } else { setStreak(0); }
    setTimeout(() => { setQuestionIndex((i) => i + 1); }, 1000);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Matematika Challenge</h2>
        {streak > 1 && <p className="text-cyan-400 text-sm">🔥 {streak} natija!</p>}
      </div>
      <div className="bg-slate-800/60 border border-blue-500/30 rounded-2xl p-8 mb-6 text-center">
        <p className="text-4xl font-bold text-white">{question.question}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {shuffledOptions.map((opt, idx) => (
          <motion.button key={idx} whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(idx)} disabled={showResult} className={`py-4 rounded-xl text-xl font-bold transition-all ${showResult ? opt.isCorrect ? 'bg-green-500/30 border-2 border-green-400 text-green-300' : idx === selected ? 'bg-red-500/30 border-2 border-red-400 text-red-300' : 'bg-slate-800/40 border border-slate-700 text-slate-500' : 'bg-slate-800/60 border border-blue-500/30 text-white hover:border-cyan-400 hover:bg-cyan-500/10'}`}>
            {opt.value}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

/* Memory Match */
const MemoryGame: React.FC<{ setScore: (fn: (s: number) => number) => void }> = ({ setScore }) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const allCards: MemoryCard[] = [];
    MEMORY_PAIRS.forEach((pair, idx) => {
      allCards.push({ id: idx * 2, value: pair.value, symbol: pair.value, isFlipped: false, isMatched: false });
      allCards.push({ id: idx * 2 + 1, value: pair.symbol, symbol: pair.symbol, isFlipped: false, isMatched: false });
    });
    setCards(allCards.sort(() => Math.random() - 0.5));
  }, []);

  const handleCardClick = (id: number) => {
    if (flipped.length >= 2) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c)));
    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped.map((fid) => cards.find((c) => c.id === fid)!);
      const pair = MEMORY_PAIRS.find((p) => (p.value === first.symbol && p.symbol === second.symbol) || (p.symbol === first.symbol && p.value === second.symbol));
      if (pair) {
        setTimeout(() => { setCards((prev) => prev.map((c) => (c.id === first.id || c.id === second.id ? { ...c, isMatched: true } : c))); setScore((s) => s + 25); setFlipped([]); }, 500);
      } else {
        setTimeout(() => { setCards((prev) => prev.map((c) => (c.id === first.id || c.id === second.id ? { ...c, isFlipped: false } : c))); setFlipped([]); }, 800);
      }
    }
  };

  const allMatched = cards.length > 0 && cards.every((c) => c.isMatched);

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Xotira o'yini</h2>
        <p className="text-sm text-slate-400">Harakat: {moves} | Barcha juftlarni toping!</p>
      </div>
      {allMatched && <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-4"><p className="text-green-400 font-bold text-lg">🎉 Hammasi topildi!</p></motion.div>}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {cards.map((card) => (
          <motion.button key={card.id} whileTap={{ scale: 0.9 }} onClick={() => handleCardClick(card.id)} className={`aspect-square rounded-xl text-sm font-bold transition-all ${card.isMatched ? 'bg-green-500/20 border-2 border-green-400 text-green-300' : card.isFlipped ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-300' : 'bg-slate-800/60 border border-blue-500/30 text-slate-600 hover:border-cyan-400/50'}`}>
            {card.isFlipped || card.isMatched ? card.value : '?'}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

/* Word Scramble */
const WordGame: React.FC<{ setScore: (fn: (s: number) => number) => void }> = ({ setScore }) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const word = WORD_QUESTIONS[wordIndex % WORD_QUESTIONS.length];

  const handleSubmit = () => {
    if (guess.toUpperCase() === word.word) { setResult('correct'); setScore((s) => s + 20); } else { setResult('wrong'); }
    setTimeout(() => { setWordIndex((i) => i + 1); setGuess(''); setResult(null); }, 1500);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">So'z topish</h2>
        <p className="text-sm text-slate-400">Maslahat: {word.hint}</p>
      </div>
      <div className="bg-slate-800/60 border border-blue-500/30 rounded-2xl p-8 mb-6 text-center">
        <p className="text-3xl font-mono font-bold text-cyan-400 tracking-widest">{word.scrambled}</p>
      </div>
      <div className="flex gap-3">
        <input type="text" value={guess} onChange={(e) => setGuess(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))} onKeyDown={(e) => e.key === 'Enter' && guess && handleSubmit()} placeholder="YOUR ANSWER" className="flex-1 px-4 py-3 bg-slate-800 border border-blue-500/30 rounded-xl text-white text-lg font-mono tracking-wider placeholder-slate-600 focus:outline-none focus:border-cyan-400" autoFocus />
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleSubmit} disabled={!guess} className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50"><Play className="w-5 h-5" /></motion.button>
      </div>
      {result && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-center mt-4 font-semibold ${result === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{result === 'correct' ? '✓ To\'g\'ri!' : `✗ Javob: ${word.word}`}</motion.p>}
    </div>
  );
};

/* Trivia Quiz */
const QuizGame: React.FC<{ setScore: (fn: (s: number) => number) => void }> = ({ setScore }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const question = TRIVIA_QUESTIONS[questionIndex % TRIVIA_QUESTIONS.length];

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelected(answer);
    setShowResult(true);
    if (answer === question.answer) setScore((s) => s + 15);
    setTimeout(() => { setQuestionIndex((i) => i + 1); setSelected(null); setShowResult(false); }, 1200);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Bilim sinovi</h2>
        <p className="text-sm text-slate-400">Umumiy bilimingizni sinang</p>
      </div>
      <div className="bg-slate-800/60 border border-blue-500/30 rounded-2xl p-6 mb-6">
        <p className="text-lg font-semibold text-white text-center">{question.question}</p>
      </div>
      <div className="space-y-3">
        {question.options.map((opt) => (
          <motion.button key={opt} whileTap={{ scale: 0.98 }} onClick={() => handleAnswer(opt)} disabled={showResult} className={`w-full py-3 px-4 rounded-xl text-left font-medium transition-all ${showResult ? opt === question.answer ? 'bg-green-500/30 border-2 border-green-400 text-green-300' : opt === selected ? 'bg-red-500/30 border-2 border-red-400 text-red-300' : 'bg-slate-800/40 border border-slate-700 text-slate-500' : 'bg-slate-800/60 border border-blue-500/30 text-white hover:border-cyan-400 hover:bg-cyan-500/10'}`}>
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

/* Sudoku Game */
const SudokuGame: React.FC = () => {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [board, setBoard] = useState<number[][]>([]);
  const [original, setOriginal] = useState<boolean[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [notes, setNotes] = useState<Set<string>>(new Set());
  const [noteMode, setNoteMode] = useState(false);
  const puzzle = SUDOKU_PUZZLES[puzzleIdx % SUDOKU_PUZZLES.length];

  useEffect(() => {
    setBoard(puzzle.puzzle.map((row) => [...row]));
    setOriginal(puzzle.puzzle.map((row) => row.map((cell) => cell !== 0)));
    setSelectedCell(null);
    setErrors(0);
    setIsComplete(false);
    setNotes(new Set());
    setNoteMode(false);
  }, [puzzleIdx]);

  const isSameNumber = (r: number, c: number, num: number) => {
    if (!selectedCell || num === 0) return false;
    const [sr, sc] = selectedCell;
    return board[r][c] !== 0 && board[r][c] === board[sr][sc] && !(r === sr && c === sc);
  };

  const isHighlighted = (r: number, c: number) => {
    if (!selectedCell) return false;
    const [sr, sc] = selectedCell;
    if (r === sr && c === sc) return false;
    return r === sr || c === sc || (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3));
  };

  const handleNumber = (num: number) => {
    if (!selectedCell || isComplete) return;
    const [r, c] = selectedCell;
    if (original[r][c]) return;

    if (noteMode) {
      const key = `${r}-${c}-${num}`;
      setNotes((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
      return;
    }

    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);

    // Clear notes for this cell
    setNotes((prev) => {
      const next = new Set(prev);
      for (let n = 1; n <= 9; n++) next.delete(`${r}-${c}-${n}`);
      return next;
    });

    if (num !== 0 && num !== puzzle.solution[r][c]) {
      setErrors((e) => e + 1);
    }

    const complete = newBoard.every((row, ri) => row.every((cell, ci) => cell === puzzle.solution[ri][ci]));
    if (complete) setIsComplete(true);
  };

  const handleClear = () => {
    if (!selectedCell || isComplete) return;
    const [r, c] = selectedCell;
    if (original[r][c]) return;
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = 0;
    setBoard(newBoard);
    setNotes((prev) => {
      const next = new Set(prev);
      for (let n = 1; n <= 9; n++) next.delete(`${r}-${c}-${n}`);
      return next;
    });
  };

  const getCellNotes = (r: number, c: number): number[] => {
    const result: number[] = [];
    for (let n = 1; n <= 9; n++) {
      if (notes.has(`${r}-${c}-${n}`)) result.push(n);
    }
    return result;
  };

  const moveSelection = (dr: number, dc: number) => {
    if (!selectedCell) { setSelectedCell([0, 0]); return; }
    const [r, c] = selectedCell;
    const nr = Math.max(0, Math.min(8, r + dr));
    const nc = Math.max(0, Math.min(8, c + dc));
    setSelectedCell([nr, nc]);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isComplete || !selectedCell) return;
      if (e.key >= '1' && e.key <= '9') handleNumber(parseInt(e.key));
      if (e.key === 'Backspace' || e.key === 'Delete') handleClear();
      if (e.key === 'ArrowUp') moveSelection(-1, 0);
      if (e.key === 'ArrowDown') moveSelection(1, 0);
      if (e.key === 'ArrowLeft') moveSelection(0, -1);
      if (e.key === 'ArrowRight') moveSelection(0, 1);
      if (e.key === 'n' || e.key === 'N') setNoteMode((prev) => !prev);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedCell, isComplete, notes, board]);

  return (
    <div className="max-w-sm mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white mb-1">Sudoku</h2>
        <p className="text-sm text-slate-400">Xatolar: {errors} | {noteMode ? 'Eslatma rejimi' : 'Oddiy rejim'}</p>
      </div>
      {isComplete && <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-4"><p className="text-green-400 font-bold text-lg">🎉 Boshqotirma yechildi!</p></motion.div>}
      <div className="bg-slate-800/60 border-2 border-blue-500/30 rounded-xl p-1 mb-4">
        <div className="grid grid-cols-9 gap-0">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
              const isOriginalCell = original[r]?.[c];
              const isError = cell !== 0 && cell !== puzzle.solution[r]?.[c];
              const highlight = isHighlighted(r, c);
              const sameNum = isSameNumber(r, c, cell);
              const boxBorderRight = (c + 1) % 3 === 0 && c < 8 ? 'border-r-2 border-r-blue-400/50' : '';
              const boxBorderBottom = (r + 1) % 3 === 0 && r < 8 ? 'border-b-2 border-b-blue-400/50' : '';
              const cellNotes = getCellNotes(r, c);
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => setSelectedCell([r, c])}
                  className={`aspect-square flex items-center justify-center text-sm md:text-base font-bold transition-all ${boxBorderRight} ${boxBorderBottom} ${
                    isSelected ? 'bg-cyan-500/40 text-cyan-300 ring-2 ring-cyan-400 z-10' :
                    sameNum ? 'bg-cyan-500/15 text-cyan-300' :
                    isError ? 'text-red-400' :
                    highlight ? 'bg-blue-500/10' :
                    isOriginalCell ? 'text-white' : 'text-cyan-400'
                  } hover:bg-slate-700/50 relative`}
                >
                  {cell !== 0 ? cell : cellNotes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-0 absolute inset-0 p-0.5">
                      {[1,2,3,4,5,6,7,8,9].map((n) => (
                        <span key={n} className="text-[8px] leading-none flex items-center justify-center text-slate-500">
                          {cellNotes.includes(n) ? n : ''}
                        </span>
                      ))}
                    </div>
                  ) : ''}
                </button>
              );
            })
          )}
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
          <motion.button
            key={num}
            whileTap={{ scale: 0.9 }}
            onClick={() => num === 0 ? handleClear() : handleNumber(num)}
            className={`py-2.5 border rounded-lg text-white font-bold transition-all ${
              num === 0 ? 'bg-red-500/20 border-red-400/30 hover:bg-red-500/30' : 'bg-slate-800/60 border-blue-500/20 hover:bg-cyan-500/20 hover:border-cyan-400/50'
            }`}
          >
            {num === 0 ? '✕' : num}
          </motion.button>
        ))}
      </div>
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setNoteMode((prev) => !prev)}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            noteMode ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-300' : 'bg-slate-800 border border-blue-500/20 text-white hover:bg-slate-700'
          }`}
        >
          {noteMode ? 'Eslatma: YOQIQ' : 'Eslatma rejimi'}
        </button>
        <button onClick={() => setPuzzleIdx((i) => i + 1)} className="flex-1 py-2 bg-slate-800 border border-blue-500/20 text-white rounded-lg text-sm hover:bg-slate-700 transition-all">Yangi</button>
      </div>
    </div>
  );
};
