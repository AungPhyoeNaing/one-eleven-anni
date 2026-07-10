import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Galaxy } from './components/Galaxy';
import { MusicPlayer } from './components/MusicPlayer';
import { LoveLetter } from './components/LoveLetter';
import { Song, songs } from './data/songs';

function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [secretClickCount, setSecretClickCount] = useState(0);

  const handlePhotoClick = () => {
    const newCount = secretClickCount + 1;
    setSecretClickCount(newCount);
    if (newCount >= 5) {
      setIsLetterOpen(true);
      setIsPhotoOpen(false);
      setSecretClickCount(0);
    }
  };

  const handleNextSong = () => {
    if (!activeSong) return;
    const currentIndex = songs.findIndex(s => s.id === activeSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setActiveSong(songs[nextIndex]);
  };

  const handlePrevSong = () => {
    if (!activeSong) return;
    const currentIndex = songs.findIndex(s => s.id === activeSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setActiveSong(songs[prevIndex]);
  };

  return (
    <div className="w-full h-[100dvh] bg-cosmic-dark overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!hasEntered ? (
          <WelcomeScreen key="welcome" onEnter={() => setHasEntered(true)} />
        ) : (
          <React.Fragment key="universe">
            {/* 3D Galaxy Scene */}
            <Galaxy 
              onPlanetClick={setActiveSong} 
              activeSong={activeSong} 
              onCenterClick={() => setIsPhotoOpen(true)}
            />
            
            {/* Photo Modal */}
            <AnimatePresence>
              {isPhotoOpen && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-2xl bg-cosmic-dark/80"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  onClick={() => setIsPhotoOpen(false)}
                >
                  <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -20, filter: 'blur(20px)' }}
                    animate={{ scale: 1, opacity: 1, rotate: 0, filter: 'blur(0px)' }}
                    exit={{ scale: 1.5, opacity: 0, rotate: 10, filter: 'blur(20px)' }}
                    transition={{ type: "spring", stiffness: 80, damping: 20, mass: 1 }}
                    className="relative max-w-2xl w-full flex justify-center items-center"
                    onClick={(e) => { e.stopPropagation(); handlePhotoClick(); }}
                  >
                    {/* Magical Cosmic Aura behind the image */}
                    <motion.div 
                      className="absolute w-[120%] h-[120%] max-w-[80vh] max-h-[80vh] -z-10 rounded-full blur-[80px] bg-gradient-to-tr from-pink-500/40 via-purple-500/30 to-blue-500/40"
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.1, 0.9, 1],
                      }}
                      transition={{ 
                        duration: 12,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />

                    <motion.img 
                      src="/images/central-star-photo.jpg" 
                      alt="Jia" 
                      className="max-h-[80vh] w-auto rounded-3xl shadow-[0_0_80px_rgba(255,105,180,0.5)] border border-pink-300/40 object-contain cursor-pointer relative z-10"
                      whileHover={{ scale: 1.02, shadow: "0 0 150px rgba(255,105,180,0.8)" }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsPhotoOpen(false); }}
                      className="absolute top-2 right-2 md:-top-4 md:-right-4 w-10 h-10 bg-black/50 hover:bg-pink-500/80 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors border border-white/20 z-20"
                    >
                      ✕
                    </button>
                    {secretClickCount > 0 && secretClickCount < 5 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/90 font-medium tracking-wide text-sm bg-pink-500/40 px-6 py-2 rounded-full backdrop-blur-xl border border-pink-300/30 shadow-[0_0_20px_rgba(255,105,180,0.5)] z-20 pointer-events-none"
                      >
                        {5 - secretClickCount} more...
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* UI Overlay */}
            <div className="absolute top-6 w-full flex justify-center pointer-events-none z-10">
              <div className="glass px-6 py-2 rounded-full pointer-events-auto opacity-70 hover:opacity-100 transition-opacity">
                <p className="text-white/80 text-sm font-light tracking-wide">
                  Explore APN & JIA's Galaxy ✨
                </p>
              </div>
            </div>

            {/* Music Player */}
            <MusicPlayer 
              currentSong={activeSong}
              onClose={() => setActiveSong(null)}
              onNext={handleNextSong}
              onPrev={handlePrevSong}
            />

            {/* Secret Love Letter */}
            <LoveLetter 
              isOpen={isLetterOpen}
              onClose={() => setIsLetterOpen(false)}
            />
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
