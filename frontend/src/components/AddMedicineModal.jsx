import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { X, Clock, Plus, Calendar, FileText, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddMedicineModal = ({ isOpen, onClose, onAdd }) => {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Daily',
    times: [{ hour: '08', minute: '00', period: 'AM' }],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  });

  const handleAddTime = () => {
    setFormData({ ...formData, times: [...formData.times, { hour: '12', minute: '00', period: 'PM' }] });
  };

  const handleRemoveTime = (index) => {
    if (formData.times.length === 1) return;
    const newTimes = formData.times.filter((_, i) => i !== index);
    setFormData({ ...formData, times: newTimes });
  };

  const handleTimeChange = (index, field, value) => {
    const newTimes = [...formData.times];
    newTimes[index][field] = value;
    setFormData({ ...formData, times: newTimes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await getToken();
    
    // Convert custom AM/PM to HH:MM 24-hour format for the backend
    const reminderTimes = formData.times.map(t => {
      let h = parseInt(t.hour, 10);
      if (t.period === 'PM' && h !== 12) h += 12;
      if (t.period === 'AM' && h === 12) h = 0;
      return `${h.toString().padStart(2, '0')}:${t.minute}`;
    });

    const payload = {
      ...formData,
      reminderTimes
    };
    
    if (!payload.endDate) {
      delete payload.endDate;
    }
    delete payload.times;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/medicines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      const newMed = await res.json();
      onAdd(newMed);
      onClose();
      // Reset
      setFormData({
        name: '',
        dosage: '',
        frequency: 'Daily',
        times: [{ hour: '08', minute: '00', period: 'AM' }],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: ''
      });
    } else {
      console.error('Failed to add medicine');
    }
  };

  const hours = Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-md" 
            onClick={onClose}
          ></motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative glass-card rounded-3xl w-full max-w-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-[#111] dark:text-white">New Routine</h2>
              <button type="button" onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-black dark:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111]/60 dark:text-white/60 mb-2">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white dark:bg-[#111] text-[#111] dark:text-white px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors font-medium"
                    placeholder="e.g. Vitamin D"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#111]/60 dark:text-white/60 mb-2">Dosage</label>
                    <input
                      type="text"
                      required
                      value={formData.dosage}
                      onChange={e => setFormData({...formData, dosage: e.target.value})}
                      className="w-full bg-white dark:bg-[#111] text-[#111] dark:text-white px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors font-medium"
                      placeholder="e.g. 1 Pill"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#111]/60 dark:text-white/60 mb-2">Frequency</label>
                    <select
                      value={formData.frequency}
                      onChange={e => setFormData({...formData, frequency: e.target.value})}
                      className="w-full bg-white dark:bg-[#1a1a1a] text-[#111] dark:text-white px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors font-medium appearance-none"
                    >
                      <option className="bg-white dark:bg-[#1a1a1a] text-[#111] dark:text-white">Daily</option>
                      <option className="bg-white dark:bg-[#1a1a1a] text-[#111] dark:text-white">Weekly</option>
                      <option className="bg-white dark:bg-[#1a1a1a] text-[#111] dark:text-white">As needed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#111]/60 dark:text-white/60 mb-2">Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111]/40 dark:text-white/40 pointer-events-none" />
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                        className="w-full bg-white dark:bg-[#111] text-[#111] dark:text-white pl-10 pr-4 py-3 rounded-xl border border-black/10 dark:border-white/10 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors font-medium relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#111]/60 dark:text-white/60 mb-2">End Date (Optional)</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111]/40 dark:text-white/40 pointer-events-none" />
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={e => setFormData({...formData, endDate: e.target.value})}
                        className="w-full bg-white dark:bg-[#111] text-[#111] dark:text-white pl-10 pr-4 py-3 rounded-xl border border-black/10 dark:border-white/10 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors font-medium relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111]/60 dark:text-white/60 mb-3">Reminder Times (AM/PM)</label>
                  <div className="space-y-3">
                    {formData.times.map((time, idx) => (
                      <div key={idx} className="flex flex-wrap md:flex-nowrap items-center gap-2">
                        <div className="flex flex-1 items-center bg-white dark:bg-[#1a1a1a] rounded-xl border border-black/10 dark:border-white/10 overflow-hidden focus-within:border-indigo-500 transition-colors">
                          <div className="pl-3 pr-2 py-3 bg-black/5 dark:bg-white/5 border-r border-black/5 dark:border-white/5 shrink-0">
                            <Clock className="w-4 h-4 text-[#111] dark:text-white opacity-40" />
                          </div>
                          
                          <select 
                            value={time.hour} 
                            onChange={e => handleTimeChange(idx, 'hour', e.target.value)}
                            className="flex-1 min-w-0 bg-white dark:bg-[#1a1a1a] text-[#111] dark:text-white px-2 py-3 font-medium outline-none appearance-none text-center cursor-pointer"
                          >
                            {hours.map(h => <option key={h} value={h} className="bg-white dark:bg-[#1a1a1a] text-[#111] dark:text-white">{h}</option>)}
                          </select>
                          <span className="text-[#111] dark:text-white opacity-30 font-bold shrink-0">:</span>
                          <select 
                            value={time.minute} 
                            onChange={e => handleTimeChange(idx, 'minute', e.target.value)}
                            className="flex-1 min-w-0 bg-white dark:bg-[#1a1a1a] text-[#111] dark:text-white px-2 py-3 font-medium outline-none appearance-none text-center cursor-pointer"
                          >
                            {minutes.map(m => <option key={m} value={m} className="bg-white dark:bg-[#1a1a1a] text-[#111] dark:text-white">{m}</option>)}
                          </select>
                          <div className="h-8 w-px bg-black/10 dark:bg-white/10 shrink-0"></div>
                          <select 
                            value={time.period} 
                            onChange={e => handleTimeChange(idx, 'period', e.target.value)}
                            className="flex-1 min-w-0 bg-white dark:bg-[#1a1a1a] text-[#111] dark:text-white px-3 py-3 font-bold outline-none appearance-none text-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            <option value="AM" className="bg-white dark:bg-[#1a1a1a] text-[#111] dark:text-white">AM</option>
                            <option value="PM" className="bg-white dark:bg-[#1a1a1a] text-[#111] dark:text-white">PM</option>
                          </select>
                        </div>
                        
                        {formData.times.length > 1 && (
                          <button type="button" onClick={() => handleRemoveTime(idx)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors shrink-0">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                        {idx === formData.times.length - 1 && (
                          <button type="button" onClick={handleAddTime} className="p-3 bg-[#111] dark:bg-white text-white dark:text-black rounded-xl hover:opacity-90 transition-opacity shrink-0">
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111]/60 dark:text-white/60 mb-2">Instructions / Notes (Optional)</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-4 w-4 h-4 text-[#111]/40 dark:text-white/40 pointer-events-none" />
                    <textarea
                      rows="2"
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                      className="w-full bg-white dark:bg-[#111] text-[#111] dark:text-white pl-10 pr-4 py-3 rounded-xl border border-black/10 dark:border-white/10 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors font-medium resize-none"
                      placeholder="e.g. Take with food"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-4 rounded-xl text-white dark:text-black font-semibold bg-[#111] dark:bg-white hover:opacity-90 transition-opacity shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.12)]">
                  Save Routine
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddMedicineModal;
