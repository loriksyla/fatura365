import React, { ChangeEvent, useState, useRef, useEffect } from 'react';
import { InvoiceData, LineItem, Client } from '../types';

interface InvoiceEditorProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
  savedClients?: Client[];
}

const formatDateForDisplay = (isoDate: string) => {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
};

const DatePicker: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
}> = ({ label, value, onChange }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    onChange(today);
    setShowMenu(false);
  };

  const handleTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    onChange(d.toISOString().split('T')[0]);
    setShowMenu(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-full text-right bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center shadow-sm"
        >
          <span className={!value ? "text-gray-400" : "font-medium"}>
             {value ? formatDateForDisplay(value) : 'Zgjidh datën'}
          </span>
          <i className="fas fa-calendar-alt text-gray-400 ml-2"></i>
        </button>

        {showMenu && (
          <div className="absolute right-0 z-20 mt-1 w-full sm:w-56 bg-white shadow-xl rounded-md py-1 border border-gray-200 text-sm animate-fade-in">
            <button
              onClick={handleToday}
              className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
              <i className="fas fa-sun mr-3 text-amber-500 w-4"></i> Sot
            </button>
            <button
              onClick={handleTomorrow}
              className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
              <i className="fas fa-calendar-plus mr-3 text-blue-500 w-4"></i> Nesër
            </button>
            <div className="relative border-t border-gray-100 mt-1 pt-1">
               <input
                type="date"
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                onChange={(e) => {
                  onChange(e.target.value);
                  setShowMenu(false);
                }}
              />
              <button className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                <i className="fas fa-edit mr-3 text-gray-400 w-4"></i> Zgjidh nga kalendari...
              </button>
            </div>
             <button
              onClick={() => { onChange(''); setShowMenu(false); }}
              className="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1 transition-colors"
            >
              <i className="fas fa-times mr-3 w-4"></i> Pastro
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ data, onChange, savedClients = [] }) => {

  const handleInputChange = (field: keyof InvoiceData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClientSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    const client = savedClients.find(c => c.id === clientId);
    
    if (client) {
      onChange({
        ...data,
        receiverName: client.name,
        receiverId: client.nuis,
        receiverAddress: client.address,
        receiverEmail: client.email,
        // Since client interface doesn't have bank, we keep existing or empty
      });
    }
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    const newItems = data.items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange({ ...data, items: newItems });
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (id: string) => {
    onChange({ ...data, items: data.items.filter(i => i.id !== id) });
  };

  // Theme colors configuration
  const themeColors = [
    { id: 'gray', bg: 'bg-gray-800', label: 'Default' },
    { id: 'red', bg: 'bg-red-600', label: 'E Kuqe' },
    { id: 'blue', bg: 'bg-blue-600', label: 'E Kaltër' },
    { id: 'orange', bg: 'bg-orange-500', label: 'Portokalli' },
    { id: 'yellow', bg: 'bg-amber-500', label: 'E Verdhë' },
    { id: 'green', bg: 'bg-emerald-600', label: 'E Gjelbër' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      
      {/* Theme Color Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ngjyra e Faturës</label>
        <div className="flex flex-wrap gap-3">
          {themeColors.map((color) => (
            <button
              key={color.id}
              onClick={() => handleInputChange('themeColor', color.id)}
              className={`w-8 h-8 rounded-full ${color.bg} transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 ${data.themeColor === color.id ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : ''}`}
              title={color.label}
            />
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors bg-white">
             {data.logo ? (
                <img src={data.logo} alt="Logo" className="h-full object-contain p-2" />
             ) : (
                <>
                  <i className="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-2"></i>
                  <span className="text-sm text-gray-500">Ngarko Logo</span>
                </>
             )}
            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
          </label>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
             <label className="text-sm font-medium text-gray-700">Nr. Faturës</label>
             <input 
              type="text" 
              value={data.invoiceNumber}
              onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
              className="mt-1 block w-32 rounded-md border-gray-300 bg-gray-50 text-gray-900 p-2 text-right shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="#"
            />
          </div>
          
           <div className="flex items-center justify-between">
             <div className="w-full flex justify-end">
                 <DatePicker 
                   label="Data" 
                   value={data.date} 
                   onChange={(val) => handleInputChange('date', val)} 
                 />
             </div>
          </div>

           <div className="flex items-center justify-between">
             <div className="w-full flex justify-end">
                 <DatePicker 
                   label="Afati i Pagesës" 
                   value={data.dueDate} 
                   onChange={(val) => handleInputChange('dueDate', val)} 
                 />
             </div>
          </div>
           <div className="flex items-center justify-between">
             <label className="text-sm font-medium text-gray-700">PO Number</label>
             <input 
              type="text" 
              value={data.poNumber}
              onChange={(e) => handleInputChange('poNumber', e.target.value)}
              className="mt-1 block w-32 rounded-md border-gray-300 bg-gray-50 text-gray-900 p-2 text-right shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* From / To */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Nga (Dërguesi)</h3>
          <input 
            type="text" placeholder="Emri i Kompanisë suaj"
            value={data.senderName} onChange={(e) => handleInputChange('senderName', e.target.value)}
            className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          />
          <input 
             type="text" placeholder="Numri Unik / NUIS"
             value={data.senderId} onChange={(e) => handleInputChange('senderId', e.target.value)}
             className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          />
          <input 
             type="text" placeholder="Numri i Llogarisë Bankare (IBAN)"
             value={data.senderBank} onChange={(e) => handleInputChange('senderBank', e.target.value)}
             className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          />
          <textarea 
             placeholder="Adresa, Qyteti, ZIP"
             rows={2}
             value={data.senderAddress} onChange={(e) => handleInputChange('senderAddress', e.target.value)}
             className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          />
          <input 
             type="email" placeholder="Email"
             value={data.senderEmail} onChange={(e) => handleInputChange('senderEmail', e.target.value)}
             className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
             <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Për (Marrësi)</h3>
             
             {savedClients.length > 0 && (
               <div className="relative">
                 <select 
                   onChange={handleClientSelect}
                   className="block w-full pl-2 pr-8 py-1 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-xs rounded-md bg-blue-50 text-blue-700 font-medium cursor-pointer"
                   defaultValue=""
                 >
                   <option value="" disabled>Importo Klient</option>
                   {savedClients.map(client => (
                     <option key={client.id} value={client.id}>{client.name}</option>
                   ))}
                 </select>
               </div>
             )}
          </div>
          
          <input 
            type="text" placeholder="Emri i Klientit"
            value={data.receiverName} onChange={(e) => handleInputChange('receiverName', e.target.value)}
            className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          />
          <input 
             type="text" placeholder="Numri Unik / NUIS i Klientit"
             value={data.receiverId} onChange={(e) => handleInputChange('receiverId', e.target.value)}
             className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          />
           <input 
             type="text" placeholder="Numri i Llogarisë Bankare (IBAN)"
             value={data.receiverBank} onChange={(e) => handleInputChange('receiverBank', e.target.value)}
             className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          />
          <textarea 
             placeholder="Adresa e Klientit"
             rows={2}
             value={data.receiverAddress} onChange={(e) => handleInputChange('receiverAddress', e.target.value)}
             className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          />
           <input 
             type="email" placeholder="Email i Klientit"
             value={data.receiverEmail} onChange={(e) => handleInputChange('receiverEmail', e.target.value)}
             className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          />
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Items */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Artikujt</h3>
        
        {/* Header Row */}
        <div className="hidden md:flex gap-3 px-3 mb-2 text-sm font-semibold text-gray-700">
          <div className="flex-grow w-full">Përshkrimi</div>
          <div className="w-24 text-right">Sasia</div>
          <div className="w-32 text-right">Çmimi pa TVSH</div>
          <div className="w-8"></div>
        </div>

        {data.items.map((item) => (
          <div key={item.id} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-gray-50 p-3 rounded-md group border border-gray-100">
            <div className="flex-grow w-full">
              <label className="md:hidden text-xs font-semibold text-gray-500 mb-1 block">Përshkrimi</label>
              <input 
                type="text" placeholder="Përshkrimi i produktit apo shërbimit"
                value={item.description}
                onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                className="block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
              />
            </div>
            <div className="w-full md:w-24">
              <label className="md:hidden text-xs font-semibold text-gray-500 mb-1 block">Sasia</label>
              <input 
                type="number" placeholder="Sasia"
                value={item.quantity}
                onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                className="block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm p-2 text-right focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
              />
            </div>
            <div className="w-full md:w-32">
              <label className="md:hidden text-xs font-semibold text-gray-500 mb-1 block">Çmimi pa TVSH</label>
              <input 
                type="number" placeholder="Çmimi"
                value={item.rate}
                onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                className="block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm p-2 text-right focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
              />
            </div>
            <div className="w-full md:w-8 flex justify-end md:justify-center">
              <button 
                onClick={() => removeItem(item.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                title="Fshij artikullin"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        ))}
        <button 
          onClick={addItem}
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          <i className="fas fa-plus mr-2"></i> Shto Artikull
        </button>
      </div>

      <hr className="border-gray-100" />

      {/* Settings (Tax, Currency, Notes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shënime</label>
            <textarea 
              value={data.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kushtet</label>
            <textarea 
              value={data.terms}
              onChange={(e) => handleInputChange('terms', e.target.value)}
              className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm p-2 text-sm focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
              rows={3}
            />
          </div>
        </div>
        
        <div className="space-y-4">
           <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Monedha</label>
            <select 
              value={data.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="block w-32 rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="EUR">Euro (€)</option>
              <option value="ALL">Lek (ALL)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
           <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">TVSH (%)</label>
            <input 
              type="number" 
              value={data.taxRate}
              onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
              className="block w-32 rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm p-2 text-right focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
            />
          </div>
           <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Zbritje (Shuma)</label>
            <input 
              type="number" 
              value={data.discount}
              onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
              className="block w-32 rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm p-2 text-right focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};