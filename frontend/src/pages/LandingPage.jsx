import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity, ArrowRight, Zap, Droplets } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage = () => {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden">
      {/* Absolute Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/20 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
      
      {/* Navbar */}
      <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#111] dark:bg-white flex items-center justify-center shadow-lg">
            <Droplets className="w-4 h-4 text-white dark:text-black" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gradient">
            MediCare
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <ThemeToggle />
          {isSignedIn ? (
            <Link to="/role-selection" className="group relative px-5 py-2.5 rounded-full overflow-hidden text-sm font-semibold text-white bg-[#111] dark:bg-white dark:text-black transition-transform hover:scale-105">
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/auth/sign-up" className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#111] dark:bg-white dark:text-black hover:bg-black/80 dark:hover:bg-white/90 transition-all shadow-lg hover:shadow-xl">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center mt-20 mb-32 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md mb-8">
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-xs font-semibold tracking-wide uppercase">AI Voice Assistant Added</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[1.05] mb-8">
            Perfect Adherence. <br />
            <span className="text-gradient-accent">Zero Friction.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-black/60 dark:text-white/60 max-w-2xl font-medium leading-relaxed mb-12">
            The next-generation smart medicine tracking platform designed for absolute simplicity. Voice reminders for patients, instant analytics for caregivers.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/auth/sign-up" className="group flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white bg-[#111] dark:bg-white dark:text-black hover:scale-105 transition-all shadow-[0_0_40px_rgb(0,0,0,0.1)] dark:shadow-[0_0_40px_rgb(255,255,255,0.2)]">
              Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-24 md:mt-32 w-full text-left">
          {[
            { icon: Activity, title: "Real-time Metrics", desc: "Instant sync between parent devices and caregiver dashboards." },
            { icon: Droplets, title: "Intelligent Dosage", desc: "AI-driven schedule organization and clash prevention." },
            { icon: ShieldCheck, title: "Enterprise Reliability", desc: "Built on high-performance edge infrastructure." }
          ].map((feat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card p-8 rounded-3xl group hover:-translate-y-2 transition-transform duration-500"
            >
              <div className="w-12 h-12 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <feat.icon className="w-5 h-5 text-indigo-500 dark:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
              <p className="text-black/60 dark:text-white/60 leading-relaxed font-medium">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
