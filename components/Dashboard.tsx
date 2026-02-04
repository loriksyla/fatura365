import React, { useState, ChangeEvent } from 'react';
import { Business, Client, SavedInvoice, InvoiceData, INITIAL_INVOICE } from '../types';

interface DashboardProps {
  user: { name: string; email: string };
  onCreateInvoice: (template?: Partial<InvoiceData>) => void;
  businesses: Business[];
  clients: Client[];
  invoices: SavedInvoice[];
  onAddBusiness: (biz: Omit<Business, 'id'>) => Promise<void>;
  onAddClient: (client: Omit<Client, 'id'>) => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onCreateInvoice,
  businesses,
  clients,
  invoices,
  onAddBusiness,
  onAddClient,
}) => {
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleBusinessLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewBusiness((prev) => ({ ...prev, logo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onAddBusiness(newBusiness);
      setNewBusiness({ name: '', nuis: '', address: '', bank: '', email: '', logo: '' });
      setShowBusinessModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onAddClient(newClient);
      setNewClient({ name: '', nuis: '', address: '', email: '' });
      setShowClientModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
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
              <button onClick={() => setShowBusinessModal(true)} className="text-sm text-blue-600 font-medium">Shto</button>
            </div>
            <div className="space-y-3">
              {businesses.map((biz) => (
                <div key={biz.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer" onClick={() => handleUseBusiness(biz)}>
                  <h3 className="font-semibold text-gray-900 text-sm">{biz.name}</h3>
                  <p className="text-xs text-gray-500">{biz.nuis}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Klientët e mi</h2>
              <button onClick={() => setShowClientModal(true)} className="text-sm text-blue-600 font-medium">Shto</button>
            </div>
            <div className="space-y-3">
              {clients.map((client) => (
                <div key={client.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer" onClick={() => handleUseClient(client)}>
                  <h3 className="font-semibold text-gray-900 text-sm">{client.name}</h3>
                  <p className="text-xs text-gray-500">{client.nuis}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Faturat e fundit</h2>
            <button onClick={() => onCreateInvoice()} className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md">
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.length === 0 && (
                    <tr>
                      <td className="px-6 py-6 text-gray-400" colSpan={4}>Nuk ka fatura ende.</td>
                    </tr>
                  )}
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{inv.number}</td>
                      <td className="px-6 py-4 text-gray-600">{inv.client}</td>
                      <td className="px-6 py-4 text-gray-500">{inv.date}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{inv.amount.toLocaleString()} {inv.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showBusinessModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowBusinessModal(false)} />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Regjistro Biznes të Ri</h3>
                <form onSubmit={handleAddBusinessSubmit} className="space-y-4">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50">
                    {newBusiness.logo ? <img src={newBusiness.logo} alt="Logo" className="h-full object-contain p-2" /> : <p className="text-sm text-gray-500">Ngarko logo</p>}
                    <input type="file" className="hidden" accept="image/*" onChange={handleBusinessLogoUpload} />
                  </label>
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
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowClientModal(false)} />
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shto Klient të Ri</h3>
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
    </div>
  );
};
