import React, { useEffect, useState } from 'react';
import { InvoiceData, INITIAL_INVOICE, Business, Client, SavedInvoice, AppUser } from './types';
import { InvoiceEditor } from './components/InvoiceEditor';
import { InvoicePreview } from './components/InvoicePreview';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { AdBanner } from './components/AdBanner';
import { configureAmplify } from './services/amplifyConfig';
import { getSessionUser, logoutUser } from './services/authService';
import {
  addBusiness,
  addClient,
  addInvoice,
  deleteBusiness,
  deleteClient,
  deleteInvoice,
  listBusinesses,
  listClients,
  listInvoices,
  updateBusiness,
  updateClient,
  updateInvoice,
} from './services/dataService';

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
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);
  const [printPreviewInvoice, setPrintPreviewInvoice] = useState<InvoiceData | null>(null);

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

    let retries = 0;

    const loadData = async () => {
      try {
        const [biz, cli, inv] = await Promise.all([listBusinesses(), listClients(), listInvoices()]);
        setBusinesses(biz);
        setClients(cli);
        setInvoices(inv);
        setMessage('');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Gabim gjatë ngarkimit të të dhënave.';
        if (errorMessage.toLowerCase().includes('no current user') && retries < 2) {
          retries += 1;
          setTimeout(loadData, 600);
          return;
        }
        setMessage(errorMessage);
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
    setEditingInvoiceId(null);
    setPrintPreviewInvoice(null);
    setMessage('U çkyçët me sukses.');
  };

  const handleDashboardCreateInvoice = (template?: Partial<InvoiceData>) => {
    setInvoice(template ? { ...INITIAL_INVOICE, ...template } : INITIAL_INVOICE);
    setEditingInvoiceId(null);
    setPrintPreviewInvoice(null);
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

  const handleUpdateBusiness = async (id: string, input: Omit<Business, 'id'>) => {
    const updated = await updateBusiness(id, input);
    setBusinesses((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  const handleUpdateClient = async (id: string, input: Omit<Client, 'id'>) => {
    const updated = await updateClient(id, input);
    setClients((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  const handleDeleteBusiness = async (id: string) => {
    await deleteBusiness(id);
    setBusinesses((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDeleteClient = async (id: string) => {
    await deleteClient(id);
    setClients((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveInvoice = async () => {
    if (!user) {
      setMessage('Duhet të hyni për ta ruajtur faturën.');
      handleAuthNavigation('login');
      return;
    }

    setIsSavingInvoice(true);
    try {
      if (editingInvoiceId) {
        const updated = await updateInvoice(editingInvoiceId, invoice);
        setInvoices((prev) => prev.map((item) => (item.id === editingInvoiceId ? updated : item)));
        setMessage('Fatura u përditësua me sukses.');
      } else {
        const created = await addInvoice(invoice);
        setInvoices((prev) => [created, ...prev]);
        setMessage('Fatura u ruajt me sukses.');
      }
      setEditingInvoiceId(null);
      setView('dashboard');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Gabim gjatë ruajtjes së faturës.');
    } finally {
      setIsSavingInvoice(false);
    }
  };

  const handleEditInvoice = (saved: SavedInvoice) => {
    if (saved.snapshot) {
      const senderName = saved.snapshot.senderName?.trim();
      const senderId = saved.snapshot.senderId?.trim();
      const senderEmail = saved.snapshot.senderEmail?.trim();
      const businessLogo =
        businesses.find((b) => senderId && b.nuis?.trim() === senderId)?.logo ||
        businesses.find((b) => senderEmail && b.email?.trim() === senderEmail)?.logo ||
        businesses.find((b) => senderName && b.name?.trim() === senderName)?.logo ||
        null;
      setInvoice({
        ...INITIAL_INVOICE,
        ...saved.snapshot,
        logo: saved.snapshot.logo || businessLogo,
      });
      setEditingInvoiceId(saved.id);
      setMessage(`Po editon faturën ${saved.number}.`);
      setView('editor');
      return;
    }

    setMessage('Kjo faturë është pa snapshot të plotë. Mund ta krijosh si të re.');
  };

  const handlePrintSavedInvoice = (saved: SavedInvoice) => {
    if (!saved.snapshot) {
      setMessage('Kjo faturë është pa të dhëna të plota për printim.');
      return;
    }

    const senderName = saved.snapshot.senderName?.trim();
    const senderId = saved.snapshot.senderId?.trim();
    const senderEmail = saved.snapshot.senderEmail?.trim();
    const businessLogo =
      businesses.find((b) => senderId && b.nuis?.trim() === senderId)?.logo ||
      businesses.find((b) => senderEmail && b.email?.trim() === senderEmail)?.logo ||
      businesses.find((b) => senderName && b.name?.trim() === senderName)?.logo ||
      null;

    const previewData: InvoiceData = {
      ...INITIAL_INVOICE,
      ...saved.snapshot,
      logo: saved.snapshot.logo || businessLogo,
    };
    setPrintPreviewInvoice(previewData);
    setMessage(`Pamje printimi për ${saved.number}.`);
  };

  const handleDeleteInvoice = async (id: string) => {
    await deleteInvoice(id);
    setInvoices((prev) => prev.filter((item) => item.id !== id));
    if (editingInvoiceId === id) {
      setEditingInvoiceId(null);
    }
    setMessage('Fatura u fshi me sukses.');
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
          <div className="flex flex-wrap items-center justify-between gap-2 py-2 sm:h-16 sm:py-0">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
              <span className="font-bold text-xl tracking-tight">FATURA365</span>
              {user && <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-gray-300">Dashboard</span>}
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
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

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-4 no-print">
        {!!message.trim() && <div className="text-sm bg-blue-50 border border-blue-100 text-blue-700 rounded-lg p-3 no-print break-words">{message}</div>}

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
            onUpdateBusiness={handleUpdateBusiness}
            onUpdateClient={handleUpdateClient}
            onDeleteBusiness={handleDeleteBusiness}
            onDeleteClient={handleDeleteClient}
            onEditInvoice={handleEditInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onPrintInvoice={handlePrintSavedInvoice}
          />
        ) : (
          <div className="flex flex-col xl:flex-row gap-5 sm:gap-8 animate-fade-in">
            <div className="w-full xl:w-1/2 flex flex-col gap-4 sm:gap-6 no-print">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Redakto Faturën</h2>
                {user && (
                  <button
                    type="button"
                    disabled={isSavingInvoice}
                    onClick={() => setView('dashboard')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Kthehu te Dashboard
                  </button>
                )}
              </div>

              <InvoiceEditor data={invoice} onChange={setInvoice} savedClients={user ? clients : []} />
              <AdBanner />
            </div>

            <div className="w-full xl:w-1/2">
              <div className="xl:sticky xl:top-20 flex flex-col gap-4 sm:gap-6">
                <div className="flex items-center justify-between no-print">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Pamja Paraprake</h2>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      onClick={handleSaveInvoice}
                      disabled={isSavingInvoice}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingInvoice ? 'Duke ruajtur...' : editingInvoiceId ? 'Ruaj Ndryshimet' : 'Ruaj'}
                    </button>
                    <button
                      onClick={handlePrint}
                      disabled={isSavingInvoice}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Printo / PDF
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 shadow-lg sm:shadow-xl print:border-none print:shadow-none overflow-x-auto">
                  <InvoicePreview data={invoice} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      {printPreviewInvoice && (
        <div className="fixed inset-0 z-[115] bg-slate-900/60 backdrop-blur-sm no-print p-3 sm:p-6">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            <div className="flex items-center justify-between mb-3 text-white">
              <h3 className="font-semibold">Preview para printimit</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-2 text-sm rounded-md bg-emerald-600 hover:bg-emerald-500"
                >
                  Printo
                </button>
                <button
                  type="button"
                  onClick={() => setPrintPreviewInvoice(null)}
                  className="px-3 py-2 text-sm rounded-md bg-slate-700 hover:bg-slate-600"
                >
                  Mbyll
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto rounded-lg border border-slate-700 bg-slate-800/40 p-2 sm:p-4">
              <div className="mx-auto w-full max-w-[210mm]">
                <InvoicePreview data={printPreviewInvoice} />
              </div>
            </div>
          </div>
        </div>
      )}
      {(view === 'editor' || !!printPreviewInvoice) && (
        <section className="print-only">
          <InvoicePreview data={printPreviewInvoice || invoice} />
        </section>
      )}
      {isSavingInvoice && (
        <div className="fixed inset-0 z-[120] bg-slate-900/35 backdrop-blur-sm flex items-center justify-center no-print">
          <div className="bg-white rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3 min-w-64">
            <div className="h-10 w-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
            <p className="text-slate-900 font-semibold text-sm">Duke ruajtur faturën...</p>
            <div className="flex gap-1">
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce" />
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:120ms]" />
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:240ms]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
