import React, { useState, ChangeEvent } from 'react';
import { Business, Client, SavedInvoice, InvoiceData, INITIAL_INVOICE } from '../types';
import { compressImageToDataUrl } from '../services/imageService';

interface DashboardProps {
  user: { name: string; email: string };
  onCreateInvoice: (template?: Partial<InvoiceData>) => void;
  businesses: Business[];
  clients: Client[];
  invoices: SavedInvoice[];
  onAddBusiness: (biz: Omit<Business, 'id'>) => Promise<void>;
  onAddClient: (client: Omit<Client, 'id'>) => Promise<void>;
  onDeleteBusiness: (id: string) => Promise<void>;
  onDeleteClient: (id: string) => Promise<void>;
  onEditInvoice: (invoice: SavedInvoice) => void;
  onDeleteInvoice: (id: string) => Promise<void>;
  onPrintInvoice: (invoice: SavedInvoice) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onCreateInvoice,
  businesses,
  clients,
  invoices,
  onAddBusiness,
  onAddClient,
  onDeleteBusiness,
  onDeleteClient,
  onEditInvoice,
  onDeleteInvoice,
  onPrintInvoice,
}) => {
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  const [newBusiness, setNewBusiness] = useState<Omit<Business, 'id'>>({
    name: '', nuis: '', address: '', bank: '', email: '', logo: '',
  });
  const [newClient, setNewClient] = useState<Omit<Client, 'id'>>({ name: '', nuis: '', address: '', email: '' });

  const handleUseBusiness = (biz: Business) => {
    const template: Partial<InvoiceData> = {
      ...INITIAL_INVOICE,
      senderName: biz.name,
      senderId: biz.nuis,
      senderAddress: biz.address,
      senderBank: biz.bank,
      senderEmail: biz.email,
      logo: biz.logo || null,
    };
    onCreateInvoice(template);
  };

  const handleUseClient = (client: Client) => {
    const template: Partial<InvoiceData> = {
      ...INITIAL_INVOICE,
      receiverName: client.name,
      receiverId: client.nuis,
      receiverAddress: client.address,
      receiverEmail: client.email,
    };
    onCreateInvoice(template);
  };

  const handleDeleteBusinessClick = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('A je i sigurt që don me fshi këtë biznes?')) return;
    setFormError('');
    try {
      await onDeleteBusiness(id);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Nuk u fshi biznesi.');
    }
  };

  const handleDeleteClientClick = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('A je i sigurt që don me fshi këtë klient?')) return;
    setFormError('');
    try {
      await onDeleteClient(id);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Nuk u fshi klienti.');
    }
  };

  const handleDeleteInvoiceClick = async (id: string) => {
    if (!confirm('A je i sigurt që don me fshi këtë faturë?')) return;
    setFormError('');
    try {
      await onDeleteInvoice(id);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Nuk u fshi fatura.');
    }
  };

  const shortInvoiceNumber = (number: string) => {
    if (number.length <= 16) return number;
    return `${number.slice(0, 8)}...${number.slice(-4)}`;
  };

  const handleQuickCreateInvoice = () => {
    const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);
    const selectedClient = clients.find((c) => c.id === selectedClientId);

    const template: Partial<InvoiceData> = {
      ...INITIAL_INVOICE,
      ...(selectedBusiness
        ? {
            senderName: selectedBusiness.name,
            senderId: selectedBusiness.nuis,
            senderAddress: selectedBusiness.address,
            senderBank: selectedBusiness.bank,
            senderEmail: selectedBusiness.email,
            logo: selectedBusiness.logo || null,
          }
        : {}),
      ...(selectedClient
        ? {
            receiverName: selectedClient.name,
            receiverId: selectedClient.nuis,
            receiverAddress: selectedClient.address,
            receiverEmail: selectedClient.email,
          }
        : {}),
    };

    setShowCreateInvoiceModal(false);
    setSelectedBusinessId('');
    setSelectedClientId('');
    onCreateInvoice(template);
  };

  const handleBusinessLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageToDataUrl(file);
      setNewBusiness((prev) => ({ ...prev, logo: compressed }));
    } catch (err) {
      console.error(err);
      setFormError('Nuk u kompresua logoja. Provo një file tjetër.');
    }
  };

  const handleAddBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError('');

    try {
      await onAddBusiness(newBusiness);
      setNewBusiness({ name: '', nuis: '', address: '', bank: '', email: '', logo: '' });
      setShowBusinessModal(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Nuk u ruajt biznesi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError('');

    try {
      await onAddClient(newClient);
      setNewClient({ name: '', nuis: '', address: '', email: '' });
      setShowClientModal(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Nuk u ruajt klienti.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {!!formError && <div className="text-sm bg-red-50 border border-red-100 text-red-700 rounded-lg p-3">{formError}</div>}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mirësevini, {user.name} 👋</h1>
        <p className="text-gray-500 mt-1">Këtu është përmbledhja e aktivitetit tuaj.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Bizneset e mia</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{businesses.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Klientë total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{clients.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Fatura totale</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{invoices.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Bizneset e mia</h2>
              <button onClick={() => { setFormError(''); setShowBusinessModal(true); }} className="text-sm text-blue-600 font-medium">Shto</button>
            </div>
            <div className="space-y-3">
              {businesses.map((biz) => (
                <div key={biz.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer" onClick={() => handleUseBusiness(biz)}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{biz.name}</h3>
                      <p className="text-xs text-gray-500">{biz.nuis}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteBusinessClick(e, biz.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Fshij
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Klientët e mi</h2>
              <button onClick={() => { setFormError(''); setShowClientModal(true); }} className="text-sm text-blue-600 font-medium">Shto</button>
            </div>
            <div className="space-y-3">
              {clients.map((client) => (
                <div key={client.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer" onClick={() => handleUseClient(client)}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{client.name}</h3>
                      <p className="text-xs text-gray-500">{client.nuis}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClientClick(e, client.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Fshij
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Faturat e fundit</h2>
            <button
              onClick={() => {
                setFormError('');
                setShowCreateInvoiceModal(true);
              }}
              className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md"
            >
              Krijo Faturë
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Fatura #</th>
                    <th className="px-6 py-4">Klienti</th>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Shuma</th>
                    <th className="px-6 py-4 text-right">Veprime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.length === 0 && (
                    <tr>
                      <td className="px-6 py-6 text-gray-400" colSpan={5}>Nuk ka fatura ende.</td>
                    </tr>
                  )}
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900" title={inv.number}>{shortInvoiceNumber(inv.number)}</td>
                      <td className="px-6 py-4 text-gray-600">{inv.client}</td>
                      <td className="px-6 py-4 text-gray-500">{inv.date}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{inv.amount.toLocaleString()} {inv.currency}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center rounded-md border border-gray-200 overflow-hidden">
                          <button
                            type="button"
                            className="px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 border-r border-gray-200"
                            onClick={() => onPrintInvoice(inv)}
                            title="Printo"
                          >
                            <i className="fas fa-print mr-1" /> Print
                          </button>
                          <button
                            type="button"
                            className="px-2.5 py-1.5 text-xs text-blue-700 hover:bg-blue-50 border-r border-gray-200"
                            onClick={() => onEditInvoice(inv)}
                            title="Edito"
                          >
                            <i className="fas fa-pen mr-1" /> Edit
                          </button>
                          <button
                            type="button"
                            className="px-2.5 py-1.5 text-xs text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteInvoiceClick(inv.id)}
                            title="Fshij"
                          >
                            <i className="fas fa-trash mr-1" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showBusinessModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-gray-500/75" onClick={() => setShowBusinessModal(false)} />
          <div className="relative min-h-screen flex items-end sm:items-center justify-center p-4 pointer-events-none">
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl sm:my-8 sm:max-w-lg sm:w-full pointer-events-auto">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Regjistro Biznes të Ri</h3>
                {!!formError && <div className="mb-3 text-sm bg-red-50 border border-red-100 text-red-700 p-2 rounded">{formError}</div>}
                <form onSubmit={handleAddBusinessSubmit} className="space-y-4">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50">
                    {newBusiness.logo ? <img src={newBusiness.logo} alt="Logo" className="h-full object-contain p-2" /> : <p className="text-sm text-gray-500">Ngarko logo</p>}
                    <input type="file" className="hidden" accept="image/*" onChange={handleBusinessLogoUpload} />
                  </label>
                  {newBusiness.logo && (
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:text-red-700"
                      onClick={() => setNewBusiness((prev) => ({ ...prev, logo: '' }))}
                    >
                      Hiq logon
                    </button>
                  )}
                  <input type="text" required value={newBusiness.name} onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })} placeholder="Emri i biznesit" className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
                  <input type="text" required value={newBusiness.nuis} onChange={(e) => setNewBusiness({ ...newBusiness, nuis: e.target.value })} placeholder="NUIS / NIPT" className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
                  <input type="email" value={newBusiness.email} onChange={(e) => setNewBusiness({ ...newBusiness, email: e.target.value })} placeholder="Email" className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
                  <input type="text" value={newBusiness.bank} onChange={(e) => setNewBusiness({ ...newBusiness, bank: e.target.value })} placeholder="IBAN" className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
                  <textarea rows={2} required value={newBusiness.address} onChange={(e) => setNewBusiness({ ...newBusiness, address: e.target.value })} placeholder="Adresa" className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
                  <div className="mt-5 sm:mt-6 flex gap-3">
                    <button type="submit" disabled={isSaving} className="w-full rounded-md px-4 py-2 bg-blue-600 text-white">{isSaving ? 'Duke ruajtur...' : 'Ruaj'}</button>
                    <button type="button" onClick={() => setShowBusinessModal(false)} className="w-full rounded-md border border-gray-300 px-4 py-2">Anulo</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showClientModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-gray-500/75" onClick={() => setShowClientModal(false)} />
          <div className="relative min-h-screen flex items-end sm:items-center justify-center p-4 pointer-events-none">
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl sm:my-8 sm:max-w-lg sm:w-full pointer-events-auto">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shto Klient të Ri</h3>
                {!!formError && <div className="mb-3 text-sm bg-red-50 border border-red-100 text-red-700 p-2 rounded">{formError}</div>}
                <form onSubmit={handleAddClientSubmit} className="space-y-4">
                  <input type="text" required value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} placeholder="Emri i klientit" className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
                  <input type="text" value={newClient.nuis} onChange={(e) => setNewClient({ ...newClient, nuis: e.target.value })} placeholder="NUIS / NIPT" className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
                  <input type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} placeholder="Email" className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
                  <textarea rows={2} value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} placeholder="Adresa" className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3" />
                  <div className="mt-5 sm:mt-6 flex gap-3">
                    <button type="submit" disabled={isSaving} className="w-full rounded-md px-4 py-2 bg-emerald-600 text-white">{isSaving ? 'Duke ruajtur...' : 'Ruaj'}</button>
                    <button type="button" onClick={() => setShowClientModal(false)} className="w-full rounded-md border border-gray-300 px-4 py-2">Anulo</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-gray-500/75" onClick={() => setShowCreateInvoiceModal(false)} />
          <div className="relative min-h-screen flex items-end sm:items-center justify-center p-4 pointer-events-none">
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl sm:my-8 sm:max-w-lg sm:w-full pointer-events-auto">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Krijo Faturë të Re</h3>
                <p className="text-sm text-gray-500">
                  Zgjidh biznesin dhe klientin nëse i ke të ruajtur, ose lëri bosh për faturë one-time.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biznesi (opsionale)</label>
                  <select
                    value={selectedBusinessId}
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md py-2 px-3 bg-white"
                  >
                    <option value="">Pa biznes të ruajtur (empty)</option>
                    {businesses.map((biz) => (
                      <option key={biz.id} value={biz.id}>
                        {biz.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Klienti (opsionale)</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md py-2 px-3 bg-white"
                  >
                    <option value="">Pa klient të ruajtur (one-time)</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 sm:mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={handleQuickCreateInvoice}
                    className="w-full rounded-md px-4 py-2 bg-slate-900 text-white"
                  >
                    Vazhdo
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateInvoiceModal(false)}
                    className="w-full rounded-md border border-gray-300 px-4 py-2"
                  >
                    Anulo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
