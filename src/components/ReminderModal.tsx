import { useMemo, useState } from 'react'
import type { Invoice } from '../types'
import { daysOverdue, formatDate, formatMoney, total } from '../lib/calc'
import { STAGE_LABELS, reminderEmail, stageFor } from '../lib/reminders'

export default function ReminderModal({ invoice, businessName, onClose }: {
  invoice: Invoice
  businessName: string
  onClose: () => void
}) {
  const days = daysOverdue(invoice)
  const [stage, setStage] = useState(stageFor(days))
  const [copied, setCopied] = useState(false)
  const email = useMemo(() => reminderEmail(invoice, businessName || 'Your Business'), [invoice, businessName, stage])
  const mailto = `mailto:${encodeURIComponent(invoice.client.email)}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`

  const copy = async () => {
    await navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row spread">
          <h3>Chase payment — {invoice.number}</h3>
          <button className="btn ghost" onClick={onClose}>✕</button>
        </div>
        <p className="hint">
          {invoice.client.name || 'Client'} · {formatMoney(total(invoice), invoice.currency)} ·
          due {formatDate(invoice.dueDate)} · <strong>{days} days overdue</strong>
        </p>
        <div className="stage-row">
          {(Object.keys(STAGE_LABELS) as Array<keyof typeof STAGE_LABELS>).map((s) => (
            <button
              key={s}
              className={s === stage ? 'btn chip active' : 'btn chip'}
              onClick={() => setStage(s)}
            >
              {STAGE_LABELS[s]}
            </button>
          ))}
        </div>
        <label>Subject
          <input readOnly value={email.subject} onFocus={(e) => e.currentTarget.select()} />
        </label>
        <label>Message
          <textarea rows={14} readOnly value={email.body} onFocus={(e) => e.currentTarget.select()} />
        </label>
        <div className="row">
          <button className="btn primary" onClick={copy}>{copied ? 'Copied ✓' : 'Copy email'}</button>
          <a className="btn ghost" href={mailto}>Open in email app</a>
        </div>
        <p className="hint">Tip: mark the invoice as paid once it settles, so follow-ups stop.</p>
      </div>
    </div>
  )
}
