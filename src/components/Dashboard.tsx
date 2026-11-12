import type { Invoice } from '../types'
import { daysOverdue, formatDate, formatMoney, isOverdue, total } from '../lib/calc'

export default function Dashboard({ invoices, onNew, onEdit, onChase, onStatus }: {
  invoices: Invoice[]
  onNew: () => void
  onEdit: (inv: Invoice) => void
  onChase: (inv: Invoice) => void
  onStatus: (id: string, status: Invoice['status']) => void
}) {
  const overdue = invoices.filter((inv) => isOverdue(inv))
  const outstanding = invoices.filter((inv) => inv.status === 'sent' && !isOverdue(inv))
  const paidTotal = invoices.filter((inv) => inv.status === 'paid').reduce((s, inv) => s + total(inv), 0)
  const outstandingTotal = [...overdue, ...outstanding].reduce((s, inv) => s + total(inv), 0)

  const sorted = [...invoices].sort((a, b) => {
    const ao = isOverdue(a) ? 1 : 0
    const bo = isOverdue(b) ? 1 : 0
    if (ao !== bo) return bo - ao
    return (b.dueDate || '').localeCompare(a.dueDate || '')
  })

  return (
    <div>
      <div className="stat-row">
        <div className="stat">
          <span className="stat-num danger">{overdue.length}</span>
          <span className="stat-label">Overdue — chase these</span>
        </div>
        <div className="stat">
          <span className="stat-num">{outstanding.length}</span>
          <span className="stat-label">Awaiting payment</span>
        </div>
        <div className="stat">
          <span className="stat-num">{formatMoney(outstandingTotal, invoices[0]?.currency ?? 'USD')}</span>
          <span className="stat-label">Outstanding value</span>
        </div>
        <div className="stat">
          <span className="stat-num">{formatMoney(paidTotal, invoices[0]?.currency ?? 'USD')}</span>
          <span className="stat-label">Paid all-time</span>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="alert">
          💸 You have {overdue.length} overdue invoice{overdue.length === 1 ? '' : 's'} worth{' '}
          {formatMoney(overdue.reduce((s, inv) => s + total(inv), 0), overdue[0].currency)}.
          Polite persistence gets paid — send a reminder now.
        </div>
      )}

      <div className="row spread">
        <h2>Invoices</h2>
        <button className="btn primary" onClick={onNew}>+ New invoice</button>
      </div>

      {sorted.length === 0 ? (
        <div className="empty">
          <p>No invoices yet.</p>
          <button className="btn primary" onClick={onNew}>Create your first invoice</button>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Due</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((inv) => {
              const late = daysOverdue(inv)
              return (
                <tr key={inv.id} className={late > 0 ? 'row-overdue' : ''}>
                  <td className="mono">{inv.number}</td>
                  <td>{inv.client.name || '—'}</td>
                  <td>{formatMoney(total(inv), inv.currency)}</td>
                  <td>
                    {formatDate(inv.dueDate)}
                    {late > 0 && <span className="late-badge">{late}d late</span>}
                  </td>
                  <td>
                    <span className={`status status-${inv.status}${late > 0 && inv.status === 'sent' ? ' status-overdue' : ''}`}>
                      {inv.status === 'sent' && late > 0 ? 'overdue' : inv.status}
                    </span>
                  </td>
                  <td className="row-actions">
                    {inv.status === 'sent' && late > 0 && (
                      <button className="btn small primary" onClick={() => onChase(inv)}>Chase</button>
                    )}
                    <button className="btn small ghost" onClick={() => onEdit(inv)}>Edit</button>
                    {inv.status !== 'paid' ? (
                      <button className="btn small ghost" onClick={() => onStatus(inv.id, 'paid')}>Mark paid</button>
                    ) : (
                      <button className="btn small ghost" onClick={() => onStatus(inv.id, 'sent')}>Unmark</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
