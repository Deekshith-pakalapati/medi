import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';

export const useReminders = () => {
  const { getToken } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [activeAlarm, setActiveAlarm] = useState(null);
  
  const activeAlarmRef = useRef(activeAlarm);
  activeAlarmRef.current = activeAlarm;

  const medicinesRef = useRef([]);
  useEffect(() => {
    medicinesRef.current = medicines;
  }, [medicines]);

  useEffect(() => {
    const fetchMeds = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/medicines`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMedicines(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch medicines for reminders:", err);
      }
    };
    
    fetchMeds();
    
    // Refresh every 10 seconds to catch changes made in other components quickly
    const interval = setInterval(fetchMeds, 10000); 
    
    // Listen for custom event from Dashboard to refresh instantly
    const handleRefresh = () => fetchMeds();
    window.addEventListener('refreshMedicines', handleRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshMedicines', handleRefresh);
    };
  }, [getToken]);

  useEffect(() => {
    let intervalId;

    const checkReminders = () => {
      const currentMeds = medicinesRef.current;
      if (currentMeds.length === 0) return;

      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;
      const todayDate = now.toISOString().split('T')[0];

      if (activeAlarmRef.current) return;

      for (const med of currentMeds) {
        if (med.reminderTimes && med.reminderTimes.includes(currentTime)) {
          const alreadyTaken = (med.takenLogs || []).some(log => log.date === todayDate && log.time === currentTime);
          if (!alreadyTaken) {
            setActiveAlarm({ medicine: med, time: currentTime });
            break;
          }
        }
      }
    };

    // Initial check
    checkReminders();

    // Check exactly on the minute mark
    const now = new Date();
    const delayToNextMinute = (60 - now.getSeconds()) * 1000;
    
    const timeoutId = setTimeout(() => {
      checkReminders();
      intervalId = setInterval(checkReminders, 60000);
    }, delayToNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []); // Run check loop only once on mount

  const handleMarkTaken = async () => {
    if (!activeAlarm) return;
    try {
      const token = await getToken();
      const todayDate = new Date().toISOString().split('T')[0];
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/medicines/${activeAlarm.medicine._id}/take`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
         body: JSON.stringify({ date: todayDate, time: activeAlarm.time })
      });
      if (res.ok) {
         setActiveAlarm(null);
         window.speechSynthesis?.cancel();
         
         // update local state
         setMedicines(prev => prev.map(m => {
            if (m._id === activeAlarm.medicine._id) {
               return { ...m, takenLogs: [...(m.takenLogs||[]), { date: todayDate, time: activeAlarm.time }] };
            }
            return m;
         }));
      }
    } catch (e) {
      console.error('Failed to mark taken', e);
    }
  };

  const dismissAlarm = () => {
    setActiveAlarm(null);
    window.speechSynthesis?.cancel();
  };

  return { activeAlarm, handleMarkTaken, dismissAlarm, setMedicines };
};
