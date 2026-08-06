import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      
      // Navigate to the intended destination or root
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || t('login.loginFailed', 'Login failed.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl flex flex-col items-center">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-8">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
            alt="State Emblem of India" 
            className="h-20 sm:h-24 w-auto object-contain shrink-0"
          />
          
          <div className="flex flex-col justify-center items-center sm:items-start text-center sm:text-left">
            <div className="mb-2">
              <h1 className="text-xl sm:text-2xl font-bold text-black leading-tight">
                कृषि एवं किसान कल्याण विभाग
              </h1>
              <h2 className="text-sm sm:text-base font-medium text-black uppercase tracking-wide">
                Department of Agriculture & Farmers Welfare
              </h2>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div className="text-center sm:text-right">
                <p className="text-xs font-bold text-black leading-tight">भारत सरकार</p>
                <p className="text-xs font-medium text-black uppercase tracking-tight">Government of India</p>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-400"></div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold text-black leading-tight">कृषि एवं किसान कल्याण मंत्रालय</p>
                <p className="text-xs font-medium text-black uppercase tracking-tight">Ministry of Agriculture & Farmers Welfare</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          KrishiMitra OS
        </h2>
        <p className="mt-1 text-center text-xs text-gray-500 font-bold uppercase tracking-widest">
          {t('hero.mission', 'National Oilseed Mission')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700">
                {t('login.emailAddress', 'Email Address')}
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="name@agricoop.gov.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">
                {t('login.password', 'Password')}
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer select-none">
                  {t('login.rememberMe', 'Remember me')}
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-semibold text-emerald-600 hover:text-emerald-500" onClick={(e) => { e.preventDefault(); alert("Demo Mode: Password reset is disabled."); }}>
                  {t('login.forgotPassword', 'Forgot your password?')}
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    {t('login.authenticating', 'Authenticating...')}
                  </>
                ) : (
                  t('login.signIn', 'Sign In')
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 font-medium">{t('login.demoCredentials', 'Demo Credentials')}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div className="bg-blue-50 border border-blue-100 rounded p-3 text-xs">
                <div className="font-bold text-blue-900 mb-1 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> {t('login.farmer', 'Farmer')}
                </div>
                <div className="text-blue-800">Email: <span className="font-mono">farmer@agricoop.gov.in</span></div>
                <div className="text-blue-800">Password: <span className="font-mono">Farmer@123</span></div>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded p-3 text-xs">
                <div className="font-bold text-indigo-900 mb-1 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> {t('login.fpoOfficer', 'FPO Officer')}
                </div>
                <div className="text-indigo-800">Email: <span className="font-mono">fpo@agricoop.gov.in</span></div>
                <div className="text-indigo-800">Password: <span className="font-mono">FPO@123</span></div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded p-3 text-xs">
                <div className="font-bold text-purple-900 mb-1 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> {t('login.govOfficer', 'Government Officer')}
                </div>
                <div className="text-purple-800">Email: <span className="font-mono">officer@agricoop.gov.in</span></div>
                <div className="text-purple-800">Password: <span className="font-mono">Gov@123</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
