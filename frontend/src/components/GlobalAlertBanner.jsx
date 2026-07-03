import { useEffect } from 'react';
import { useReminders } from '../hooks/useReminders';
import { Bell, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalAlertBanner = () => {
  const { activeAlarm, handleMarkTaken, dismissAlarm } = useReminders();

  useEffect(() => {
    if (activeAlarm) {
      const playVoiceAlert = () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel(); // clear previous
          
          const med = activeAlarm.medicine;
          const textEnglish = `It is time to take your medicine. Please take ${med.name} now.`;

          const uEn = new SpeechSynthesisUtterance(textEnglish);
          uEn.lang = 'en-US';
          uEn.rate = 0.9;
          uEn.pitch = 1.1;

          // Play English
          window.speechSynthesis.speak(uEn);
        }
      };

      playVoiceAlert();
    } else {
      window.speechSynthesis?.cancel();
    }
  }, [activeAlarm]);

  return (
    <AnimatePresence>
      {activeAlarm && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-0 left-0 right-0 z-[9999] flex justify-center p-4 pointer-events-none"
        >
          <div className="bg-white dark:bg-[#111] pointer-events-auto border border-indigo-500/30 shadow-2xl rounded-2xl p-4 max-w-xl w-full flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shrink-0 animate-pulse shadow-lg shadow-indigo-500/30">
              <Bell className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-[#111] dark:text-white truncate">Time for {activeAlarm.medicine.name}</h2>
              <p className="text-sm font-bold text-indigo-500 truncate">{activeAlarm.medicine.dosage}</p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={handleMarkTaken}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-sm bg-green-500 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30"
              >
                <CheckCircle2 className="w-4 h-4" /> Taken
              </button>
              <button 
                onClick={dismissAlarm}
                className="px-4 py-2 rounded-xl text-[#111] dark:text-white font-bold text-sm bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
              >
                Snooze
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalAlertBanner;
