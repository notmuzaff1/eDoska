import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, ChevronLeft, Search, ExternalLink, Home, Play } from 'lucide-react';

interface BrowserModeProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_LINKS = [
  {
    name: 'YouTube',
    url: 'https://www.youtube.com',
    embedPattern: (id: string) => `https://www.youtube.com/embed/${id}?autoplay=1`,
    icon: '🎥',
    desc: 'Educational videos',
    embeddable: false,
  },
  {
    name: 'Khan Academy',
    url: 'https://www.khanacademy.org',
    icon: '🎓',
    desc: 'Free courses & lessons',
    embeddable: false,
  },
  {
    name: 'Wikipedia',
    url: 'https://www.wikipedia.org',
    icon: '📚',
    desc: 'Free encyclopedia',
    embeddable: false,
  },
  {
    name: 'Google Docs',
    url: 'https://docs.google.com',
    icon: '📄',
    desc: 'Create documents',
    embeddable: false,
  },
  {
    name: 'Google Search',
    url: 'https://www.google.com/webhp?igu=1',
    icon: '🔍',
    desc: 'Search the web',
    embeddable: true,
  },
  {
    name: 'TED Talks',
    url: 'https://www.ted.com',
    icon: '💡',
    desc: 'Ideas worth spreading',
    embeddable: false,
  },
  {
    name: 'Coursera',
    url: 'https://www.coursera.org',
    icon: '🏛️',
    desc: 'Online courses',
    embeddable: false,
  },
  {
    name: 'Codecademy',
    url: 'https://www.codecademy.com',
    icon: '💻',
    desc: 'Learn to code',
    embeddable: false,
  },
];

const APPROVED_VIDEOS = [
  { title: 'Calculus 1 - Full Course', channel: 'freeCodeCamp', duration: '2:35:00', videoId: 'WsQQvHm4lSw', subject: 'Math' },
  { title: 'Physics - Mechanics', channel: 'Crash Course', duration: '45:20', videoId: 'ZM8ECpBuQYE', subject: 'Science' },
  { title: 'Chemistry Basics', channel: 'Khan Academy', duration: '52:55', videoId: 'yQP4uxJANSs', subject: 'Science' },
  { title: 'Biology - Cell Structure', channel: 'Amoeba Sisters', duration: '38:15', videoId: 'QnQe0xW_JY4', subject: 'Science' },
  { title: 'English Literature Analysis', channel: 'TED-Ed', duration: '42:30', videoId: '7YPVvMKOZ9I', subject: 'Literature' },
  { title: 'World History Overview', channel: 'Crash Course', duration: '1:05:00', videoId: 'x0C7r1YH0kE', subject: 'History' },
  { title: 'Programming Fundamentals', channel: 'freeCodeCamp', duration: '55:40', videoId: 'zOjov-2OZ0E', subject: 'CS' },
  { title: 'Algebra Fundamentals', channel: 'Khan Academy', duration: '45:32', videoId: 'dQw4w9WgXcQ', subject: 'Math' },
  { title: 'Derivatives Explained', channel: '3Blue1Brown', duration: '28:15', videoId: 'HfACrKJ_Y2w', subject: 'Math' },
  { title: 'The Art of Problem Solving', channel: 'TED', duration: '18:30', videoId: 'riXcZT2ICjA', subject: 'Math' },
];

export const BrowserMode: React.FC<BrowserModeProps> = ({ isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState<'home' | 'video' | 'link' | 'search'>('home');
  const [selectedVideo, setSelectedVideo] = useState<typeof APPROVED_VIDEOS[0] | null>(null);
  const [selectedLink, setSelectedLink] = useState<typeof QUICK_LINKS[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentView('home');
      setSelectedVideo(null);
      setSelectedLink(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  const openVideo = (video: typeof APPROVED_VIDEOS[0]) => {
    setSelectedVideo(video);
    setCurrentView('video');
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), `video:${video.videoId}`]);
    setHistoryIndex((prev) => prev + 1);
  };

  const openLink = (link: typeof QUICK_LINKS[0]) => {
    setSelectedLink(link);
    setCurrentView('link');
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), link.url]);
    setHistoryIndex((prev) => prev + 1);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const entry = history[newIndex];
      if (entry.startsWith('video:')) {
        const videoId = entry.replace('video:', '');
        const video = APPROVED_VIDEOS.find((v) => v.videoId === videoId);
        if (video) {
          setSelectedVideo(video);
          setCurrentView('video');
        } else {
          setCurrentView('home');
        }
      } else {
        setCurrentView('link');
      }
    } else {
      setCurrentView('home');
    }
  };

  const goHome = () => {
    setCurrentView('home');
    setSelectedVideo(null);
    setSelectedLink(null);
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      openInNewTab(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950 z-50 flex flex-col"
        >
          {/* Header */}
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="h-14 border-b border-blue-500/20 px-4 flex items-center justify-between bg-slate-900/50 backdrop-blur-md flex-shrink-0"
          >
            <div className="flex items-center gap-2">
              <button onClick={goBack} disabled={currentView === 'home'} className="p-1.5 hover:bg-slate-800 rounded-lg transition-all disabled:opacity-30">
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
              <button onClick={goHome} className="p-1.5 hover:bg-slate-800 rounded-lg transition-all">
                <Home className="w-4 h-4 text-slate-400" />
              </button>
              <Globe className="w-5 h-5 text-cyan-400 ml-2" />
              <h2 className="text-lg font-bold text-white">
                {currentView === 'home' ? 'Browser' : currentView === 'video' ? 'Video Player' : selectedLink?.name || 'Browser'}
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-slate-400" />
            </motion.button>
          </motion.div>

          {/* Search bar */}
          <div className="h-12 border-b border-blue-500/20 px-4 flex items-center gap-2 bg-slate-900/30 backdrop-blur-md flex-shrink-0">
            <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-transparent text-white text-sm outline-none"
              placeholder="Search or enter URL..."
            />
            <button
              onClick={handleSearch}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-semibold"
            >
              Search
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {currentView === 'home' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-6">
                {/* Approved Videos */}
                <div className="max-w-5xl mx-auto mb-8">
                  <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Play className="w-5 h-5 text-red-400" />
                    Teacher-Approved Videos
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">Educational videos approved by your teacher</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {APPROVED_VIDEOS.map((video) => (
                      <motion.button
                        key={video.videoId}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openVideo(video)}
                        className="bg-slate-800/60 border border-blue-500/20 rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all text-left group"
                      >
                        <div className="relative h-36 bg-slate-700">
                          <img
                            src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:opacity-80 transition-all"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/480x360/1e293b/64748b?text=Video'; }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all">
                            <div className="w-12 h-12 rounded-full bg-red-500/90 flex items-center justify-center">
                              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-xs text-white">
                            {video.duration}
                          </div>
                          <div className="absolute top-2 left-2 bg-cyan-500/80 px-2 py-0.5 rounded text-xs text-white font-medium">
                            {video.subject}
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-semibold text-white line-clamp-2">{video.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{video.channel}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="max-w-5xl mx-auto">
                  <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    Quick Links
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">Educational websites (opens in new tab)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {QUICK_LINKS.map((link) => (
                      <motion.button
                        key={link.url}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openLink(link)}
                        className="bg-slate-800/60 border border-blue-500/20 rounded-xl p-4 hover:border-cyan-400/50 transition-all text-left"
                      >
                        <div className="text-3xl mb-2">{link.icon}</div>
                        <p className="text-sm font-semibold text-white">{link.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{link.desc}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentView === 'video' && selectedVideo && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                <div className="flex-1 bg-black flex items-center justify-center">
                  <iframe
                    ref={iframeRef}
                    src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedVideo.title}
                  />
                </div>
                <div className="p-4 bg-slate-900/50 border-t border-blue-500/20">
                  <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{selectedVideo.title}</h3>
                      <p className="text-sm text-slate-400">{selectedVideo.channel} • {selectedVideo.duration}</p>
                    </div>
                    <button
                      onClick={() => openInNewTab(`https://www.youtube.com/watch?v=${selectedVideo.videoId}`)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm flex items-center gap-2 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open on YouTube
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentView === 'link' && selectedLink && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center p-6">
                <div className="text-center max-w-md">
                  <div className="text-6xl mb-4">{selectedLink.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedLink.name}</h3>
                  <p className="text-slate-400 mb-6">{selectedLink.desc}</p>
                  <p className="text-sm text-slate-500 mb-6">
                    This website cannot be displayed inside the browser for security reasons. Click below to open it in a new tab.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openInNewTab(selectedLink.url)}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open {selectedLink.name}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={goHome}
                      className="px-6 py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition-all"
                    >
                      Go Home
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="h-8 border-t border-blue-500/20 px-4 flex items-center justify-between text-xs text-slate-500 bg-slate-900/30 flex-shrink-0">
            <span>
              {currentView === 'home' ? 'Ready' : currentView === 'video' ? `Playing: ${selectedVideo?.title}` : selectedLink?.url}
            </span>
            <span>YouTube videos play inside • Other sites open in new tab</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
