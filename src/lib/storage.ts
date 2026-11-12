import type { AppData, Client, Invoice, Settings } from '../types'
import { newId } from '../types'

const KEY = 'chaseinvoice:data:v1'

export function defaultSettings(): Settings {
  return {
    business: { name: '', email: '', address: '', logoDataUrl: '' },
    accent: '#4f46e5',
    licenseKey: '',
  }
}

export function emptyInvoice(accent: string, currency: string): Invoice {
  const today = new Date().toISOString().slice(0, 10)
  const due = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10)
  return {
    id: newId(),
    number: `INV-${String(Date.now()).slice(-6)}`,
    issueDate: today,
    dueDate: due,
    client: { id: newId(), name: '', email: '', company: '', address: '' },
    items: [{ id: newId(), description: '', qty: 1, rate: 0 }],
    taxRate: 0,
    discount: 0,
    currency,
    notes: 'Payment due within 14 days. Thank you for your business!',
    status: 'draft',
    accent,
    sentAt: null,
    paidAt: null,
  }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppData
      if (parsed && Array.isArray(parsed.invoices)) {
        return {
          invoices: parsed.invoices,
          clients: Array.isArray(parsed.clients) ? parsed.clients : [],
          settings: { ...defaultSettings(), ...parsed.settings },
        }
      }
    }
  } catch {
    /* corrupted storage falls through to defaults */
  }
  return { clients: [], invoices: [], settings: defaultSettings() }
}

export function saveData(data: AppData): void {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function exportJson(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chaseinvoice-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function parseImport(text: string): AppData | null {
  try {
    const parsed = JSON.parse(text) as AppData
    if (parsed && Array.isArray(parsed.invoices) && Array.isArray(parsed.clients)) {
      return { ...parsed, settings: { ...defaultSettings(), ...parsed.settings } }
    }
  } catch {
    /* invalid file */
  }
  return null
}

export function clientLabel(c: Client): string {
  return c.company ? `${c.name} (${c.company})` : c.name
}
