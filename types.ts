export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  poNumber: string;

  senderName: string;
  senderId: string;
  senderBank: string;
  senderAddress: string;
  senderEmail: string;

  receiverName: string;
  receiverId: string;
  receiverBank: string;
  receiverAddress: string;
  receiverEmail: string;

  currency: 'EUR' | 'ALL' | 'USD';
  taxRate: number;
  discount: number;

  logo: string | null;
  items: LineItem[];

  notes: string;
  terms: string;

  themeColor: 'gray' | 'red' | 'blue' | 'orange' | 'yellow' | 'green';
}

export const INITIAL_INVOICE: InvoiceData = {
  invoiceNumber: '',
  date: new Date().toISOString().split('T')[0],
  dueDate: '',
  poNumber: '',
  senderName: '',
  senderId: '',
  senderBank: '',
  senderAddress: '',
  senderEmail: '',
  receiverName: '',
  receiverId: '',
  receiverBank: '',
  receiverAddress: '',
  receiverEmail: '',
  currency: 'EUR',
  taxRate: 18,
  discount: 0,
  logo: null,
  items: [{ id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 }],
  notes: '',
  terms: '',
  themeColor: 'gray',
};

export interface Business {
  id: string;
  name: string;
  nuis: string;
  address: string;
  bank: string;
  email: string;
  logo?: string;
}

export interface Client {
  id: string;
  name: string;
  nuis: string;
  address: string;
  email: string;
}

export interface SavedInvoice {
  id: string;
  number: string;
  client: string;
  date: string;
  amount: number;
  currency: 'EUR' | 'ALL' | 'USD';
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
}
