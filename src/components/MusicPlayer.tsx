import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Howl, Howler } from 'howler';
import { Song, songs } from '../data/songs';

interface MusicPlayerProps {
  currentSong: Song | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ currentSong, onClose, onNext, onPrev }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  const soundRef = useRef<Howl | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!currentSong) return;

    if (soundRef.current) {
      soundRef.current.unload();
    }

    soundRef.current = new Howl({
      src: [currentSong.audio],
      html5: true, // Force HTML5 Audio to stream (better for large files)
      volume: isMuted ? 0 : volume,
      onplay: () => {
        setIsPlaying(true);
        updateProgress();
      },
      onpause: () => {
        setIsPlaying(false);
        cancelAnimationFrame(rafRef.current!);
      },
      onend: () => {
        setIsPlaying(false);
        onNext();
      }
    });

    soundRef.current.play();

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [currentSong]);

  useEffect(() => {
    Howler.volume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  const updateProgress = () => {
    if (soundRef.current && soundRef.current.playing()) {
      const seek = soundRef.current.seek() as number;
      const duration = soundRef.current.duration();
      setProgress((seek / duration) * 100);
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const togglePlay = () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!soundRef.current) return;
    const value = parseFloat(e.target.value);
    const duration = soundRef.current.duration();
    soundRef.current.seek((value / 100) * duration);
    setProgress(value);
  };

  if (!currentSong) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ y: 30, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full sm:w-[90%] max-w-md pointer-events-auto"
        >
          <div className="glass rounded-[2rem] p-4 md:p-6 relative overflow-y-auto max-h-[90dvh] scrollbar-hide shadow-2xl">
          {/* Dynamic background glow based on song color */}
          <div 
            className="absolute inset-0 opacity-20 blur-3xl transition-colors duration-1000"
            style={{ backgroundColor: currentSong.color }}
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Album Artwork */}
            <motion.div 
              className="w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden mb-4 md:mb-6 border-[3px] md:border-4 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ boxShadow: `0 0 40px ${currentSong.color}40` }}
            >
              <img 
                src={currentSong.cover} 
                alt={currentSong.title} 
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Song Info */}
            <div className="text-center mb-2 md:mb-4">
              <h3 className="text-lg md:text-xl font-medium text-white mb-0.5 md:mb-1">{currentSong.title}</h3>
              <p className="text-xs md:text-sm text-white/60">{currentSong.artist}</p>
            </div>

            {/* Love Message */}
            <p className="text-[10px] md:text-xs text-white/80 italic text-center mb-4 md:mb-6 h-8 px-2 md:px-4 font-light leading-tight">
              "{currentSong.message}"
            </p>

            {/* Progress Bar */}
            <div className="w-full mb-4 md:mb-6 group px-2">
              <input
                type="range"
                min="0"
                max="100"
                value={progress || 0}
                onChange={handleSeek}
                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-150 transition-all"
                style={{
                  background: `linear-gradient(to right, ${currentSong.color} ${progress}%, rgba(255,255,255,0.2) ${progress}%)`
                }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between w-full px-2 md:px-4 mt-2">
              <button onClick={() => setIsMuted(!isMuted)} className="text-white/50 hover:text-white transition-colors p-2">
                {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
              
              <div className="flex items-center gap-4 md:gap-6">
                <button onClick={onPrev} className="text-white hover:text-pink-300 transition-colors p-2">
                  <SkipBack className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                </button>
                
                <button 
                  onClick={togglePlay} 
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 shadow-lg"
                >
                  {isPlaying ? 
                    <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current text-white" /> : 
                    <Play className="w-5 h-5 md:w-6 md:h-6 fill-current text-white ml-1" />
                  }
                </button>
                
                <button onClick={onNext} className="text-white hover:text-pink-300 transition-colors p-2">
                  <SkipForward className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                </button>
              </div>

              {/* Close button that looks like a minimize */}
              <button onClick={onClose} className="text-white/50 hover:text-white transition-colors text-[10px] md:text-xs uppercase tracking-widest p-2">
                Close
              </button>
            </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
