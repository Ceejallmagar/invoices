import { useState } from 'react'
import type { Client, Invoice, Settings } from '../types'
import { ACCENTS, CURRENCIES, newId } from '../types'
import { total } from '../lib/calc'
import InvoiceSheet from './InvoiceSheet'

export default function Editor({ invoice, settings, clients, pro, onChange, onSave, onClose }: {
  invoice: Invoice
  settings: Settings
  clients: Client[]
  pro: boolean
  onChange: (inv: Invoice) => void
  onSave: () => void
  onClose: () => void
}) {
  const [showPreview, setShowPreview] = useState(true)
  const set = (patch: Partial<Invoice>) => onChange({ ...invoice, ...patch })

  const setItem = (id: string, patch: Partial<Invoice['items'][number]>) =>
    set({ items: invoice.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) })

  const addItem = () => set({ items: [...invoice.items, { id: newId(), description: '', qty: 1, rate: 0 }] })
  const removeItem = (id: string) => set({ items: invoice.items.filter((it) => it.id !== id) })

  return (
    <div className="editor">
      <div className="editor-form">
        <div className="row">
          <button className="btn ghost" onClick={onClose}>← Back</button>
          <button className="btn primary" onClick={onSave}>Save invoice</button>
        </div>

        <section className="card">
          <h3>Invoice details</h3>
          <div className="grid2">
            <label>Invoice number
              <input value={invoice.number} onChange={(e) => set({ number: e.target.value })} />
            </label>
            <label>Currency
              <select value={invoice.currency} onChange={(e) => set({ currency: e.target.value })}>
                {CURRENCIES.map((cur) => <option key={cur}>{cur}</option>)}
              </select>
            </label>
            <label>Issue date
              <input type="date" value={invoice.issueDate} onChange={(e) => set({ issueDate: e.target.value })} />
            </label>
            <label>Due date
              <input type="date" value={invoice.dueDate} onChange={(e) => set({ dueDate: e.target.value })} />
            </label>
          </div>
        </section>

        <section className="card">
          <h3>Client</h3>
          {clients.length > 0 && (
            <label>Load saved client
              <select
                value=""
                onChange={(e) => {
                  const c = clients.find((x) => x.id === e.target.value)
                  if (c) set({ client: { ...c } })
                }}
              >
                <option value="">— select —</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.company ? `${c.name} (${c.company})` : c.name}</option>)}
              </select>
            </label>
          )}
          <div className="grid2">
            <label>Name<input value={invoice.client.name} onChange={(e) => set({ client: { ...invoice.client, name: e.target.value } })} /></label>
            <label>Email<input type="email" value={invoice.client.email} onChange={(e) => set({ client: { ...invoice.client, email: e.target.value } })} /></label>
            <label>Company<input value={invoice.client.company} onChange={(e) => set({ client: { ...invoice.client, company: e.target.value } })} /></label>
            <label>Address<input value={invoice.client.address} onChange={(e) => set({ client: { ...invoice.client, address: e.target.value } })} /></label>
          </div>
        </section>

        <section className="card">
          <h3>Line items</h3>
          {invoice.items.map((it) => (
            <div className="item-row" key={it.id}>
              <input placeholder="Description" value={it.description} onChange={(e) => setItem(it.id, { description: e.target.value })} />
              <input type="number" min={0} step="any" value={it.qty} onChange={(e) => setItem(it.id, { qty: Number(e.target.value) })} />
              <input type="number" min={0} step="any" value={it.rate} onChange={(e) => setItem(it.id, { rate: Number(e.target.value) })} />
              <button className="btn danger ghost" onClick={() => removeItem(it.id)} aria-label="Remove item">✕</button>
            </div>
          ))}
          <button className="btn ghost" onClick={addItem}>+ Add item</button>
          <div className="grid2">
            <label>Discount %
              <input type="number" min={0} max={100} value={invoice.discount} onChange={(e) => set({ discount: Number(e.target.value) })} />
            </label>
            <label>Tax %
              <input type="number" min={0} max={100} value={invoice.taxRate} onChange={(e) => set({ taxRate: Number(e.target.value) })} />
            </label>
          </div>
        </section>

        <section className="card">
          <h3>Notes & style</h3>
          <label>Notes (shown on invoice)
            <textarea rows={3} value={invoice.notes} onChange={(e) => set({ notes: e.target.value })} />
          </label>
          <div className="accent-row">
            <span>Accent</span>
            {ACCENTS.map((a) => (
              <button
                key={a}
                className={a === invoice.accent ? 'swatch active' : 'swatch'}
                style={{ background: a }}
                onClick={() => set({ accent: a })}
                aria-label={`Accent ${a}`}
              />
            ))}
          </div>
          {!pro && (
            <p className="hint">Free plan adds a small footer on the PDF. <a href="#" onClick={(e) => e.preventDefault()}>Upgrade to remove it.</a></p>
          )}
        </section>

        <div className="editor-total">
          Total: <strong>{total(invoice).toLocaleString(undefined, { minimumFractionDigits: 2 })} {invoice.currency}</strong>
        </div>
      </div>

      <div className="editor-preview">
        <div className="row">
          <button className="btn ghost" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? 'Hide preview' : 'Show preview'}
          </button>
          <button className="btn primary" onClick={() => window.print()}>Download PDF (Print)</button>
        </div>
        {showPreview && <InvoiceSheet invoice={invoice} businessName={settings.business.name} pro={pro} />}
      </div>

    </div>
  )
}
