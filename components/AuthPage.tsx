import React, { useState, useEffect } from 'react';

interface AuthPageProps {
  mode: 'login' | 'register';
  onSwitchMode: (mode: 'login' | 'register') => void;
  onLogin: (user: { name: string; email: string }) => void;
  onCancel: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onSwitchMode, onLogin, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Reset forgot password view if mode changes externally (e.g. from Navbar)
  useEffect(() => {
    setShowForgotPassword(false);
  }, [mode]);

  const fillTestCredentials = () => {
    setFormData({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      
      if (showForgotPassword) {
        alert('Udhëzimet për rivendosjen e fjalëkalimit u dërguan në email-in tuaj.');
        setShowForgotPassword(false);
        onSwitchMode('login');
        return;
      }

      // Check for Test Credentials
      if (mode === 'login' && formData.email === 'test@example.com' && formData.password === 'password') {
         onLogin({
          name: 'Test User',
          email: 'test@example.com'
        });
      } else if (mode === 'login' && formData.email !== 'test@example.com') {
          // Allow "Fake" login for demo purposes even if not test user, but prefer test user
           onLogin({
            name: 'Përdorues Demo',
            email: formData.email
          });
      } else {
         // Register flow
         onLogin({
          name: formData.name,
          email: formData.email
        });
      }

    }, 1500);
  };

  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowForgotPassword(true);
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50">
        <div className="max-w-md w-full space-y-8 relative z-10 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
           <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Rivendosni fjalëkalimin
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Shkruani email-in tuaj dhe ne do t'ju dërgojmë udhëzimet për të rivendosur fjalëkalimin.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
             <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-envelope text-gray-400 group-focus-within:text-blue-500 transition-colors"></i>
              </div>
              <input
                type="email"
                required
                className="appearance-none bg-white rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                placeholder="Adresa Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <i className="fas fa-circle-notch fa-spin mr-2"></i>
                    Duke dërguar...
                  </span>
                ) : (
                  'Dërgo Email'
                )}
              </button>
            </div>
            
            <div className="text-center">
              <button 
                type="button"
                onClick={() => setShowForgotPassword(false)} 
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <i className="fas fa-arrow-left mr-1"></i> Kthehu tek Hyni
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-purple-200/30 blur-3xl"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-200/30 blur-3xl"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] rounded-full bg-emerald-200/30 blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {mode === 'login' ? 'Mirësevini' : 'Krijoni llogari të re'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'login' 
              ? 'Hyni për të menaxhuar faturat dhe klientët tuaj.' 
              : 'Filloni të krijoni fatura profesionale në sekonda.'}
          </p>
        </div>

        <div className="flex gap-4 mb-6 bg-gray-50 p-1 rounded-lg">
          <button
            onClick={() => onSwitchMode('login')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              mode === 'login' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Hyni
          </button>
          <button
            onClick={() => onSwitchMode('register')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              mode === 'register' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Regjistrohu
          </button>
        </div>

        {mode === 'login' && (
           <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-xs text-blue-700 mb-4 cursor-pointer hover:bg-blue-100 transition-colors" onClick={fillTestCredentials}>
             <span className="font-bold">Demo Login:</span> Kliko këtu për të mbushur të dhënat e testit.
             <br/>
             (test@example.com / password)
           </div>
        )}

        <form className="mt-2 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {mode === 'register' && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-user text-gray-400 group-focus-within:text-blue-500 transition-colors"></i>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none bg-white rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="Emri i plotë"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-envelope text-gray-400 group-focus-within:text-blue-500 transition-colors"></i>
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none bg-white rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                placeholder="Adresa Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-lock text-gray-400 group-focus-within:text-blue-500 transition-colors"></i>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none bg-white rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                placeholder="Fjalëkalimi"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 bg-white text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-gray-700">
                Më mbaj mend
              </label>
            </div>

            {mode === 'login' && (
              <div className="text-sm">
                <button 
                  type="button"
                  onClick={handleForgotPasswordClick} 
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Harruat fjalëkalimin?
                </button>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <i className="fas fa-circle-notch fa-spin mr-2"></i>
                  Duke u procesuar...
                </span>
              ) : (
                mode === 'login' ? 'Hyni' : 'Regjistrohu'
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
           <button onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
             Kthehu tek Faturat
           </button>
        </div>
      </div>
    </div>
  );
};
