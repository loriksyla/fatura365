import React, { useEffect, useMemo, useState } from 'react';
import {
  completeForgotPassword,
  confirmRegistration,
  loginWithEmail,
  registerWithEmail,
  startForgotPassword,
} from '../services/authService';
import { AppUser } from '../types';

interface AuthPageProps {
  mode: 'login' | 'register';
  onSwitchMode: (mode: 'login' | 'register') => void;
  onLogin: (user: AppUser) => void;
  onCancel: () => void;
}

type LocalStep = 'form' | 'confirm-signup' | 'forgot-request' | 'forgot-confirm';

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onSwitchMode, onLogin, onCancel }) => {
  const [step, setStep] = useState<LocalStep>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    code: '',
    newPassword: '',
  });

  const title = useMemo(() => {
    if (step === 'confirm-signup') return 'Konfirmo Email-in';
    if (step === 'forgot-request') return 'Rivendos Fjalëkalimin';
    if (step === 'forgot-confirm') return 'Kodi i Rivendosjes';
    return mode === 'login' ? 'Mirësevini' : 'Krijoni llogari të re';
  }, [mode, step]);

  useEffect(() => {
    setStep('form');
    setError('');
    setSuccess('');
  }, [mode]);

  const clearStatus = () => {
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearStatus();
    setIsLoading(true);

    try {
      if (step === 'confirm-signup') {
        await confirmRegistration(formData.email, formData.code);
        await loginWithEmail(formData.email, formData.password);
        onLogin({ id: formData.email, name: formData.name || formData.email.split('@')[0], email: formData.email });
        return;
      }

      if (step === 'forgot-request') {
        await startForgotPassword(formData.email);
        setSuccess('Kodi i rivendosjes u dërgua në email.');
        setStep('forgot-confirm');
        return;
      }

      if (step === 'forgot-confirm') {
        await completeForgotPassword(formData.email, formData.code, formData.newPassword);
        setSuccess('Fjalëkalimi u ndryshua. Tani mund të hyni.');
        setStep('form');
        onSwitchMode('login');
        return;
      }

      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError('Fjalëkalimet nuk përputhen.');
          return;
        }

        const nextStep = await registerWithEmail(formData.name, formData.email, formData.password);
        if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
          setSuccess('Kontrollo email-in dhe shkruaj kodin e konfirmimit.');
          setStep('confirm-signup');
          return;
        }
      }

      await loginWithEmail(formData.email, formData.password);
      onLogin({ id: formData.email, name: formData.name || formData.email.split('@')[0], email: formData.email });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ndodhi një gabim.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h2>
          <p className="mt-2 text-sm text-gray-600">Përdor llogarinë tënde për menaxhimin e faturave.</p>
        </div>

        {step === 'form' && (
          <div className="flex gap-2 bg-gray-50 p-1 rounded-lg">
            <button
              onClick={() => onSwitchMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-md ${
                mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Hyni
            </button>
            <button
              onClick={() => onSwitchMode('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-md ${
                mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Regjistrohu
            </button>
          </div>
        )}

        {!!error && <div className="text-sm bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg">{error}</div>}
        {!!success && <div className="text-sm bg-green-50 border border-green-100 text-green-700 p-3 rounded-lg">{success}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {step === 'form' && mode === 'register' && (
            <input
              type="text"
              required
              placeholder="Emri i plotë"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="block w-full rounded-lg border border-gray-300 bg-white text-gray-900 p-3"
            />
          )}

          {(step === 'form' || step === 'confirm-signup' || step === 'forgot-request' || step === 'forgot-confirm') && (
            <input
              type="email"
              required
              placeholder="Adresa Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="block w-full rounded-lg border border-gray-300 bg-white text-gray-900 p-3"
            />
          )}

          {step === 'form' && (
            <>
              <input
                type="password"
                required
                placeholder="Fjalëkalimi"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full rounded-lg border border-gray-300 bg-white text-gray-900 p-3"
              />
              {mode === 'register' && (
                <input
                  type="password"
                  required
                  placeholder="Përsërite fjalëkalimin"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 bg-white text-gray-900 p-3"
                />
              )}
            </>
          )}

          {(step === 'confirm-signup' || step === 'forgot-confirm') && (
            <input
              type="text"
              required
              placeholder="Kodi i verifikimit"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="block w-full rounded-lg border border-gray-300 bg-white text-gray-900 p-3"
            />
          )}

          {step === 'forgot-confirm' && (
            <input
              type="password"
              required
              placeholder="Fjalëkalim i ri"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="block w-full rounded-lg border border-gray-300 bg-white text-gray-900 p-3"
            />
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-70"
          >
            {isLoading
              ? 'Duke procesuar...'
              : step === 'confirm-signup'
                ? 'Konfirmo'
                : step === 'forgot-request'
                  ? 'Dërgo Kodin'
                  : step === 'forgot-confirm'
                    ? 'Ruaj Fjalëkalimin'
                    : mode === 'login'
                      ? 'Hyni'
                      : 'Regjistrohu'}
          </button>
        </form>

        {step === 'form' && mode === 'login' && (
          <button
            type="button"
            onClick={() => {
              clearStatus();
              setStep('forgot-request');
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Harruat fjalëkalimin?
          </button>
        )}

        {step !== 'form' && (
          <button
            type="button"
            onClick={() => {
              clearStatus();
              setStep('form');
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Kthehu mbrapa
          </button>
        )}

        <button onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Kthehu tek Faturat
        </button>
      </div>
    </div>
  );
};
