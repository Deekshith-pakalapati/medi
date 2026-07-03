import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

export const useReminders = () => {
  const { getToken } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [lastTriggered, setLastTriggered] = useState({});

  useEffect(() => {
    const fetchMeds = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/medicines`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setMedicines(data);
      } catch (err) {
        console.error("Failed to fetch medicines for reminders:", err);
      }
    };
    
    fetchMeds();
    const interval = setInterval(fetchMeds, 5 * 60 * 1000); // refresh every 5 mins
    return () => clearInterval(interval);
  }, [getToken]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;
      
      medicines.forEach(med => {
        if (med.reminderTimes.includes(currentTime)) {
          const triggerKey = `${med._id}-${currentTime}-${now.getDate()}`;
          if (!lastTriggered[triggerKey]) {
            // Trigger reminder
            toast((t) => (
              <div className="flex flex-col gap-2">
                <span className="font-bold text-gray-900">Time for {med.name}</span>
                <span className="text-sm text-gray-600">Dosage: {med.dosage}</span>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => {
                    toast.dismiss(t.id);
                    // Add mark as taken logic here
                  }} className="bg-green-500 text-white px-3 py-1 rounded shadow text-sm">Taken</button>
                  <button onClick={() => toast.dismiss(t.id)} className="bg-gray-200 text-gray-700 px-3 py-1 rounded shadow text-sm">Snooze</button>
                </div>
              </div>
            ), { duration: 30000, position: 'top-center' });

            // Voice synthesis
            const synth = window.speechSynthesis;
            const textEnglish = `Hello. It is time to take your medicine. Please take ${med.name} now.`;
            const textTelugu = `నమస్కారం. మీ మందు వేసుకునే సమయం వచ్చింది. దయచేసి ఇప్పుడు మీ ${med.name} తీసుకోండి.`;
            
            // We will speak both based on user request (Multilingual)
            const uEn = new SpeechSynthesisUtterance(textEnglish);
            uEn.lang = 'en-US';
            const uTe = new SpeechSynthesisUtterance(textTelugu);
            uTe.lang = 'te-IN';
            
            synth.speak(uEn);
            setTimeout(() => { synth.speak(uTe); }, 1000); // small delay

            setLastTriggered(prev => ({ ...prev, [triggerKey]: true }));
            
            // Also browser notification
            if (Notification.permission === 'granted') {
              new Notification(`MediCare: Time for ${med.name}`, {
                body: `Dosage: ${med.dosage}`,
              });
            }
          }
        }
      });
    };

    const intervalId = setInterval(checkReminders, 30000); // check every 30s
    return () => clearInterval(intervalId);
  }, [medicines, lastTriggered]);
};
