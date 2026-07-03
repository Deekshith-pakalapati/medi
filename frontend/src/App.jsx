import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser, SignedIn } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import MenteeDashboard from './pages/MenteeDashboard';
import RoleSelection from './pages/RoleSelection';
import Analytics from './pages/Analytics';
import NotificationCenter from './pages/NotificationCenter';
import AuthLayout from './components/AuthLayout';
import Chatbot from './components/Chatbot';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import GlobalAlertBanner from './components/GlobalAlertBanner';
import { usePushNotifications } from './hooks/usePushNotifications';
import SplashLoader from './components/SplashLoader';
import { Loader2 } from 'lucide-react';

// ProtectedRoute: uses useUser() hook — reliable, no blank page
const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black/20 dark:text-white/20" />
      </div>
    );
  }
  if (!isSignedIn) {
    return <Navigate to="/auth/sign-in" replace />;
  }
  return children;
};

function AppContent() {
  const { isLoaded } = useUser();
  const [showSplash, setShowSplash] = useState(true);
  usePushNotifications();

  useEffect(() => {
    // 2.5s visible + 0.5s exit animation = 3s total duration
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const isAppLoading = !isLoaded || showSplash;

  return (
    <>
      <GlobalAlertBanner />
      <AnimatePresence mode="wait">
        {isAppLoading && <SplashLoader key="splash" />}
      </AnimatePresence>

      {!isAppLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/*" element={<AuthLayout />} />

        {/* Protected */}
        <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/mentee-dashboard" element={<ProtectedRoute><MenteeDashboard /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationCenter /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating AI Chatbot only when signed in */}
      <SignedIn>
        <Chatbot />
      </SignedIn>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'Outfit, sans-serif',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
          }
        }}
      />
        </motion.div>
      )}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
