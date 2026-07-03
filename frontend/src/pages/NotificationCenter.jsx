import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Bell, ArrowLeft, CheckCircle, XCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NotificationCenter = () => {
  const { getToken } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifs = async () => {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(data);
    };
    fetchNotifs();
  }, [getToken]);

  const getIcon = (type) => {
    if (type === 'Alert') return <XCircle className="text-red-500 w-5 h-5" />;
    if (type === 'Warning') return <Bell className="text-yellow-500 w-5 h-5" />;
    return <Info className="text-blue-500 w-5 h-5" />;
  };

  return (
    <div className="min-h-screen relative overflow-hidden p-8 md:p-12">
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>
      
      <div className="max-w-4xl mx-auto z-10 relative">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors mb-12">
          <ArrowLeft size={16} /> Back
        </Link>
        
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Inbox</h1>
            <p className="text-black/60 dark:text-white/60 font-medium">System alerts and missed medicine warnings.</p>
          </div>
          <button className="text-sm font-semibold px-5 py-2.5 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            Mark all read
          </button>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="glass-card rounded-3xl p-16 text-center border-dashed border-2">
              <Bell className="w-8 h-8 mx-auto text-black/20 dark:text-white/20 mb-4" />
              <p className="text-black/60 dark:text-white/60 font-medium">Inbox is completely clear.</p>
            </div>
          ) : (
            notifications.map((notif, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={notif._id} 
                className={`glass-card p-5 rounded-2xl flex gap-4 items-start ${notif.readStatus ? 'opacity-60' : 'border-l-4 border-l-indigo-500'}`}
              >
                <div className="mt-1">{getIcon(notif.type)}</div>
                <div className="flex-1">
                  <p className={`text-base ${notif.readStatus ? 'font-medium' : 'font-bold'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs font-semibold text-black/40 dark:text-white/40 mt-1 uppercase tracking-wider">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
