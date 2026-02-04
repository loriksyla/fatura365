import React, { useState, ChangeEvent } from 'react';
import { Business, Client, SavedInvoice, InvoiceData, INITIAL_INVOICE } from '../types';

interface DashboardProps {
  user: { name: string; email: string };
  onCreateInvoice: (template?: Partial<InvoiceData>) => void;
  businesses: Business[];
  clients: Client[];
  onAddBusiness: (biz: Business) => void;
  onAddClient: (client: Client) => void;
}

const MOCK_INVOICES: SavedInvoice[] = [
  { id: '101', number: 'INV-001', client: 'Alpha Corp', date: '2023-10-15', amount: 1250.00, currency: 'EUR' },
  { id: '102', number: 'INV-002', client: 'Beta Ltd', date: '2023-10-20', amount: 45000, currency: 'ALL' },
  { id: '103', number: 'INV-003', client: 'Gamma Group', date: '2023-10-22', amount: 850.50, currency: 'EUR' },
  { id: '104', number: 'INV-004', client: 'Delta Systems', date: '2023-10-25', amount: 200.00, currency: 'USD' },
];

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onCreateInvoice, 
  businesses, 
  clients, 
  onAddBusiness, 
  onAddClient 
}) => {
  
  // Modal States
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);

  // Form States
  const [newBusiness, setNewBusiness] = useState<Omit<Business, 'id'>>({ 
    name: '', nuis: '', address: '', bank: '', email: '', logo: '' 
  });
  const [newClient, setNewClient] = useState({ name: '', nuis: '', address: '', email: '' });

  const handleUseBusiness = (biz: Business) => {
    const template: Partial<InvoiceData> = {
      ...INITIAL_INVOICE,
      senderName: biz.name,
      senderId: biz.nuis,
      senderAddress: biz.address,
      senderBank: biz.bank,
      senderEmail: biz.email,
      logo: biz.logo || null
    };
    onCreateInvoice(template);
  };

  const handleUseClient = (client: Client) => {
    const template: Partial<InvoiceData> = {
      ...INITIAL_INVOICE,
      receiverName: client.name,
      receiverId: client.nuis,
      receiverAddress: client.address,
      receiverEmail: client.email
    };
    onCreateInvoice(template);
  };

  const handleBusinessLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBusiness(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const biz: Business = {
      id: Date.now().toString(),
      ...newBusiness
    };
    onAddBusiness(biz);
    setNewBusiness({ name: '', nuis: '', address: '', bank: '', email: '', logo: '' });
    setShowBusinessModal(false);
  };

  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client: Client = {
      id: Date.now().toString(),
      name: newClient.name,
      nuis: newClient.nuis,
      address: newClient.address,
      email: newClient.email
    };
    onAddClient(client);
    setNewClient({ name: '', nuis: '', address: '', email: '' });
    setShowClientModal(false);
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Welcome & Stats */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mirësevini, {user.name} 👋</h1>
        <p className="text-gray-500 mt-1">Këtu është përmbledhja e aktivitetit tuaj.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Bizneset e mia</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{businesses.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-xl">
              <i className="fas fa-briefcase"></i>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Klientë Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{clients.length}</p>
            </div>
            <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 text-xl">
              <i className="fas fa-users"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Businesses & Clients */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* My Businesses */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Bizneset e mia</h2>
              <button 
                onClick={() => setShowBusinessModal(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <i className="fas fa-plus mr-1"></i> Shto
              </button>
            </div>
            <div className="space-y-3">
              {businesses.map(biz => (
                <div key={biz.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer group" onClick={() => handleUseBusiness(biz)}>
                   <div className="flex items-center gap-3">
                     <div className="h-10 w-10 bg-slate-800 rounded-md flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                       {biz.logo ? (
                         <img src={biz.logo} alt={biz.name} className="w-full h-full object-cover" />
                       ) : (
                         biz.name.substring(0, 2).toUpperCase()
                       )}
                     </div>
                     <div className="flex-1">
                       <h3 className="font-semibold text-gray-900 text-sm">{biz.name}</h3>
                       <p className="text-xs text-gray-500">{biz.nuis}</p>
                     </div>
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <i className="fas fa-arrow-right text-gray-400"></i>
                     </div>
                   </div>
                   <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
                      <span className="text-xs text-gray-400">Përdor për faturë të re</span>
                   </div>
                </div>
              ))}
            </div>
          </section>

          {/* My Clients */}
          <section>
             <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Klientët e mi</h2>
              <button 
                onClick={() => setShowClientModal(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <i className="fas fa-plus mr-1"></i> Shto
              </button>
            </div>
             <div className="space-y-3">
              {clients.map(client => (
                <div key={client.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-green-300 transition-colors cursor-pointer group" onClick={() => handleUseClient(client)}>
                   <div className="flex items-center gap-3">
                     <div className="h-10 w-10 bg-emerald-600 rounded-md flex items-center justify-center text-white font-bold text-sm">
                       {client.name.substring(0, 2).toUpperCase()}
                     </div>
                     <div className="flex-1">
                       <h3 className="font-semibold text-gray-900 text-sm">{client.name}</h3>
                       <p className="text-xs text-gray-500">{client.nuis}</p>
                     </div>
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <i className="fas fa-arrow-right text-gray-400"></i>
                     </div>
                   </div>
                   <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
                      <span className="text-xs text-gray-400">Përdor për faturë të re</span>
                   </div>
                </div>
              ))}
             </div>
          </section>
        </div>

        {/* Right Column: Recent Invoices */}
        <div className="lg:col-span-2">
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Faturat e Fundit</h2>
              <button 
                onClick={() => onCreateInvoice()}
                className="bg-slate-900 hover:bg-slate-800 text-white text-sm px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
              >
                <i className="fas fa-plus mr-2"></i> Krijo Faturë
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
                      <th className="px-6 py-4">Veprime</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOCK_INVOICES.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{inv.number}</td>
                        <td className="px-6 py-4 text-gray-600">{inv.client}</td>
                        <td className="px-6 py-4 text-gray-500">{inv.date}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {inv.amount.toLocaleString()} {inv.currency}
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-gray-400 hover:text-blue-600 transition-colors mx-1" title="Shiko">
                            <i className="fas fa-eye"></i>
                          </button>
                           <button className="text-gray-400 hover:text-gray-600 transition-colors mx-1" title="Shkarko">
                            <i className="fas fa-download"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Shiko të gjitha faturat
                </button>
              </div>
            </div>
        </div>
      </div>

      {/* MODAL: Add Business */}
      {showBusinessModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowBusinessModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">Regjistro Biznes të Ri</h3>
                <form onSubmit={handleAddBusinessSubmit}>
                  <div className="space-y-4">
                    
                    {/* Logo Upload */}
                    <div className="flex items-center justify-center w-full">
                       <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          {newBusiness.logo ? (
                            <img src={newBusiness.logo} alt="Preview" className="h-full object-contain p-2" />
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <i className="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-2"></i>
                              <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Kliko për të ngarkuar logon</span></p>
                              <p className="text-xs text-gray-500">SVG, PNG, JPG</p>
                            </div>
                          )}
                          <input type="file" className="hidden" accept="image/*" onChange={handleBusinessLogoUpload} />
                        </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Emri i Biznesit</label>
                      <input 
                        type="text" required
                        value={newBusiness.name}
                        onChange={(e) => setNewBusiness({...newBusiness, name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                        <label className="block text-sm font-medium text-gray-700">NUIS / NIPT</label>
                        <input 
                          type="text" required
                          value={newBusiness.nuis}
                          onChange={(e) => setNewBusiness({...newBusiness, nuis: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                          type="email"
                          value={newBusiness.email}
                          onChange={(e) => setNewBusiness({...newBusiness, email: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Llogaria Bankare (IBAN)</label>
                      <input 
                        type="text"
                        value={newBusiness.bank}
                        onChange={(e) => setNewBusiness({...newBusiness, bank: e.target.value})}
                        placeholder="Emri Bankës: AL..."
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Adresa</label>
                      <textarea 
                        rows={2} required
                        value={newBusiness.address}
                        onChange={(e) => setNewBusiness({...newBusiness, address: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 flex gap-3">
                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm">
                      Ruaj
                    </button>
                    <button type="button" onClick={() => setShowBusinessModal(false)} className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm">
                      Anulo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Client */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowClientModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">Shto Klient të Ri</h3>
                <form onSubmit={handleAddClientSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Emri i Klientit</label>
                      <input 
                        type="text" required
                        value={newClient.name}
                        onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">NUIS / NIPT</label>
                      <input 
                        type="text"
                        value={newClient.nuis}
                        onChange={(e) => setNewClient({...newClient, nuis: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input 
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Adresa</label>
                      <textarea 
                        rows={2}
                        value={newClient.address}
                        onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 flex gap-3">
                    <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:text-sm">
                      Ruaj
                    </button>
                    <button type="button" onClick={() => setShowClientModal(false)} className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm">
                      Anulo
                    </button>
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