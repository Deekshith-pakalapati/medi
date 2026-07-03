import { useEffect, useRef } from 'react';
import { useReminders } from '../hooks/useReminders';
import { Bell, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalAlertBanner = () => {
  const { activeAlarm, handleMarkTaken, dismissAlarm } = useReminders();

  const audioRef = useRef(null);

  useEffect(() => {
    if (activeAlarm) {
      const playVoiceAlert = async () => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        const med = activeAlarm.medicine;
        const textEnglish = `It is time to take your medicine. Please take ${med.name} now.`;
        const textTelugu = `మీ ${med.name} వేసుకునే సమయం అయింది. దయచేసి నిర్ధారించండి.`;

        try {
          // Play Telugu first using Google Translate TTS
          const teUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=te&client=tw-ob&q=${encodeURIComponent(textTelugu)}`;
          const teAudio = new Audio(teUrl);
          audioRef.current = teAudio;
          
          await new Promise(resolve => {
            teAudio.onended = resolve;
            teAudio.onerror = resolve;
            teAudio.play().catch(resolve);
          });

          // Wait 2 seconds
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Play English
          const enUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(textEnglish)}`;
          const enAudio = new Audio(enUrl);
          audioRef.current = enAudio;
          
          await new Promise(resolve => {
            enAudio.onended = resolve;
            enAudio.onerror = resolve;
            enAudio.play().catch(resolve);
          });
        } catch (e) {
          console.error("Failed to play audio alert", e);
        }
      };

      playVoiceAlert();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
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
