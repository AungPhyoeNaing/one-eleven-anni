import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';

interface LoveLetterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoveLetter: React.FC<LoveLetterProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass rounded-3xl max-w-lg w-[95%] sm:w-full p-6 md:p-8 relative overflow-hidden"
          >
            {/* Glowing orb effect in background */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="relative z-10 mt-2">
              <h2 className="text-xl md:text-2xl font-light mb-4 md:mb-6 text-pink-200 font-serif italic">Dear Jia,</h2>
              
              <div className="space-y-3 md:space-y-4 text-sm md:text-base text-white/80 leading-relaxed font-light">
                <p>
                  I created this little universe because sometimes
                  three songs can hold thousands of feelings.
                </p>
                <p>
                  Every time you listen to these songs,
                  I hope you remember that someone is always
                  cheering for your happiness.
                </p>
              </div>

              <div className="mt-8 flex flex-col items-center gap-4">
                <Heart className="w-8 h-8 text-pink-400 fill-pink-400/20 animate-pulse" />
                <p className="text-sm text-white/50 tracking-widest uppercase">
                  Made with love by Ko Ko APN
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
