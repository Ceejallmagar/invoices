import type { Invoice } from '../types'

export function subtotal(inv: Invoice): number {
  return inv.items.reduce((sum, it) => sum + it.qty * it.rate, 0)
}

export function discountAmount(inv: Invoice): number {
  return subtotal(inv) * (inv.discount / 100)
}

export function taxAmount(inv: Invoice): number {
  return (subtotal(inv) - discountAmount(inv)) * (inv.taxRate / 100)
}

export function total(inv: Invoice): number {
  return subtotal(inv) - discountAmount(inv) + taxAmount(inv)
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

export function daysOverdue(inv: Invoice, today = new Date()): number {
  if (inv.status !== 'sent' || !inv.dueDate) return 0
  const due = new Date(inv.dueDate + 'T00:00:00')
  const diff = Math.floor((today.getTime() - due.getTime()) / 86_400_000)
  return diff > 0 ? diff : 0
}

export function isOverdue(inv: Invoice, today = new Date()): boolean {
  return daysOverdue(inv, today) > 0
}

export function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
