import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Sparkles, Bot } from 'lucide-react';
import { ChatMessage } from '@/types';
import { generateLessonResponse } from '@/lib/gemini';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  subject?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, subject }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const currentSubject = subject || 'Calculus';

  const suggestions = [
    `${currentSubject} tushunchalarini tushuntir`,
    `Mashq misollar yarat`,
    `Real hayot misollarini ko'rsat`,
    `Asosiy fikrlarni umumlashtir`,
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateLessonResponse(currentSubject, text);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response || 'Javob olinmadi.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (e: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Xato: ' + (e.message || e),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-gradient-to-b from-slate-900 to-slate-950 border-l border-blue-500/20 z-40 flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="h-14 border-b border-blue-500/20 px-4 flex items-center justify-between bg-slate-900/50 backdrop-blur-md flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                  <h3 className="font-bold text-white text-sm">AI Yordamchi</h3>
                  <p className="text-xs text-slate-400">{currentSubject}</p>
                </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-slate-400" />
            </motion.button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col items-center justify-center gap-4 text-center px-4"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center">
                  <Bot className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Salom! Qanday yordam bera olaman?</p>
                  <p className="text-xs text-slate-400 mb-4">{currentSubject} haqida so'rang</p>
                </div>
                <div className="w-full space-y-2">
                  {suggestions.map((suggestion, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ x: 4, backgroundColor: 'rgba(6, 182, 212, 0.1)' }}
                      onClick={() => handleSendMessage(suggestion)}
                      className="block w-full text-left text-xs text-slate-300 p-3 rounded-lg border border-blue-500/20 hover:border-cyan-400/50 transition-all"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                          : 'bg-slate-800 text-slate-100 border border-blue-500/20'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-slate-800 border border-blue-500/20 rounded-xl px-4 py-3 flex gap-1.5">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-cyan-400 rounded-full"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ delay: i * 0.15, duration: 0.6, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="h-14 border-t border-blue-500/20 p-2.5 bg-slate-900/50 backdrop-blur-md flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleSendMessage(input);
                  }
                }}
                placeholder="Savol berish..."
                className="flex-1 px-3 py-2 bg-slate-800 border border-blue-500/20 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
                disabled={isLoading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
