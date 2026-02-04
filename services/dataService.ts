import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { Business, Client, InvoiceData, SavedInvoice } from '../types';

const api = generateClient<Schema>();

const generateInvoiceNumber = () => {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${y}${m}${d}-${suffix}`;
};

const mapServiceError = (fallback: string, raw?: string) => {
  if (!raw) return fallback;
  if (raw.includes("Variable 'snapshot' has an invalid value")) {
    return 'Fatura nuk u ruajt. Provo ta shkurtosh përshkrimin ose ngarko logo më të vogël.';
  }
  return raw;
};

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

const toSavedInvoice = (row: Schema['Invoice']['type']): SavedInvoice => {
  const snapshotRaw = row.snapshot as unknown;
  let snapshot: SavedInvoice['snapshot'] = null;
  if (typeof snapshotRaw === 'string') {
    try {
      snapshot = JSON.parse(snapshotRaw) as InvoiceData;
    } catch {
      snapshot = null;
    }
  } else if (snapshotRaw && typeof snapshotRaw === 'object') {
    snapshot = snapshotRaw as InvoiceData;
  }

  return {
    id: row.id,
    number: row.number,
    client: row.client,
    date: row.date,
    amount: row.amount,
    currency: (row.currency || 'EUR') as SavedInvoice['currency'],
    snapshot,
  };
};

export const listBusinesses = async (): Promise<Business[]> => {
  const { data, errors } = await api.models.Business.list();
  if (errors?.length) throw new Error(errors[0].message);
  return data.map(toBusiness);
};

export const addBusiness = async (input: Omit<Business, 'id'>): Promise<Business> => {
  const normalizedEmail = input.email?.trim();
  const normalizedBank = input.bank?.trim();
  const normalizedLogo = input.logo?.trim();

  const { data, errors } = await api.models.Business.create({
    name: input.name.trim(),
    nuis: input.nuis.trim(),
    address: input.address.trim(),
    bank: normalizedBank || undefined,
    email: normalizedEmail || undefined,
    logo: normalizedLogo || undefined,
  });

  if (errors?.length || !data) throw new Error(mapServiceError('Nuk u ruajt biznesi.', errors?.[0]?.message));
  return toBusiness(data);
};

export const updateBusiness = async (id: string, input: Omit<Business, 'id'>): Promise<Business> => {
  const normalizedEmail = input.email?.trim();
  const normalizedBank = input.bank?.trim();
  const normalizedLogo = input.logo?.trim();

  const { data, errors } = await api.models.Business.update({
    id,
    name: input.name.trim(),
    nuis: input.nuis.trim(),
    address: input.address.trim(),
    bank: normalizedBank || undefined,
    email: normalizedEmail || undefined,
    logo: normalizedLogo || undefined,
  });

  if (errors?.length || !data) throw new Error(mapServiceError('Nuk u përditësua biznesi.', errors?.[0]?.message));
  return toBusiness(data);
};

export const deleteBusiness = async (id: string): Promise<void> => {
  const { errors } = await api.models.Business.delete({ id });
  if (errors?.length) throw new Error(mapServiceError('Nuk u fshi biznesi.', errors[0].message));
};

export const listClients = async (): Promise<Client[]> => {
  const { data, errors } = await api.models.Client.list();
  if (errors?.length) throw new Error(errors[0].message);
  return data.map(toClient);
};

export const addClient = async (input: Omit<Client, 'id'>): Promise<Client> => {
  const normalizedEmail = input.email?.trim();
  const normalizedNuis = input.nuis?.trim();
  const normalizedAddress = input.address?.trim();

  const { data, errors } = await api.models.Client.create({
    name: input.name.trim(),
    nuis: normalizedNuis || undefined,
    address: normalizedAddress || undefined,
    email: normalizedEmail || undefined,
  });

  if (errors?.length || !data) throw new Error(mapServiceError('Nuk u ruajt klienti.', errors?.[0]?.message));
  return toClient(data);
};

export const updateClient = async (id: string, input: Omit<Client, 'id'>): Promise<Client> => {
  const normalizedEmail = input.email?.trim();
  const normalizedNuis = input.nuis?.trim();
  const normalizedAddress = input.address?.trim();

  const { data, errors } = await api.models.Client.update({
    id,
    name: input.name.trim(),
    nuis: normalizedNuis || undefined,
    address: normalizedAddress || undefined,
    email: normalizedEmail || undefined,
  });

  if (errors?.length || !data) throw new Error(mapServiceError('Nuk u përditësua klienti.', errors?.[0]?.message));
  return toClient(data);
};

export const deleteClient = async (id: string): Promise<void> => {
  const { errors } = await api.models.Client.delete({ id });
  if (errors?.length) throw new Error(mapServiceError('Nuk u fshi klienti.', errors[0].message));
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
  const snapshot = {
    ...invoice,
    // Ruajmë logon vetëm nëse është mjaft e vogël për DynamoDB item size.
    logo: invoice.logo && invoice.logo.length <= 120000 ? invoice.logo : null,
  };

  const { data, errors } = await api.models.Invoice.create({
    number: invoice.invoiceNumber || generateInvoiceNumber(),
    client: invoice.receiverName || 'Klient pa emër',
    date: invoice.date,
    amount: Number(total.toFixed(2)),
    currency: invoice.currency,
    snapshot: JSON.stringify(snapshot),
  });

  if (errors?.length || !data) throw new Error(mapServiceError('Nuk u ruajt fatura.', errors?.[0]?.message));
  return toSavedInvoice(data);
};

export const updateInvoice = async (id: string, invoice: InvoiceData): Promise<SavedInvoice> => {
  const totalBase = invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const taxAmount = (totalBase * invoice.taxRate) / 100;
  const total = totalBase + taxAmount - invoice.discount;
  const snapshot = {
    ...invoice,
    logo: invoice.logo && invoice.logo.length <= 120000 ? invoice.logo : null,
  };

  const { data, errors } = await api.models.Invoice.update({
    id,
    number: invoice.invoiceNumber || generateInvoiceNumber(),
    client: invoice.receiverName || 'Klient pa emër',
    date: invoice.date,
    amount: Number(total.toFixed(2)),
    currency: invoice.currency,
    snapshot: JSON.stringify(snapshot),
  });

  if (errors?.length || !data) throw new Error(mapServiceError('Nuk u përditësua fatura.', errors?.[0]?.message));
  return toSavedInvoice(data);
};

export const deleteInvoice = async (id: string): Promise<void> => {
  const { errors } = await api.models.Invoice.delete({ id });
  if (errors?.length) throw new Error(mapServiceError('Nuk u fshi fatura.', errors[0].message));
};
