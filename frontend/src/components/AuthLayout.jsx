import { SignIn, SignUp, useAuth } from '@clerk/clerk-react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  const isSignIn = location.pathname.includes('sign-in');

  if (isLoaded && isSignedIn) {
    return <Navigate to="/role-selection" replace />;
  }

  const clerkAppearance = {
    variables: {
      colorBackground: '#111111',
      colorText: '#ffffff',
      colorTextSecondary: '#a1a1aa',
      colorInputBackground: '#1a1a1a',
      colorInputText: '#ffffff',
      colorPrimary: '#ffffff',
      colorTextOnPrimaryBackground: '#000000',
      borderRadius: '12px',
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      colorDanger: '#ef4444',
      colorSuccess: '#22c55e',
      spacingUnit: '18px',
    },
    layout: {
      socialButtonsPlacement: 'bottom',
      logoPlacement: 'none',
      showOptionalFields: true,
    },
    elements: {
      rootBox: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      },
      card: {
        width: '100%',
        maxWidth: '100%',
        boxShadow: 'none',
        border: 'none',
        backgroundColor: 'transparent',
        padding: '0',
        gap: '0',
      },
      header: { display: 'none' },
      main: {
        gap: '16px',
        padding: '0',
      },
      form: {
        gap: '14px',
      },
      formField: {
        gap: '6px',
      },
      formFieldRow: {
        gap: '12px',
      },
      formFieldLabelRow: {
        marginBottom: '4px',
      },
      formFieldLabel: {
        color: '#e4e4e7',
        fontWeight: '500',
        fontSize: '14px',
      },
      formFieldInput: {
        backgroundColor: '#1a1a1a',
        border: '1px solid #2e2e2e',
        borderRadius: '12px',
        color: '#ffffff',
        fontSize: '15px',
        fontFamily: 'Outfit, sans-serif',
        height: '48px',
        padding: '0 14px',
        width: '100%',
        boxSizing: 'border-box',
      },
      formButtonPrimary: {
        backgroundColor: '#ffffff',
        color: '#000000',
        borderRadius: '9999px',
        fontWeight: '600',
        textTransform: 'none',
        boxShadow: 'none',
        border: 'none',
        height: '40px',
        fontSize: '14px',
        marginTop: '12px',
        marginBottom: '4px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
      footerActionLink: { color: '#a855f7', fontWeight: '600' },
      dividerLine: { background: '#2e2e2e' },
      dividerText: { color: '#a855f7', fontSize: '12px', fontWeight: '600', letterSpacing: '0.08em' },
      socialButtonsBlockButton: {
        backgroundColor: '#1a1a1a',
        border: '1px solid #2e2e2e',
        color: '#ffffff',
        borderRadius: '9999px',
        height: '50px',
      },
      socialButtonsBlockButtonText: { color: '#ffffff', fontWeight: '500', fontSize: '15px' },
      formFieldWarningText: { color: '#ef4444', fontSize: '12px' },
      formFieldErrorText: { color: '#ef4444', fontSize: '12px' },
      formFieldSuccessText: { color: '#22c55e', fontSize: '12px' },
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black overflow-y-auto">
      {/* Global CSS — only hide badges & focus ring */}
      <style>{`
        /* Hide Clerk badges */
        div.cl-internal-b3al4t,
        div.cl-internal-1dauvpw,
        div.cl-footer,
        div.cl-internal-180wb59,
        div:has(> a[href*="clerk.com"]) {
          display: none !important;
        }

        /* Hide the "Optional" badge — causes overlap in two-col rows */
        .cl-formFieldHintText,
        .cl-formFieldAction {
          display: none !important;
        }

        /* ── Divider ── */
        .cl-dividerRow {
          margin: 12px 0 8px 0 !important;
        }

        /* Fix two-col row so columns don't shrink below their label */
        .cl-formFieldRow {
          gap: 12px !important;
          padding-left: 14px !important;
        }
        .cl-formFieldRow > * {
          min-width: 0 !important;
          flex: 1 1 0 !important;
        }

        /* Label row: label left, nothing overflowing */
        .cl-formFieldLabelRow {
          overflow: hidden !important;
          white-space: nowrap !important;
        }

        .cl-formFieldInput:focus {
          border-color: #a855f7 !important;
          box-shadow: 0 0 0 3px rgba(168,85,247,0.15) !important;
          outline: none !important;
        }

        /* Ensure the primary button is never clipped or shifted */
        .cl-formButtonPrimary {
          width: calc(100% - 4px) !important;
          max-width: 100% !important;
          margin-left: 4px !important;
          box-sizing: border-box !important;
        }

        .cl-formButtonPrimary:hover {
          background-color: #e5e5e5 !important;
          transform: translateY(-1px);
          transition: all 0.2s;
        }
        .cl-socialButtonsBlockButton:hover {
          background-color: #222222 !important;
          border-color: #444 !important;
        }

        /* Make GitHub logo white */
        .cl-socialButtonsBlockButton img,
        .cl-socialButtonsBlockButton svg {
          filter: brightness(0) invert(1) !important;
        }
        /* Keep Google logo colorful - undo filter for Google button */
        .cl-socialButtonsBlockButton[data-provider="google"] img,
        .cl-socialButtonsBlockButton[data-provider="google"] svg {
          filter: none !important;
        }
      `}</style>

      {/* Back Button */}
      <div className="relative z-10 px-6 pt-6">
        <Link
          to="/"
          className="inline-flex w-11 h-11 rounded-full border border-[#2e2e2e] items-center justify-center text-white hover:bg-[#1a1a1a] transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px]"
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="flex items-center gap-3 mb-6 -ml-8">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border border-white/60 flex items-center justify-center">
                  <span className="text-white text-xl font-light">+</span>
                </div>
                <svg className="absolute -top-2.5 -right-1.5 w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z"/>
                </svg>
              </div>
              <span className="text-[26px] font-bold tracking-tight text-white">MediCare</span>
            </div>

            <h1 className="text-[28px] font-bold text-white mb-1.5 tracking-tight leading-tight">
              {isSignIn ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-[#a1a1aa] text-[14px] leading-relaxed max-w-[300px]">
              {isSignIn
                ? 'Please enter your details to sign in.'
                : 'Welcome! Please fill in the details to get started.'}
            </p>
          </div>

          {/* Clerk Form */}
          <Routes>
            <Route
              path="sign-in/*"
              element={
                <SignIn
                  routing="path"
                  path="/auth/sign-in"
                  signUpUrl="/auth/sign-up"
                  forceRedirectUrl="/role-selection"
                  appearance={clerkAppearance}
                />
              }
            />
            <Route
              path="sign-up/*"
              element={
                <SignUp
                  routing="path"
                  path="/auth/sign-up"
                  signInUrl="/auth/sign-in"
                  forceRedirectUrl="/role-selection"
                  appearance={clerkAppearance}
                />
              }
            />
          </Routes>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
