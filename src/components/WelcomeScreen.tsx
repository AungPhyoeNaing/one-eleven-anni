import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-cosmic-dark bg-cosmic-gradient"
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Simple CSS stars for welcome screen background */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random(),
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="glass rounded-3xl p-6 md:p-10 w-[90vw] md:max-w-md mx-auto text-center relative z-10 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cosmic-pink to-transparent opacity-50" />
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light mb-4 text-glow tracking-wide">
          Welcome to <br />
          <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-400">
            APN & JIA's Galaxy
          </span>
        </h1>
        
        <p className="text-white/70 mb-8 md:mb-10 text-sm md:text-base leading-relaxed px-2">
          A tiny galaxy made with three songs,<br />
          one heart, and countless memories.
        </p>

        <motion.button
          onClick={onEnter}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass-button px-8 py-4 w-full text-lg font-medium tracking-wide flex items-center justify-center gap-2 group hover:shadow-[0_0_20px_rgba(182,104,152,0.4)] hover:border-cosmic-pink/50"
        >
          Enter Galaxy 
          <Sparkles className="w-5 h-5 text-pink-300 group-hover:animate-pulse" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
