import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-between w-16 h-8 p-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 overflow-hidden cursor-pointer transition-colors duration-500"
      aria-label="Toggle Theme"
    >
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun size={14} className="text-gray-400 dark:text-gray-500" />
        <Moon size={14} className="text-gray-400 dark:text-gray-500" />
      </div>
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className="z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-black shadow-[0_2px_8px_rgb(0,0,0,0.1)] dark:shadow-[0_2px_8px_rgb(255,255,255,0.2)]"
        style={{
          marginLeft: isDarkMode ? 'auto' : '0'
        }}
      >
        {isDarkMode ? (
          <Moon size={12} className="text-white dark:text-white" />
        ) : (
          <Sun size={12} className="text-black" />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
