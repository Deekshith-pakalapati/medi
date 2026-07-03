import { useState, useEffect } from 'react';
import { useAuth, UserButton } from '@clerk/clerk-react';
import { Bell, Activity, LayoutDashboard, CalendarDays, AlertCircle, Loader2, Clock, CheckCircle2, FileText, Pill, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const MenteeDashboard = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [parentName, setParentName] = useState('Patient');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) { setError('Not authenticated'); setLoading(false); return; }

        const userRes = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!userRes.ok) throw new Error(`Server error ${userRes.status}`);
        const userData = await userRes.json();
        setUser(userData);

        if (!userData.linkedParentId) {
          setError('No patient linked. Please enter their invite code on the dashboard.');
          setLoading(false);
          return;
        }

        // Fetch medicines using type=linked parameter
        const medRes = await fetch(`${import.meta.env.VITE_API_URL}/medicines?type=linked`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (medRes.ok) {
          const medData = await medRes.json();
          setMedicines(Array.isArray(medData) ? medData : []);
          
          if (medData.length > 0 && medData[0].parentId?.name) {
             setParentName(medData[0].parentId.name);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#000000]">
        <Loader2 className="w-8 h-8 animate-spin text-black/30 dark:text-white/30" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white dark:bg-[#000000]">
        <div className="glass-card rounded-3xl p-12 max-w-sm text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 text-[#111] dark:text-white">Access Error</h2>
          <p className="text-[#111]/60 dark:text-white/60 font-medium text-sm mb-6">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 rounded-xl text-white bg-[#111] dark:bg-white dark:text-black font-semibold hover:opacity-90 transition-opacity">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isDualRole = user?.role === 'Parent';

  // Calculate Adherence
  let totalDosesToday = 0;
  let takenDosesToday = 0;
  const todayDate = new Date().toISOString().split('T')[0];

  medicines.forEach(med => {
    totalDosesToday += (med.reminderTimes || []).length;
    takenDosesToday += (med.takenLogs || []).filter(log => log.date === todayDate).length;
  });

  const adherenceScore = totalDosesToday === 0 ? 100 : Math.round((takenDosesToday / totalDosesToday) * 100);

  // Sort schedule for timeline
  const schedule = medicines.flatMap(med => 
    (med.reminderTimes || []).map(time => ({ ...med, time }))
  ).sort((a, b) => a.time.localeCompare(b.time));

  // Calculate Next Dose
  const upcomingDoses = schedule.filter(item => {
    const isTaken = (item.takenLogs || []).some(log => log.date === todayDate && log.time === item.time);
    return !isTaken;
  });
  const nextDose = upcomingDoses.length > 0 ? upcomingDoses[0].time : 'All Done';

  const formatAMPM = (time24) => {
    if (!time24 || time24 === 'All Done' || time24 === 'None') return time24;
    const [h, m] = time24.split(':');
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return `${hours.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-white dark:bg-[#000000] transition-colors duration-300">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Sidebar (Desktop) */}
      <aside className="w-64 hidden md:flex flex-col border-r border-black/5 dark:border-white/5 glass-panel z-10 shrink-0">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#111] dark:bg-white flex items-center justify-center shadow-lg">
            <LayoutDashboard className="w-4 h-4 text-white dark:text-black" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gradient">MediCare</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <Link to="/mentee-dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/10 text-[#111] dark:text-white font-semibold transition-colors">
            <Activity className="w-5 h-5" /> Monitoring
          </Link>
          <Link to="/notifications" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#111]/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/5 font-medium transition-colors">
            <Bell className="w-5 h-5" /> Alerts
          </Link>
        </nav>

        <div className="p-6 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-10 h-10 shadow-md' } }} />
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate text-[#111] dark:text-white">{user?.name || 'User'}</p>
              <p className="text-rose-500 font-bold text-[10px] uppercase tracking-wider">Caregiver</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto z-10 pb-28 md:pb-10">
        {/* Mobile Header elements that normally sit in sidebar */}
        <div className="md:hidden flex items-center justify-between mb-8 pb-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#111] dark:bg-white flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-4 h-4 text-white dark:text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gradient">MediCare</span>
          </div>
          <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-8 h-8 shadow-md' } }} />
        </div>

        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            {isDualRole && (
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-bold text-rose-500 hover:text-rose-600 mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to My Dashboard
              </button>
            )}
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-[#111] dark:text-white">Monitoring <span className="text-rose-500">{parentName}</span></h1>
            <p className="text-[#111]/60 dark:text-white/60 font-medium text-sm md:text-base">
              Real-time adherence overview
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex w-full xl:w-auto items-center justify-end gap-4">
            <ThemeToggle />
          </motion.div>
        </header>

        {/* Dashboard Grid Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Adherence Progress Ring Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 md:p-8 rounded-3xl flex items-center justify-between col-span-1 md:col-span-2 lg:col-span-1">
            <div>
              <h3 className="text-[#111]/50 dark:text-white/50 font-bold text-xs uppercase tracking-widest mb-2">Today's Adherence</h3>
              <p className="text-4xl md:text-5xl font-black text-[#111] dark:text-white tracking-tighter">{adherenceScore}<span className="text-xl md:text-2xl text-[#111]/40 dark:text-white/40">%</span></p>
              <p className="text-[#111]/60 dark:text-white/60 text-sm mt-2 font-medium flex items-center gap-1.5">
                {adherenceScore === 100 ? (
                  <><CheckCircle2 className="w-4 h-4 text-green-500" /> Patient is on track</>
                ) : (
                  <><Activity className="w-4 h-4 text-orange-500" /> {takenDosesToday} of {totalDosesToday} taken</>
                )}
              </p>
            </div>
            {/* SVG Ring */}
            <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-black/5 dark:text-white/5" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-rose-500 transition-all duration-1000" strokeDasharray={`${adherenceScore}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-3xl flex flex-col justify-center">
              <h3 className="text-[#111]/50 dark:text-white/50 font-bold text-xs uppercase tracking-widest mb-1 break-words">Active Meds</h3>
              <p className="text-3xl md:text-4xl font-black text-[#111] dark:text-white">{medicines.length}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-3xl flex flex-col justify-center">
              <h3 className="text-[#111]/50 dark:text-white/50 font-bold text-xs uppercase tracking-widest mb-1 break-words">Next Dose</h3>
              <p className="text-2xl md:text-3xl font-black text-[#111] dark:text-white truncate">
                {formatAMPM(nextDose)}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Detailed Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-10">
          
          {/* Timeline View (Left Column) */}
          <div className="xl:col-span-1">
            <h2 className="text-xl font-bold tracking-tight mb-6 text-[#111] dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" /> Patient Schedule
            </h2>
            
            {schedule.length === 0 ? (
              <p className="text-[#111]/50 dark:text-white/50 font-medium">No medicines scheduled.</p>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-black/10 dark:before:via-white/10 before:to-transparent">
                {schedule.map((item, idx) => {
                  const isTaken = (item.takenLogs || []).some(log => log.date === todayDate && log.time === item.time);
                  return (
                    <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-[#000] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors ${isTaken ? 'bg-green-500' : 'bg-rose-500'}`}>
                        {isTaken ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-4 rounded-2xl transition-all ${isTaken ? 'opacity-60 grayscale' : ''}`}>
                        <div className="font-black text-lg text-[#111] dark:text-white mb-1">{formatAMPM(item.time)}</div>
                        <div className="font-semibold text-[#111] dark:text-white truncate">{item.name}</div>
                        <div className="text-sm font-medium text-[#111]/60 dark:text-white/60">{item.dosage}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Complete Medicine Details (Right 2 Columns) */}
          <div className="xl:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold tracking-tight text-[#111] dark:text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-rose-500" /> Prescriptions
              </h2>
            </div>

            {medicines.length === 0 ? (
              <div className="glass-card rounded-3xl p-10 md:p-16 text-center border-dashed border-2 border-black/10 dark:border-white/10">
                <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Pill className="w-8 h-8 text-[#111]/30 dark:text-white/30" />
                </div>
                <h3 className="text-xl font-bold text-[#111] dark:text-white mb-2">No prescriptions found</h3>
                <p className="text-[#111]/60 dark:text-white/60 font-medium">The patient has not added any medicines yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {medicines.map((med, i) => (
                  <motion.div
                    key={med._id || i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-5 md:p-6 rounded-3xl border border-black/5 dark:border-white/5 hover:border-rose-500/30 transition-colors group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                      <Pill className="w-24 h-24 text-rose-500 rotate-12 -mr-6 -mt-6" />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-6 relative z-10 gap-2">
                      <div className="w-full">
                        <h3 className="text-2xl font-black text-[#111] dark:text-white mb-1 truncate">{med.name}</h3>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/10 text-xs font-bold text-[#111]/70 dark:text-white/70 uppercase tracking-wider">
                          {med.frequency}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-[#111]/50 dark:text-white/50 text-sm font-bold uppercase tracking-wider">Dosage</span>
                        <span className="font-bold text-[#111] dark:text-white">{med.dosage}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[#111]/50 dark:text-white/50 text-sm font-bold uppercase tracking-wider">Start Date</span>
                        <span className="font-bold text-[#111] dark:text-white">
                          {med.startDate ? new Date(med.startDate).toLocaleDateString() : 'Today'}
                        </span>
                      </div>

                      {med.endDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#111]/50 dark:text-white/50 text-sm font-bold uppercase tracking-wider">End Date</span>
                          <span className="font-bold text-[#111] dark:text-white">
                            {new Date(med.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <div className="pt-4 border-t border-black/5 dark:border-white/5">
                        <span className="text-[#111]/50 dark:text-white/50 text-sm font-bold uppercase tracking-wider mb-3 block">Today's Doses</span>
                        <div className="flex flex-wrap gap-2">
                          {(med.reminderTimes || []).map((time, idx) => {
                            const isTaken = (med.takenLogs || []).some(log => log.date === todayDate && log.time === time);
                            return (
                              <div key={idx} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${isTaken ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' : 'bg-black/5 dark:bg-white/5 text-[#111]/60 dark:text-white/60 border border-black/10 dark:border-white/10'}`}>
                                {isTaken ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                {formatAMPM(time)} {isTaken ? 'Taken' : 'Pending'}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {med.endDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#111]/50 dark:text-white/50 text-sm font-bold uppercase tracking-wider">End Date</span>
                          <span className="font-bold text-[#111] dark:text-white">
                            {new Date(med.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {med.notes && (
                        <div className="pt-4 border-t border-black/5 dark:border-white/5">
                          <span className="flex items-center gap-2 text-[#111]/50 dark:text-white/50 text-sm font-bold uppercase tracking-wider mb-2">
                            <FileText className="w-4 h-4" /> Instructions
                          </span>
                          <p className="text-sm font-medium text-[#111] dark:text-white leading-relaxed break-words">{med.notes}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-black/10 dark:border-white/10 z-50 flex justify-around p-3 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(255,255,255,0.02)]">
        <Link to="/mentee-dashboard" className="flex flex-col items-center gap-1 text-rose-500 font-bold text-[10px] uppercase tracking-wider">
          <Activity className="w-6 h-6" /> Monitoring
        </Link>
        <Link to="/notifications" className="flex flex-col items-center gap-1 text-[#111]/50 dark:text-white/50 hover:text-[#111] dark:hover:text-white font-bold text-[10px] uppercase tracking-wider transition-colors">
          <Bell className="w-6 h-6" /> Alerts
        </Link>
      </nav>
    </div>
  );
};

export default MenteeDashboard;
