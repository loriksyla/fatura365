import React, { useEffect, useState } from 'react';
import { InvoiceData, INITIAL_INVOICE, Business, Client, SavedInvoice, AppUser } from './types';
import { InvoiceEditor } from './components/InvoiceEditor';
import { InvoicePreview } from './components/InvoicePreview';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { AdBanner } from './components/AdBanner';
import { configureAmplify } from './services/amplifyConfig';
import { getSessionUser, logoutUser } from './services/authService';
import { addBusiness, addClient, addInvoice, listBusinesses, listClients, listInvoices } from './services/dataService';

type ViewState = 'editor' | 'auth' | 'dashboard';
type AuthMode = 'login' | 'register';

const App: React.FC = () => {
  const [amplifyReady, setAmplifyReady] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData>(INITIAL_INVOICE);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);

  const [view, setView] = useState<ViewState>('editor');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const ready = configureAmplify();
    setAmplifyReady(ready);

    if (!ready) {
      setIsLoading(false);
      return;
    }

    const bootstrap = async () => {
      const currentUser = await getSessionUser();
      setUser(currentUser);
      setView(currentUser ? 'dashboard' : 'editor');
      setIsLoading(false);
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (!user) {
      setBusinesses([]);
      setClients([]);
      setInvoices([]);
      return;
    }

    const loadData = async () => {
      try {
        const [biz, cli, inv] = await Promise.all([listBusinesses(), listClients(), listInvoices()]);
        setBusinesses(biz);
        setClients(cli);
        setInvoices(inv);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Gabim gjatë ngarkimit të të dhënave.');
      }
    };

    loadData();
  }, [user]);

  const handlePrint = () => window.print();

  const handleAuthNavigation = (mode: AuthMode) => {
    setAuthMode(mode);
    setView('auth');
  };

  const handleLoginSuccess = async (loggedInUser: AppUser) => {
    const currentUser = await getSessionUser();
    setUser(currentUser || loggedInUser);
    setView('dashboard');
    setMessage('Hyrja u krye me sukses.');
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setView('editor');
    setInvoice(INITIAL_INVOICE);
    setMessage('U çkyçët me sukses.');
  };

  const handleDashboardCreateInvoice = (template?: Partial<InvoiceData>) => {
    setInvoice(template ? { ...INITIAL_INVOICE, ...template } : INITIAL_INVOICE);
    setView('editor');
  };

  const handleAddBusiness = async (newBiz: Omit<Business, 'id'>) => {
    const created = await addBusiness(newBiz);
    setBusinesses((prev) => [created, ...prev]);
  };

  const handleAddClient = async (newClient: Omit<Client, 'id'>) => {
    const created = await addClient(newClient);
    setClients((prev) => [created, ...prev]);
  };

  const handleSaveInvoice = async () => {
    if (!user) {
      setMessage('Duhet të hyni për ta ruajtur faturën.');
      handleAuthNavigation('login');
      return;
    }

    try {
      const created = await addInvoice(invoice);
      setInvoices((prev) => [created, ...prev]);
      setMessage('Fatura u ruajt me sukses.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Gabim gjatë ruajtjes së faturës.');
    }
  };

  const handleLogoClick = () => {
    setView(user ? 'dashboard' : 'editor');
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600">Duke ngarkuar...</div>;
  }

  if (!amplifyReady) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-slate-900">Amplify nuk është konfiguruar ende</h1>
          <p className="text-slate-600 mt-2">Ekzekuto setup-in e Amplify dhe zëvendëso `amplify_outputs.json` me output-in real.</p>
          <pre className="bg-slate-900 text-slate-100 text-sm p-4 rounded-lg mt-4 overflow-auto">npm i{`\n`}npm run amplify:sandbox</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-900 text-white shadow-lg no-print sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
              <span className="font-bold text-xl tracking-tight">FATURA365</span>
              {user && <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-gray-300">Dashboard</span>}
            </div>

            <div className="flex items-center gap-4">
              {view === 'editor' && user && (
                <button onClick={() => setView('dashboard')} className="text-sm text-slate-300 hover:text-white">
                  Dashboard
                </button>
              )}

              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-emerald-400 font-medium hidden sm:block">{user.email}</span>
                  <button onClick={handleLogout} className="text-sm text-slate-300 hover:text-white">Dil</button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button onClick={() => handleAuthNavigation('login')} className="text-sm font-medium text-slate-200 hover:text-white px-3 py-2 rounded-md">Hyni</button>
                  <button onClick={() => handleAuthNavigation('register')} className="text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md">Regjistrohu</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {!!message && <div className="text-sm bg-blue-50 border border-blue-100 text-blue-700 rounded-lg p-3">{message}</div>}

        {view === 'auth' ? (
          <AuthPage mode={authMode} onSwitchMode={setAuthMode} onLogin={handleLoginSuccess} onCancel={() => setView('editor')} />
        ) : view === 'dashboard' && user ? (
          <Dashboard
            user={user}
            onCreateInvoice={handleDashboardCreateInvoice}
            businesses={businesses}
            clients={clients}
            invoices={invoices}
            onAddBusiness={handleAddBusiness}
            onAddClient={handleAddClient}
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
            <div className="w-full lg:w-1/2 flex flex-col gap-6 no-print">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Redakto Faturën</h2>
              </div>

              <InvoiceEditor data={invoice} onChange={setInvoice} savedClients={user ? clients : []} />
              <AdBanner />
            </div>

            <div className="w-full lg:w-1/2">
              <div className="sticky top-20 flex flex-col gap-6">
                <div className="flex items-center justify-between no-print">
                  <h2 className="text-xl font-bold text-gray-800">Pamja Paraprake</h2>
                  <div className="flex gap-2">
                    <button onClick={handleSaveInvoice} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Ruaj
                    </button>
                    <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Printo / PDF
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 shadow-xl print:border-none print:shadow-none">
                  <InvoicePreview data={invoice} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
