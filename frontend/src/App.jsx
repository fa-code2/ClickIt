import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LandingPage from './landing/LandingPage';
import Login from './pages/Login';
import CitizenPortal from './pages/CitizenPortal';
import MunicipalDashboard from './pages/MunicipalDashboard';
import { Building, MapPin, LogOut, ShieldCheck } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('landing'); // 'landing' | 'login' | 'register'

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAuthView('landing');
  };

  const rawClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  const isClientIdValid = Boolean(
    rawClientId &&
    !rawClientId.startsWith('your-') &&
    !rawClientId.startsWith('YOUR_') &&
    rawClientId.length > 10
  );

  // If user is not authenticated, toggle between Landing Page and Login/Register
  if (!user) {
    if (authView === 'landing') {
      return (
        <LandingPage
          onGetStarted={() => setAuthView('register')}
          onSignIn={() => setAuthView('login')}
        />
      );
    }

    if (isClientIdValid) {
      return (
        <GoogleOAuthProvider clientId={rawClientId}>
          <Login
            initialRegister={authView === 'register'}
            isGoogleOAuthReady={true}
            onLoginSuccess={(userData) => setUser(userData)}
            onBack={() => setAuthView('landing')}
          />
        </GoogleOAuthProvider>
      );
    }

    return (
      <Login
        initialRegister={authView === 'register'}
        isGoogleOAuthReady={false}
        onLoginSuccess={(userData) => setUser(userData)}
        onBack={() => setAuthView('landing')}
      />
    );
  }

  const isOfficer = user.role === 'MUNICIPAL_OFFICER';

  return (
    <div className="min-h-screen bg-cream text-slate-900 font-sans">
      {/* Primary Navigation Bar styled with Raspberry #C2255C */}
      <nav className="bg-raspberry text-white px-4 md:px-8 py-3.5 flex flex-wrap justify-between items-center shadow-md sticky top-0 z-40 border-b border-vanilla/30">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-white text-raspberry flex items-center justify-center font-black shadow-xs">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight">MicroGov</span>
              <span className="text-[11px] bg-vanilla text-raspberry font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                {isOfficer ? 'Municipal Operations' : 'Citizen Portal'}
              </span>
            </div>
            {user.ward && !isOfficer && (
              <span className="text-xs text-vanilla/90 flex items-center gap-1 font-medium mt-0.5">
                <MapPin className="w-3 h-3 text-vanilla" />
                {user.ward}
              </span>
            )}
            {isOfficer && (
              <span className="text-xs text-vanilla/90 flex items-center gap-1 font-medium mt-0.5">
                <ShieldCheck className="w-3 h-3 text-vanilla" />
                Authorized Municipal Command
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-bold text-white">{user.full_name || user.email}</span>
            <span className="text-[11px] text-vanilla/80 uppercase font-medium tracking-wider">
              {isOfficer ? 'Municipal Officer' : 'Registered Citizen'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="bg-white hover:bg-vanilla text-raspberry text-xs font-bold px-3.5 py-2 rounded-xl transition duration-150 shadow-xs flex items-center gap-1.5"
            title="Sign Out of MicroGov"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content strictly based on authenticated role */}
      <main>
        {isOfficer ? <MunicipalDashboard /> : <CitizenPortal />}
      </main>
    </div>
  );
}