import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, SkipForward, X } from 'lucide-react';

interface StudentPickerProps {
  isOpen: boolean;
  onClose: () => void;
  students?: string[];
}

const DEFAULT_STUDENTS = [
  'Alex Johnson', 'Emma Williams', 'Liam Brown', 'Olivia Davis', 'Noah Miller',
  'Ava Wilson', 'Ethan Moore', 'Sophia Taylor', 'Mason Anderson', 'Isabella Thomas',
  'Logan Jackson', 'Mia White', 'Lucas Harris', 'Charlotte Martin', 'Aiden Thompson',
];

export const StudentPicker: React.FC<StudentPickerProps> = ({ isOpen, onClose, students: propStudents }) => {
  const students = propStudents && propStudents.length > 0 ? propStudents : DEFAULT_STUDENTS;
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [usedStudents, setUsedStudents] = useState<Set<number>>(new Set());
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);

  const pickStudent = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const allIndices = Array.from({ length: students.length }, (_, i) => i);
    let availableIndices = allIndices.filter((i) => !usedStudents.has(i));

    if (availableIndices.length === 0) {
      setUsedStudents(new Set());
      availableIndices = allIndices;
    }

    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const spins = 5 + Math.random() * 3;
    const targetRotation = spins * 360 + (randomIndex / students.length) * 360;

    setWheelRotation(targetRotation);
    setSelectedStudent(students[randomIndex]);
    setUsedStudents((prev) => new Set(prev).add(randomIndex));

    setTimeout(() => setIsSpinning(false), 2000);
  };

  const resetList = () => {
    setUsedStudents(new Set());
    setSelectedStudent(null);
    setWheelRotation(0);
  };

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
            className="bg-gradient-to-br from-slate-900 to-slate-950 border border-blue-500/30 rounded-2xl md:rounded-3xl p-4 md:p-8 max-w-2xl w-full"
          >
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-xl md:text-3xl font-bold text-white">Tasodifiy O'quvchi Tanlash</h2>
                <p className="text-xs md:text-sm text-slate-400 mt-1">O'quvchini tasodifiy tanlash uchun bosing</p>
              </motion.div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="p-1.5 md:p-2 hover:bg-slate-800 rounded-lg transition-all">
                <X className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />
              </motion.button>
            </div>

            <div className="flex justify-center mb-4 md:mb-8">
              <motion.div
                className="relative w-36 h-36 md:w-48 md:h-48"
                animate={{ rotate: wheelRotation }}
                transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full border-2 border-cyan-400/50 flex items-center justify-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full border border-blue-500/30 flex items-center justify-center">
                    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-center">
                      <div className="text-xl md:text-2xl font-bold text-cyan-400">🎯</div>
                    </motion.div>
                  </div>
                </div>
                {[...Array(8)].map((_, i) => (
                  <motion.div key={i} className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(from ${(i * 45)}deg, transparent 0deg 45deg)`, opacity: 0.3 }} />
                ))}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-cyan-400 z-10" />
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              {selectedStudent && (
                <motion.div
                  key={selectedStudent}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6 text-center"
                >
                  <p className="text-xs md:text-sm text-slate-400 mb-1 md:mb-2">Tanlangan o'quvchi:</p>
                  <p className="text-lg md:text-2xl font-bold text-white">{selectedStudent}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center text-xs md:text-sm text-slate-400 mb-4 md:mb-6">
              <p>Qolgan o'quvchilar: {students.length - usedStudents.size}</p>
            </motion.div>

            <div className="flex gap-2 md:gap-4">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={pickStudent} disabled={isSpinning} className="flex-1 py-2.5 md:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base">
                <motion.div animate={isSpinning ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 1, repeat: isSpinning ? Infinity : 0 }}>
                  <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
                </motion.div>
                {isSpinning ? 'Tanlanmoqda...' : 'Tanlash'}
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={resetList} disabled={usedStudents.size === 0} className="py-2.5 md:py-3 px-4 md:px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 md:gap-2 text-sm md:text-base">
                <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                Qayta tiklash
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
