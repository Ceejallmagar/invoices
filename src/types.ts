export type LineItem = {
  id: string
  description: string
  qty: number
  rate: number
}

export type Client = {
  id: string
  name: string
  email: string
  company: string
  address: string
}

export type Business = {
  name: string
  email: string
  address: string
  logoDataUrl: string
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid'

export type Invoice = {
  id: string
  number: string
  issueDate: string
  dueDate: string
  client: Client
  items: LineItem[]
  taxRate: number
  discount: number
  currency: string
  notes: string
  status: InvoiceStatus
  accent: string
  sentAt: string | null
  paidAt: string | null
}

export type Settings = {
  business: Business
  accent: string
  licenseKey: string
}

export type AppData = {
  clients: Client[]
  invoices: Invoice[]
  settings: Settings
}

export const ACCENTS = ['#4f46e5', '#0e7490', '#047857', '#b45309', '#be123c', '#7c3aed']
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'BRL', 'JPY']

export function newId(): string {
  return crypto.randomUUID()
}
