import { useEffect, useState } from 'react'
import type { AppData, Client, Invoice, InvoiceStatus } from './types'
import { emptyInvoice, loadData, saveData } from './lib/storage'
import { FREE_INVOICE_LIMIT, isPro } from './lib/license'
import Dashboard from './components/Dashboard'
import Editor from './components/Editor'
import ReminderModal from './components/ReminderModal'
import Paywall from './components/Paywall'
import { ClientsView, SettingsView } from './components/Views'

type View = 'dashboard' | 'editor' | 'clients' | 'settings'

export default function App() {
  const [data, setData] = useState<AppData>(loadData)
  const [view, setView] = useState<View>('dashboard')
  const [draft, setDraft] = useState<Invoice | null>(null)
  const [chasing, setChasing] = useState<Invoice | null>(null)
  const [paywall, setPaywall] = useState<string | null>(null)

  const pro = isPro(data.settings.licenseKey)

  useEffect(() => saveData(data), [data])

  const startNew = () => {
    if (!pro && data.invoices.length >= FREE_INVOICE_LIMIT) {
      setPaywall(`Free plan stores ${FREE_INVOICE_LIMIT} invoices. Upgrade to keep going — unlimited invoices, no footer, one-time $19.`)
      return
    }
    setDraft(emptyInvoice(data.settings.accent, 'USD'))
    setView('editor')
  }

  const saveInvoice = () => {
    if (!draft) return
    const exists = data.invoices.some((inv) => inv.id === draft.id)
    setData({
      ...data,
      invoices: exists
        ? data.invoices.map((inv) => (inv.id === draft.id ? draft : inv))
        : [...data.invoices, draft],
    })
    setDraft(null)
    setView('dashboard')
  }

  const setStatus = (id: string, status: InvoiceStatus) => {
    setData({
      ...data,
      invoices: data.invoices.map((inv) =>
        inv.id === id
          ? { ...inv, status, sentAt: status !== 'draft' ? inv.sentAt ?? new Date().toISOString() : null, paidAt: status === 'paid' ? new Date().toISOString() : null }
          : inv,
      ),
    })
  }

  const saveClient = (c: Client) => {
    if (!pro && data.clients.length >= FREE_INVOICE_LIMIT) {
      setPaywall(`Free plan stores ${FREE_INVOICE_LIMIT} clients.`)
      return
    }
    const exists = data.clients.some((x) => x.id === c.id)
    setData({
      ...data,
      clients: exists ? data.clients.map((x) => (x.id === c.id ? c : x)) : [...data.clients, c],
    })
  }

  const activate = (key: string): boolean => {
    if (!isPro(key)) return false
    setData({ ...data, settings: { ...data.settings, licenseKey: key.trim() } })
    setPaywall(null)
    return true
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="logo">Chase<span>Invoice</span></div>
        <nav>
          <button className={view === 'dashboard' ? 'nav-btn active' : 'nav-btn'} onClick={() => { setDraft(null); setView('dashboard') }}>Invoices</button>
          <button className={view === 'clients' ? 'nav-btn active' : 'nav-btn'} onClick={() => setView('clients')}>Clients</button>
          <button className={view === 'settings' ? 'nav-btn active' : 'nav-btn'} onClick={() => setView('settings')}>Settings</button>
        </nav>
        <div className="topbar-right">
          {!pro && <button className="btn small primary" onClick={() => setPaywall('Unlock unlimited invoices, clients and footer-free PDFs.')}>Go Pro</button>}
          {pro && <span className="ok">PRO ✓</span>}
        </div>
      </header>

      <main className="main">
        {view === 'dashboard' && (
          <Dashboard
            invoices={data.invoices}
            onNew={startNew}
            onEdit={(inv) => { setDraft(inv); setView('editor') }}
            onChase={setChasing}
            onStatus={setStatus}
          />
        )}
        {view === 'editor' && draft && (
          <Editor
            invoice={draft}
            settings={data.settings}
            clients={data.clients}
            pro={pro}
            onChange={setDraft}
            onSave={saveInvoice}
            onClose={() => { setDraft(null); setView('dashboard') }}
          />
        )}
        {view === 'clients' && (
          <ClientsView
            clients={data.clients}
            pro={pro}
            onSave={saveClient}
            onDelete={(id) => setData({ ...data, clients: data.clients.filter((c) => c.id !== id) })}
          />
        )}
        {view === 'settings' && <SettingsView data={data} setData={setData} onUpgrade={() => setPaywall('Upgrade to Pro.')} />}
      </main>

      {chasing && (
        <ReminderModal
          invoice={data.invoices.find((inv) => inv.id === chasing.id) ?? chasing}
          businessName={data.settings.business.name}
          onClose={() => setChasing(null)}
        />
      )}
      {paywall && (
        <Paywall
          reason={paywall}
          onActivate={activate}
          onClose={() => setPaywall(null)}
        />
      )}
    </div>
  )
}
