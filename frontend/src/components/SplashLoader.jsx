import { motion } from 'framer-motion';

const SplashLoader = () => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 flex items-center justify-center bg-white dark:bg-[#09090b] z-[9999]"
    >
      <div className="relative flex items-center justify-center">
        {/* Core Logo */}
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, type: "spring", bounce: 0.5 }}
          className="relative z-10 w-16 h-16 rounded-full bg-[#111] dark:bg-white flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
        >
          <span className="text-3xl font-extrabold text-white dark:text-black">M</span>
        </motion.div>
        
        {/* Advanced Rotating/Pulsing Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-12px] rounded-full border-t-2 border-l-2 border-transparent border-t-[#111] border-l-[#111]/50 dark:border-t-white dark:border-l-white/50 opacity-70"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-24px] rounded-full border-b-2 border-r-2 border-transparent border-b-[#111]/50 border-r-[#111]/20 dark:border-b-white/50 dark:border-r-white/20 opacity-50"
        />
        
        {/* Ambient Glow (Dark mode only usually, but subtle in light mode) */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-black dark:bg-white blur-[50px] rounded-full -z-10"
        />
      </div>
    </motion.div>
  );
};

export default SplashLoader;
