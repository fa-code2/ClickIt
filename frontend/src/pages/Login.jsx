import React, { useState } from 'react';
import { Building, Mail, Lock, User, AlertCircle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const extractErrorMessage = (errOrData, fallback = 'Authentication failed.') => {
  if (!errOrData) return fallback;
  if (typeof errOrData === 'string') return errOrData;
  if (typeof errOrData.detail === 'string') return errOrData.detail;
  if (Array.isArray(errOrData.detail)) {
    return errOrData.detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item?.msg) {
          const loc = Array.isArray(item.loc) ? item.loc.filter((l) => l !== 'body').join('.') : '';
          return loc ? `${loc}: ${item.msg}` : item.msg;
        }
        return JSON.stringify(item);
      })
      .join('; ');
  }
  if (typeof errOrData.detail === 'object' && errOrData.detail !== null) {
    return errOrData.detail.msg || errOrData.detail.message || JSON.stringify(errOrData.detail);
  }
  if (errOrData.message && typeof errOrData.message === 'string') return errOrData.message;
  return fallback;
};

export default function Login({ onLoginSuccess, initialRegister = false, onBack = null, isGoogleOAuthReady = false }) {
  const [isRegister, setIsRegister] = useState(initialRegister);

  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Role & Civic Fields for Registration
  const [role, setRole] = useState('CITIZEN'); // 'CITIZEN' | 'MUNICIPAL_OFFICER'
  const [city, setCity] = useState('');
  const [ward, setWard] = useState('');
  const [representative, setRepresentative] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const cleanEmail = email.trim().toLowerCase();

    const payload = isRegister
      ? {
        email: cleanEmail,
        password,
        full_name: fullName.trim(),
        role,
        city: city.trim(),
        ward: ward.trim(),
        representative: representative.trim() || (role === 'MUNICIPAL_OFFICER' ? 'Municipal Action Officer' : '')
      }
      : {
        email: cleanEmail,
        password
      };

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(extractErrorMessage(data, 'Authentication failed. Please check your credentials.'));
      }

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to connect to the authentication server.'));
    } finally {
      setLoading(false);
    }
  };

  // Real Google OAuth Handler (when Google OAuth provider is active)
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const tokenStr = credentialResponse?.credential || credentialResponse?.token || '';
      const decoded = decodeJwt(tokenStr);
      const googleEmail = (decoded?.email || '').trim().toLowerCase();
      const googleName = (decoded?.name || googleEmail.split('@')[0] || 'Citizen').trim();

      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: tokenStr,
          token: tokenStr,
          role: 'CITIZEN'
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(extractErrorMessage(data, 'Google authentication failed.'));
      }

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError(extractErrorMessage(err, 'Google authentication encountered an error. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex justify-center items-center p-4 py-10 selection:bg-raspberry selection:text-white">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md border-2 border-vanilla relative">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-raspberry transition cursor-pointer"
          >
            <span>&larr; Back to Home</span>
          </button>
        )}

        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-vanilla text-raspberry mb-3 shadow-xs">
            <Building className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-raspberry tracking-tight">MicroGov</h2>
          <p className="text-pink-grapefruit text-sm font-semibold mt-1">
            {isRegister
              ? role === 'MUNICIPAL_OFFICER'
                ? 'Register as Municipal Officer'
                : 'Create your Citizen Account'
              : 'Sign in to access your civic account'}
          </p>
        </div>

        {error && (
          <div className="bg-raspberry/10 border border-raspberry/30 text-raspberry p-3.5 rounded-2xl text-xs font-semibold mb-4 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span>
            </div>
            {!isRegister && (typeof error === 'string' && (error.toLowerCase().includes('register') || error.toLowerCase().includes('no account'))) && (
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError('');
                }}
                className="self-start text-[11px] font-black underline hover:text-pink-grapefruit transition cursor-pointer"
              >
                &rarr; Click here to Register / Create Account
              </button>
            )}
          </div>
        )}

        {/* Google OAuth Login - Exclusively displayed on Login; strictly omitted on Registration */}
        {!isRegister && (
          <div className="mb-5 space-y-3">
            {isGoogleOAuthReady ? (
              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={(err) => setError(extractErrorMessage(err, 'Google sign-in was cancelled or failed.'))}
                  shape="pill"
                  size="large"
                  theme="outline"
                  text="signin_with"
                  width="100%"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <button
                  type="button"
                  disabled={true}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border-2 border-slate-200 bg-slate-100 text-slate-400 font-bold text-xs shadow-none cursor-not-allowed opacity-60"
                  title="Google Sign-In is unavailable because VITE_GOOGLE_CLIENT_ID is not configured."
                >
                  <svg className="w-4 h-4 shrink-0 grayscale opacity-50" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
                <p className="text-[10px] text-center text-slate-500 font-medium">
                  Google OAuth requires <code className="bg-vanilla/60 px-1 py-0.5 rounded text-raspberry font-mono text-[10px]">VITE_GOOGLE_CLIENT_ID</code> in <span className="font-semibold">.env</span>
                </p>
              </div>
            )}

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-vanilla"></div>
              <span className="shrink-0 mx-3 text-[11px] font-extrabold uppercase text-pink-grapefruit tracking-wider">
                or continue with email
              </span>
              <div className="flex-grow border-t border-vanilla"></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Registration Role Selection: Registered Citizen vs Municipal Officer */}
          {isRegister && (
            <div className="space-y-3 pb-1 border-b border-vanilla">
              <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider">
                Select Account Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('CITIZEN')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-black transition cursor-pointer ${role === 'CITIZEN'
                    ? 'border-raspberry bg-raspberry text-white shadow-xs'
                    : 'border-vanilla bg-cream/40 text-slate-700 hover:bg-cream'
                    }`}
                >
                  <User className="w-4 h-4" />
                  <span>Citizen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('MUNICIPAL_OFFICER')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-black transition cursor-pointer ${role === 'MUNICIPAL_OFFICER'
                    ? 'border-raspberry bg-raspberry text-white shadow-xs'
                    : 'border-vanilla bg-cream/40 text-slate-700 hover:bg-cream'
                    }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Municipal Officer</span>
                </button>
              </div>
            </div>
          )}

          {/* Full Name (Sign Up only) */}
          {isRegister && (
            <div>
              <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-pink-grapefruit absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={'name'}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-vanilla rounded-xl focus:outline-none focus:ring-2 focus:ring-raspberry bg-cream/40 text-slate-800 font-medium"
                  required
                />
              </div>
            </div>
          )}

          {/* Email: Clean, simple */}
          <div>
            <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-pink-grapefruit absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-vanilla rounded-xl focus:outline-none focus:ring-2 focus:ring-raspberry bg-cream/40 text-slate-800 font-medium"
                required
              />
            </div>
          </div>

          {/* Password: Clean, simple */}
          <div>
            <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-pink-grapefruit absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-vanilla rounded-xl focus:outline-none focus:ring-2 focus:ring-raspberry bg-cream/40 text-slate-800 font-medium"
                required
              />
            </div>
          </div>

          {/* Civic Details on Registration */}
          {isRegister && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold text-[11px] uppercase tracking-wider mb-1">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-pink-grapefruit absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Asansol"
                      className="w-full pl-8 pr-2.5 py-2 text-xs border border-vanilla rounded-xl focus:outline-none focus:ring-2 focus:ring-raspberry bg-cream/40 text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-[11px] uppercase tracking-wider mb-1">
                    Ward / Zone
                  </label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="Ward 14 (North Zone)"
                    className="w-full px-3 py-2 text-xs border border-vanilla rounded-xl focus:outline-none focus:ring-2 focus:ring-raspberry bg-cream/40 text-slate-800 font-medium"
                  />
                </div>
              </div>

              {role === 'MUNICIPAL_OFFICER' && (
                <div>
                  <label className="block text-slate-700 font-bold text-[11px] uppercase tracking-wider mb-1">
                    Officer Designation / Department
                  </label>
                  <input
                    type="text"
                    value={representative}
                    onChange={(e) => setRepresentative(e.target.value)}
                    placeholder="e.g. Zonal Executive Officer / Sanitation Chief"
                    className="w-full px-3 py-2 text-xs border border-vanilla rounded-xl focus:outline-none focus:ring-2 focus:ring-raspberry bg-cream/40 text-slate-800 font-medium"
                  />
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-raspberry hover:bg-pink-grapefruit text-white font-bold py-3.5 rounded-xl transition duration-150 shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-4 cursor-pointer"
          >
            <span>
              {loading
                ? 'Processing...'
                : isRegister
                  ? role === 'MUNICIPAL_OFFICER'
                    ? 'Register Municipal Officer'
                    : 'Create Citizen Account'
                  : 'Sign In'}
            </span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-vanilla text-center">
          <p className="text-xs text-slate-600 font-medium">
            {isRegister ? 'Already registered?' : 'Need an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-raspberry font-extrabold hover:underline ml-1 hover:text-pink-grapefruit transition"
            >
              {isRegister ? 'Sign In Here' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}