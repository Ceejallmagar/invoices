import { useState } from 'react'
import { PAYMENT_LINK } from '../lib/license'

export default function Paywall({ reason, onActivate, onClose }: {
  reason: string
  onActivate: (key: string) => boolean
  onClose: () => void
}) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row spread">
          <h3>Upgrade to Pro</h3>
          <button className="btn ghost" onClick={onClose}>✕</button>
        </div>
        <p className="hint">{reason}</p>
        <ul className="pro-list">
          <li>Unlimited saved invoices & clients</li>
          <li>No ChaseInvoice footer on your PDFs</li>
          <li>All accent colors & templates</li>
          <li>Lifetime license — pay once, keep forever</li>
        </ul>
        <a className="btn primary block" href={PAYMENT_LINK} target="_blank" rel="noreferrer">
          Get Pro — $19 one-time
        </a>
        <p className="hint">Already bought it? Paste your license key:</p>
        <div className="row">
          <input
            placeholder="CHASE-XXXX-XXXX-XXXX-XXXX"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          <button className="btn" onClick={() => { if (!onActivate(key)) setError('That key is not valid.') }}>
            Activate
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}
