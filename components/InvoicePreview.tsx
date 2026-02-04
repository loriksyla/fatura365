import React from 'react';
import { InvoiceData } from '../types';

interface InvoicePreviewProps {
  data: InvoiceData;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
};

// Maps theme colors to specific classes for headers and text accents
const getThemeClasses = (color: string) => {
  switch (color) {
    case 'red': return { bg: 'bg-red-700', text: 'text-red-700', light: 'text-red-100', bgHex: '#b91c1c', textHex: '#b91c1c' };
    case 'blue': return { bg: 'bg-blue-700', text: 'text-blue-700', light: 'text-blue-100', bgHex: '#1d4ed8', textHex: '#1d4ed8' };
    case 'orange': return { bg: 'bg-orange-600', text: 'text-orange-600', light: 'text-orange-100', bgHex: '#ea580c', textHex: '#ea580c' };
    case 'yellow': return { bg: 'bg-amber-500', text: 'text-amber-600', light: 'text-amber-100', bgHex: '#f59e0b', textHex: '#d97706' };
    case 'green': return { bg: 'bg-emerald-700', text: 'text-emerald-700', light: 'text-emerald-100', bgHex: '#047857', textHex: '#047857' };
    default: return { bg: 'bg-gray-800', text: 'text-gray-900', light: 'text-gray-100', bgHex: '#1f2937', textHex: '#111827' };
  }
};

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data }) => {
  const currencySymbol = data.currency === 'ALL' ? 'Lek' : data.currency === 'EUR' ? '€' : '$';

  const subTotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxAmount = (subTotal * data.taxRate) / 100;
  const total = subTotal + taxAmount - data.discount;

  const theme = getThemeClasses(data.themeColor || 'gray');

  return (
    // A4 Dimensions: approx 210mm x 297mm.
    <div id="invoice-preview" className="bg-white mx-auto shadow-lg text-gray-800 text-sm print:shadow-none print:m-0 print:w-full relative flex flex-col" 
         style={{ width: '100%', maxWidth: '210mm', minHeight: '297mm', padding: '20mm', boxSizing: 'border-box', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div className="w-1/2">
           {data.logo ? (
             <img src={data.logo} alt="Logo" className="h-56 w-auto object-contain mb-4" />
           ) : (
             <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.senderName || 'Emri Kompanisë'}</h1>
           )}
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-light text-gray-300 uppercase tracking-widest mb-4">Faturë</h1>
          <div className="flex justify-end gap-4 mb-1">
             <span className="text-gray-500 font-medium">Nr. Faturës:</span>
             <span className="font-semibold">{data.invoiceNumber}</span>
          </div>
          <div className="flex justify-end gap-4 mb-1">
             <span className="text-gray-500 font-medium">Data:</span>
             <span>{formatDate(data.date)}</span>
          </div>
          {data.dueDate && (
             <div className="flex justify-end gap-4 mb-1">
               <span className="text-gray-500 font-medium">Afati:</span>
               <span>{formatDate(data.dueDate)}</span>
            </div>
           )}
           {data.poNumber && (
            <div className="flex justify-end gap-4">
               <span className="text-gray-500 font-medium">PO #:</span>
               <span>{data.poNumber}</span>
            </div>
           )}
        </div>
      </div>

      {/* Address Info */}
      <div className="flex justify-between mb-12 gap-8">
        <div className="flex-1">
          <h3 className="inline-block text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-3 bg-gray-100 border border-gray-300 rounded px-2 py-1">
            Nga (Dërguesi)
          </h3>
          <p className="font-bold text-lg">{data.senderName}</p>
          {data.senderId && <p className="text-gray-600 text-xs mt-1"><span className="font-medium">NUI:</span> {data.senderId}</p>}
          {data.senderBank && <p className="text-gray-600 text-xs mt-1"><span className="font-medium">Llog. Bankare:</span> {data.senderBank}</p>}
          <p className="whitespace-pre-wrap text-gray-600 mt-1">{data.senderAddress}</p>
          <p className="text-gray-600">{data.senderEmail}</p>
        </div>
        <div className="flex-1 text-right">
          <h3 className="inline-block text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-3 bg-gray-100 border border-gray-300 rounded px-2 py-1">
            Për (Marrësi)
          </h3>
          <p className="font-bold text-lg">{data.receiverName}</p>
          {data.receiverId && <p className="text-gray-600 text-xs mt-1"><span className="font-medium">NUI:</span> {data.receiverId}</p>}
          {data.receiverBank && <p className="text-gray-600 text-xs mt-1"><span className="font-medium">Llog. Bankare:</span> {data.receiverBank}</p>}
          <p className="whitespace-pre-wrap text-gray-600 mt-1">{data.receiverAddress}</p>
           <p className="text-gray-600">{data.receiverEmail}</p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full mb-8 table-fixed">
        <thead>
          <tr className={`${theme.bg} text-white`} style={{ backgroundColor: theme.bgHex, color: '#ffffff', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            <th className="py-2 px-4 text-left font-medium rounded-tl-md rounded-bl-md w-[45%]" style={{ backgroundColor: theme.bgHex, color: '#ffffff' }}>Përshkrimi</th>
            <th className="py-2 px-4 text-right font-medium w-[15%]" style={{ backgroundColor: theme.bgHex, color: '#ffffff' }}>Sasia</th>
            <th className="py-2 px-4 text-right font-medium w-[20%]" style={{ backgroundColor: theme.bgHex, color: '#ffffff' }}>Çmimi</th>
            <th className="py-2 px-4 text-right font-medium w-[20%] rounded-tr-md rounded-br-md" style={{ backgroundColor: theme.bgHex, color: '#ffffff' }}>Totali</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100 last:border-0">
              <td className="py-3 px-4 break-words">{item.description}</td>
              <td className="py-3 px-4 text-right">{item.quantity}</td>
              <td className="py-3 px-4 text-right">{item.rate.toFixed(2)}</td>
              <td className="py-3 px-4 text-right font-medium">{(item.quantity * item.rate).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-1/2 space-y-2">
          <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-1">
            <span>Nëntotali:</span>
            <span>{subTotal.toFixed(2)} {currencySymbol}</span>
          </div>
          <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-1">
            <span>TVSH ({data.taxRate}%):</span>
            <span>{taxAmount.toFixed(2)} {currencySymbol}</span>
          </div>
           {data.discount > 0 && (
             <div className="flex justify-between text-red-500 border-b border-gray-100 pb-1">
              <span>Zbritje:</span>
              <span>- {data.discount.toFixed(2)} {currencySymbol}</span>
            </div>
           )}
          <div className={`pt-2 flex justify-between font-bold text-lg mt-2 ${theme.text}`} style={{ color: theme.textHex }}>
            <span>Totali:</span>
            <span>{total.toFixed(2)} {currencySymbol}</span>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="flex justify-between mt-8 mb-8">
        <div className="w-[40%]">
          <p className="text-gray-800 font-semibold mb-8">Përgaditur nga:</p>
          <div className="border-b border-gray-400 border-dashed w-full h-1"></div>
        </div>
        <div className="w-[40%]">
           <p className="text-gray-800 font-semibold mb-8">Pranuar nga:</p>
           <div className="border-b border-gray-400 border-dashed w-full h-1"></div>
        </div>
      </div>

      {/* Footer Notes */}
      {(data.notes || data.terms) && (
        <div className="grid grid-cols-1 gap-6 text-gray-600 text-xs pt-8 border-t border-gray-100 mt-4">
           {data.notes && (
            <div>
              <h4 className="font-bold uppercase mb-1 text-gray-800">Shënime</h4>
              <p className="whitespace-pre-wrap">{data.notes}</p>
            </div>
           )}
            {data.terms && (
            <div>
              <h4 className="font-bold uppercase mb-1 text-gray-800">Kushtet</h4>
              <p className="whitespace-pre-wrap">{data.terms}</p>
            </div>
           )}
        </div>
      )}
    </div>
  );
};
