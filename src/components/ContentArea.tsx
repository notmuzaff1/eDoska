import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, Search, Pen, Zap } from 'lucide-react';
import { Lesson } from '@/types';

interface ContentAreaProps {
  currentSlide: number;
  totalSlides: number;
  onNextSlide: () => void;
  onPrevSlide: () => void;
  currentLesson?: Lesson | null;
}

export const ContentArea: React.FC<ContentAreaProps> = ({
  currentSlide,
  totalSlides,
  onNextSlide,
  onPrevSlide,
  currentLesson,
}) => {
  const slideContent = [
    {
      title: 'Introduction to Derivatives',
      subtitle: 'The derivative measures the instantaneous rate of change of a function with respect to its input variable.',
      formula: "f'(x) = lim[h→0] (f(x+h) - f(x)) / h",
      details: [
        'Represents the slope of the tangent line',
        'Used to find rates of change',
        'Foundation of differential calculus',
      ],
    },
    {
      title: 'Power Rule',
      subtitle: 'The power rule provides a quick way to differentiate functions of the form xⁿ.',
      formula: 'd/dx [xⁿ] = n·xⁿ⁻¹',
      details: [
        'Works for any real number n',
        'd/dx [x³] = 3x²',
        'd/dx [√x] = 1/(2√x)',
      ],
    },
    {
      title: 'Product Rule',
      subtitle: 'When differentiating a product of two functions, use the product rule.',
      formula: 'd/dx [f·g] = f\'·g + f·g\'',
      details: [
        'First times derivative of second',
        'Plus second times derivative of first',
        'Example: d/dx [x²·sin(x)]',
      ],
    },
    {
      title: 'Chain Rule',
      subtitle: 'The chain rule is used for composite functions - functions within functions.',
      formula: 'd/dx [f(g(x))] = f\'(g(x)) · g\'(x)',
      details: [
        'Differentiate the outer function',
        'Multiply by derivative of inner',
        'Example: d/dx [sin(x²)] = cos(x²)·2x',
      ],
    },
    {
      title: 'Applications of Derivatives',
      subtitle: 'Derivatives have many practical applications in science, engineering, and economics.',
      formula: 'f\'(x) = 0 → critical points',
      details: [
        'Finding maximum and minimum values',
        'Optimization problems',
        'Related rates and motion analysis',
      ],
    },
  ];

  const currentIndex = Math.min(currentSlide - 1, slideContent.length - 1);
  const current = slideContent[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex-1 flex flex-col bg-gradient-to-br from-slate-900/30 to-blue-950/20 backdrop-blur-sm border-x border-blue-500/20 overflow-hidden min-w-0"
    >
      {/* Top toolbar */}
      <div className="h-14 md:h-16 border-b border-blue-500/20 px-3 md:px-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg px-2 md:px-3 py-1 flex-shrink-0">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm3.293-1.293a1 1 0 011.414 0L10 7.586l3.293-3.293a1 1 0 111.414 1.414L11.414 9l3.293 3.293a1 1 0 01-1.414 1.414L10 10.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 9 5.293 5.707a1 1 0 010-1.414z" />
            </svg>
            <span className="text-xs md:text-sm font-semibold text-white truncate max-w-[120px] md:max-w-none">
              {currentLesson ? `${currentLesson.subject}.pptx` : 'Calculus.pptx'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 text-slate-400 flex-shrink-0">
            <span className="font-semibold text-white">{currentSlide}</span>
            <span>/</span>
            <span>{totalSlides}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-3">
          <motion.button whileHover={{ scale: 1.1 }} className="p-1.5 md:p-2 hover:bg-slate-800 rounded-lg transition-all">
            <Maximize2 className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} className="p-1.5 md:p-2 hover:bg-slate-800 rounded-lg transition-all hidden sm:block">
            <Search className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} className="p-1.5 md:p-2 hover:bg-slate-800 rounded-lg transition-all">
            <Pen className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} className="p-1.5 md:p-2 hover:bg-slate-800 rounded-lg transition-all hidden sm:block">
            <Zap className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
          </motion.button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-auto">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-3xl"
        >
          <div className="bg-gradient-to-br from-blue-950/40 to-slate-900/40 backdrop-blur-md border border-blue-500/30 rounded-2xl md:rounded-3xl p-6 md:p-12">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-5xl font-bold text-white mb-3 md:mb-4"
            >
              {current.title}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="w-12 md:w-20 h-0.5 md:h-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full mb-4 md:mb-6"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm md:text-lg text-slate-300 mb-6 md:mb-8 leading-relaxed"
            >
              {current.subtitle}
            </motion.p>

            {/* Formula box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-400/50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8"
            >
              <p className="text-lg md:text-3xl font-mono text-cyan-300 text-center">{current.formula}</p>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2 md:space-y-3"
            >
              {current.details.map((detail, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + idx * 0.05 }}
                  className="flex items-center gap-2 md:gap-3 text-slate-300 text-sm md:text-base"
                >
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                  <span>{detail}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Graph placeholder */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 md:mt-10 h-40 md:h-64 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-blue-500/20 rounded-xl md:rounded-2xl flex items-center justify-center"
            >
              <svg className="w-20 h-20 md:w-32 md:h-32 text-blue-400/40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path d="M50,150 Q100,50 150,150" stroke="currentColor" strokeWidth="2" fill="none" />
                <line x1="50" y1="150" x2="150" y2="150" stroke="currentColor" strokeWidth="1" />
                <line x1="100" y1="50" x2="100" y2="150" stroke="currentColor" strokeWidth="1" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Slide navigation */}
      <div className="border-t border-blue-500/20 px-3 md:px-6 py-3 md:py-4 bg-slate-900/50 backdrop-blur-md flex items-center justify-between flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrevSlide}
          disabled={currentSlide === 1}
          className="p-2 md:p-3 hover:bg-blue-500/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
        </motion.button>

        {/* Slide thumbnails */}
        <div className="flex gap-1.5 md:gap-2 overflow-x-auto max-w-[50%] md:max-w-md px-2 md:px-4">
          {Array.from({ length: Math.min(5, totalSlides) }).map((_, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className={`w-10 h-7 md:w-16 md:h-12 rounded-lg border-2 transition-all cursor-pointer flex-shrink-0 ${
                currentSlide === idx + 1
                  ? 'border-cyan-400 bg-cyan-400/20'
                  : 'border-blue-500/30 bg-slate-800/50'
              }`}
            >
              <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-slate-300">
                {idx + 1}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNextSlide}
          disabled={currentSlide === totalSlides}
          className="p-2 md:p-3 hover:bg-blue-500/20 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
        </motion.button>
      </div>
    </motion.div>
  );
};
