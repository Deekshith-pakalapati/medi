import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Analytics = () => {
  const { getToken } = useAuth();
  const [data, setData] = useState({ total: 0, taken: 0, missed: 0, weekly: [] });
  
  // Custom tooltips for Recharts to match the ultra-premium theme
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 rounded-xl border border-black/10 dark:border-white/10 text-sm font-semibold">
          <p className="mb-1">{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} style={{ color: p.fill }}>{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      setData({
        total: 120,
        taken: 105,
        missed: 15,
        weekly: [
          { name: 'Mon', taken: 3, missed: 0 },
          { name: 'Tue', taken: 3, missed: 1 },
          { name: 'Wed', taken: 4, missed: 0 },
          { name: 'Thu', taken: 2, missed: 2 },
          { name: 'Fri', taken: 3, missed: 0 },
          { name: 'Sat', taken: 3, missed: 0 },
          { name: 'Sun', taken: 4, missed: 0 },
        ]
      });
    };
    fetchData();
  }, []);

  const pieData = [
    { name: 'Taken', value: data.taken, color: '#111111' }, // Pure black/white depending on theme handles this awkwardly in Recharts. Using neutral darks.
    { name: 'Missed', value: data.missed, color: '#ef4444' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden p-5 md:p-12 pb-28 md:pb-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      
      <div className="max-w-5xl mx-auto z-10 relative">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors mb-12">
          <ArrowLeft size={16} /> Back
        </Link>
        
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Analytics</h1>
        <p className="text-black/60 dark:text-white/60 font-medium mb-12">Adherence history and trends.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-3xl">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-black/40 dark:text-white/40 mb-8">Weekly Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weekly}>
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="taken" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="missed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 rounded-3xl">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-black/40 dark:text-white/40 mb-8">Overall Success</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
