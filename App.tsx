import React, { useState, useCallback } from 'react';
import { InvoiceData, INITIAL_INVOICE, Business, Client } from './types';
import { InvoiceEditor } from './components/InvoiceEditor';
import { InvoicePreview } from './components/InvoicePreview';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';

type ViewState = 'editor' | 'auth' | 'dashboard';
type AuthMode = 'login' | 'register';

interface User {
  name: string;
  email: string;
}

// Mock Data Moved to App level so it can be shared
const MOCK_BUSINESSES_DATA: Business[] = [
  {
    id: '1',
    name: 'Tech Solutions Sh.p.k',
    nuis: 'L12345678A',
    address: 'Rr. e Kavajës, Tiranë',
    bank: 'BKT: AL122020000000000000',
    email: 'info@techsolutions.al'
  },
  {
    id: '2',
    name: 'Design Studio',
    nuis: 'K98765432B',
    address: 'Bulevardi Zogu I, Tiranë',
    bank: 'Raiffeisen: AL551234567890',
    email: 'hello@designstudio.al'
  }
];

const MOCK_CLIENTS_DATA: Client[] = [
  {
    id: '1',
    name: 'Alpha Corp',
    nuis: 'J12345678L',
    address: 'Durrës, Shqipëri',
    email: 'info@alpha.com'
  },
  {
    id: '2',
    name: 'Beta Ltd',
    nuis: 'K87654321M',
    address: 'Prishtinë, Kosovë',
    email: 'contact@beta.com'
  }
];

const App: React.FC = () => {
  const [invoice, setInvoice] = useState<InvoiceData>(INITIAL_INVOICE);
  
  // Shared Data State
  const [businesses, setBusinesses] = useState<Business[]>(MOCK_BUSINESSES_DATA);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS_DATA);

  // Navigation & Auth State
  const [view, setView] = useState<ViewState>('editor');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [user, setUser] = useState<User | null>(null);

  // Derived calculations for services
  const calculateTotal = useCallback(() => {
    const subTotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxAmount = (subTotal * invoice.taxRate) / 100;
    return subTotal + taxAmount - invoice.discount;
  }, [invoice]);

  const handlePrint = () => {
    window.print();
  };

  const handleAuthNavigation = (mode: AuthMode) => {
    setAuthMode(mode);
    setView('auth');
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setView('editor'); 
    setInvoice(INITIAL_INVOICE);
  };

  const handleDashboardCreateInvoice = (template?: Partial<InvoiceData>) => {
    if (template) {
      setInvoice({ ...INITIAL_INVOICE, ...template });
    } else {
      setInvoice(INITIAL_INVOICE);
    }
    setView('editor');
  };

  const handleAddBusiness = (newBiz: Business) => {
    setBusinesses([...businesses, newBiz]);
  };

  const handleAddClient = (newClient: Client) => {
    setClients([...clients, newClient]);
  };

  const handleLogoClick = () => {
    if (user) {
      setView('dashboard');
    } else {
      setView('editor');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-slate-900 text-white shadow-lg no-print sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
              <span className="font-bold text-xl tracking-tight">FATURA365</span>
              {user && <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-gray-300">Dashboard</span>}
            </div>
            
            <div className="flex items-center gap-4">
               {/* Show "Back to Dashboard" if in editor mode and logged in */}
               {view === 'editor' && user && (
                 <button 
                    onClick={() => setView('dashboard')}
                    className="text-sm text-slate-300 hover:text-white transition-colors mr-2"
                  >
                    <i className="fas fa-arrow-left mr-1"></i> Dashboard
                  </button>
               )}

               {view === 'editor' && !user && (
                 <>
                  <button 
                    onClick={() => setInvoice(INITIAL_INVOICE)}
                    className="text-sm text-slate-300 hover:text-white transition-colors hidden sm:block"
                  >
                    Pastro
                  </button>
                   <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
                 </>
               )}
               
               {user ? (
                 <div className="flex items-center gap-4">
                    <span className="text-sm text-emerald-400 font-medium hidden sm:block">
                      <i className="fas fa-user-circle mr-2"></i>
                      {user.name}
                    </span>
                    <button 
                      onClick={handleLogout}
                      className="text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      Dil
                    </button>
                 </div>
               ) : (
                 <div className="flex items-center gap-3">
                   <button 
                     onClick={() => handleAuthNavigation('login')}
                     className="text-sm font-medium text-slate-200 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-slate-800"
                   >
                     Hyni
                   </button>
                   <button 
                     onClick={() => handleAuthNavigation('register')}
                     className="text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md shadow-md transition-all transform hover:-translate-y-0.5"
                   >
                     Regjistrohu
                   </button>
                 </div>
               )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'auth' ? (
          <AuthPage 
            mode={authMode} 
            onSwitchMode={setAuthMode}
            onLogin={handleLoginSuccess}
            onCancel={() => setView('editor')}
          />
        ) : view === 'dashboard' && user ? (
          <Dashboard 
            user={user} 
            onCreateInvoice={handleDashboardCreateInvoice}
            businesses={businesses}
            clients={clients}
            onAddBusiness={handleAddBusiness}
            onAddClient={handleAddClient}
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
            {/* Left Side: Editor */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6 no-print">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Redakto Faturën</h2>
              </div>
              
              <InvoiceEditor 
                data={invoice} 
                onChange={setInvoice} 
                savedClients={user ? clients : []} // Only pass saved clients if user is logged in
              />
              
            </div>

            {/* Right Side: Preview */}
            <div className="w-full lg:w-1/2">
               <div className="sticky top-20 flex flex-col gap-6">
                  <div className="flex items-center justify-between no-print">
                     <h2 className="text-xl font-bold text-gray-800">Pamja Paraprake</h2>
                     <div className="flex gap-2">
                        <button 
                          onClick={handlePrint}
                          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md shadow-sm transition-colors flex items-center text-sm font-medium"
                        >
                          <i className="fas fa-download mr-2 text-gray-500"></i> Shkarko PDF
                        </button>
                         <button 
                          onClick={handlePrint}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors flex items-center text-sm font-medium"
                        >
                          <i className="fas fa-print mr-2"></i> Printo
                        </button>
                     </div>
                  </div>

                  {/* The Preview Component */}
                  <div className="border border-gray-200 shadow-xl print:border-none print:shadow-none">
                    <InvoicePreview data={invoice} />
                  </div>
                  
                  <p className="text-center text-xs text-gray-400 no-print">
                    Këshillë: Përdorni butonin "Shkarko PDF" për të ruajtur faturën. Opsioni "Save as PDF" do të shfaqet në dritaren e printimit.
                  </p>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;