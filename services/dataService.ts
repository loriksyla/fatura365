import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { Business, Client, InvoiceData, SavedInvoice } from '../types';

const api = generateClient<Schema>();

const toBusiness = (row: Schema['Business']['type']): Business => ({
  id: row.id,
  name: row.name,
  nuis: row.nuis,
  address: row.address,
  bank: row.bank || '',
  email: row.email || '',
  logo: row.logo || '',
});

const toClient = (row: Schema['Client']['type']): Client => ({
  id: row.id,
  name: row.name,
  nuis: row.nuis || '',
  address: row.address || '',
  email: row.email || '',
});

const toSavedInvoice = (row: Schema['Invoice']['type']): SavedInvoice => ({
  id: row.id,
  number: row.number,
  client: row.client,
  date: row.date,
  amount: row.amount,
  currency: (row.currency || 'EUR') as SavedInvoice['currency'],
});

export const listBusinesses = async (): Promise<Business[]> => {
  const { data, errors } = await api.models.Business.list();
  if (errors?.length) throw new Error(errors[0].message);
  return data.map(toBusiness);
};

export const addBusiness = async (input: Omit<Business, 'id'>): Promise<Business> => {
  const { data, errors } = await api.models.Business.create({
    name: input.name,
    nuis: input.nuis,
    address: input.address,
    bank: input.bank,
    email: input.email,
    logo: input.logo,
  });

  if (errors?.length || !data) throw new Error(errors?.[0]?.message || 'Nuk u ruajt biznesi.');
  return toBusiness(data);
};

export const listClients = async (): Promise<Client[]> => {
  const { data, errors } = await api.models.Client.list();
  if (errors?.length) throw new Error(errors[0].message);
  return data.map(toClient);
};

export const addClient = async (input: Omit<Client, 'id'>): Promise<Client> => {
  const { data, errors } = await api.models.Client.create({
    name: input.name,
    nuis: input.nuis,
    address: input.address,
    email: input.email,
  });

  if (errors?.length || !data) throw new Error(errors?.[0]?.message || 'Nuk u ruajt klienti.');
  return toClient(data);
};

export const listInvoices = async (): Promise<SavedInvoice[]> => {
  const { data, errors } = await api.models.Invoice.list();
  if (errors?.length) throw new Error(errors[0].message);
  return data.map(toSavedInvoice);
};

export const addInvoice = async (invoice: InvoiceData): Promise<SavedInvoice> => {
  const totalBase = invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const taxAmount = (totalBase * invoice.taxRate) / 100;
  const total = totalBase + taxAmount - invoice.discount;

  const { data, errors } = await api.models.Invoice.create({
    number: invoice.invoiceNumber || `INV-${Date.now()}`,
    client: invoice.receiverName || 'Klient pa emër',
    date: invoice.date,
    amount: Number(total.toFixed(2)),
    currency: invoice.currency,
    snapshot: invoice,
  });

  if (errors?.length || !data) throw new Error(errors?.[0]?.message || 'Nuk u ruajt fatura.');
  return toSavedInvoice(data);
};
