import { useState } from 'react'
import type { AppData, Client, Settings } from '../types'
import { newId } from '../types'
import { exportJson, parseImport } from '../lib/storage'
import { FREE_INVOICE_LIMIT, PAYMENT_LINK, isPro } from '../lib/license'

export function ClientsView({ clients, pro, onSave, onDelete }: {
  clients: Client[]
  pro: boolean
  onSave: (c: Client) => void
  onDelete: (id: string) => void
}) {
  const [draft, setDraft] = useState<Client>(() => ({ id: newId(), name: '', email: '', company: '', address: '' }))
  const atLimit = !pro && clients.length >= FREE_INVOICE_LIMIT

  return (
    <div>
      <h2>Clients</h2>
      <div className="card">
        <h3>{atLimit ? 'Free plan limit reached' : 'Add client'}</h3>
        {atLimit ? (
          <div>
            <p className="hint">Free plan stores {FREE_INVOICE_LIMIT} clients. Upgrade to Pro for unlimited.</p>
            <a className="btn primary" href={PAYMENT_LINK} target="_blank" rel="noreferrer">Upgrade — $19 one-time</a>
          </div>
        ) : (
          <div className="grid2">
            <label>Name<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
            <label>Email<input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></label>
            <label>Company<input value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} /></label>
            <label>Address<input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} /></label>
          </div>
        )}
        {!atLimit && (
          <button
            className="btn primary"
            onClick={() => {
              if (!draft.name.trim()) return
              onSave(draft)
              setDraft({ id: newId(), name: '', email: '', company: '', address: '' })
            }}
          >
            Save client
          </button>
        )}
      </div>

      {clients.length > 0 && (
        <table className="table">
          <thead><tr><th>Name</th><th>Company</th><th>Email</th><th></th></tr></thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.company || '—'}</td>
                <td>{c.email || '—'}</td>
                <td><button className="btn small ghost" onClick={() => onDelete(c.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export function SettingsView({ data, setData, onUpgrade }: {
  data: AppData
  setData: (d: AppData) => void
  onUpgrade: () => void
}) {
  const { settings } = data
  const b = settings.business
  const [importMsg, setImportMsg] = useState('')
  const setBusiness = (patch: Partial<Settings['business']>) =>
    setData({ ...data, settings: { ...settings, business: { ...b, ...patch } } })

  const importFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const parsed = parseImport(String(reader.result))
      if (parsed) {
        setData(parsed)
        setImportMsg('Backup restored ✓')
      } else {
        setImportMsg('That file is not a valid backup.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div>
      <h2>Settings</h2>
      <section className="card">
        <h3>Your business (shown on invoices)</h3>
        <div className="grid2">
          <label>Business name<input value={b.name} onChange={(e) => setBusiness({ name: e.target.value })} /></label>
          <label>Email<input value={b.email} onChange={(e) => setBusiness({ email: e.target.value })} /></label>
        </div>
        <label>Address<textarea rows={2} value={b.address} onChange={(e) => setBusiness({ address: e.target.value })} /></label>
      </section>

      <section className="card">
        <h3>License</h3>
        {isPro(settings.licenseKey) ? (
          <p className="ok">Pro is active ✓ — thank you for supporting the product!</p>
        ) : (
          <div>
            <p className="hint">Free plan: {FREE_INVOICE_LIMIT} saved invoices, footer on PDFs.</p>
            <button className="btn primary" onClick={onUpgrade}>Upgrade to Pro</button>
          </div>
        )}
      </section>

      <section className="card">
        <h3>Your data</h3>
        <p className="hint">Everything lives in your browser — nothing is sent to any server. Back it up regularly.</p>
        <div className="row">
          <button className="btn" onClick={() => exportJson(data)}>Export backup (JSON)</button>
          <label className="btn ghost file-btn">
            Import backup
            <input type="file" accept="application/json" hidden onChange={(e) => importFile(e.target.files?.[0])} />
          </label>
        </div>
        {importMsg && <p className="hint">{importMsg}</p>}
      </section>
    </div>
  )
}
