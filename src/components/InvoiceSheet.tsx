import type { Invoice } from '../types'
import { discountAmount, formatDate, formatMoney, subtotal, taxAmount, total } from '../lib/calc'

export default function InvoiceSheet({ invoice, businessName, pro }: {
  invoice: Invoice
  businessName: string
  pro: boolean
}) {
  const c = invoice.client
  return (
    <div className="invoice-sheet" style={{ ['--accent' as string]: invoice.accent }}>
      <div className="sheet-head">
        <div>
          <div className="sheet-brand">{businessName || 'Your Business'}</div>
          <div className="sheet-muted">{invoice.notes ? '' : ''}</div>
        </div>
        <div className="sheet-title">
          <h2>INVOICE</h2>
          <div className="sheet-number">{invoice.number}</div>
        </div>
      </div>

      <div className="sheet-parties">
        <div>
          <div className="sheet-label">Bill To</div>
          <div className="sheet-strong">{c.name || 'Client name'}</div>
          {c.company && <div>{c.company}</div>}
          {c.email && <div>{c.email}</div>}
          <div className="sheet-pre">{c.address}</div>
        </div>
        <div className="sheet-meta">
          <div><span className="sheet-label">Issue date</span>{formatDate(invoice.issueDate)}</div>
          <div><span className="sheet-label">Due date</span>{formatDate(invoice.dueDate)}</div>
          <div><span className="sheet-label">Amount due</span><strong>{formatMoney(total(invoice), invoice.currency)}</strong></div>
        </div>
      </div>

      <table className="sheet-items">
        <thead>
          <tr>
            <th>Description</th>
            <th className="num">Qty</th>
            <th className="num">Rate</th>
            <th className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it) => (
            <tr key={it.id}>
              <td>{it.description || '—'}</td>
              <td className="num">{it.qty}</td>
              <td className="num">{formatMoney(it.rate, invoice.currency)}</td>
              <td className="num">{formatMoney(it.qty * it.rate, invoice.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="sheet-totals">
        <div><span>Subtotal</span><span>{formatMoney(subtotal(invoice), invoice.currency)}</span></div>
        {invoice.discount > 0 && (
          <div><span>Discount ({invoice.discount}%)</span><span>−{formatMoney(discountAmount(invoice), invoice.currency)}</span></div>
        )}
        {invoice.taxRate > 0 && (
          <div><span>Tax ({invoice.taxRate}%)</span><span>{formatMoney(taxAmount(invoice), invoice.currency)}</span></div>
        )}
        <div className="sheet-grand"><span>Total due</span><span>{formatMoney(total(invoice), invoice.currency)}</span></div>
      </div>

      {invoice.notes && (
        <div className="sheet-notes">
          <div className="sheet-label">Notes</div>
          <div className="sheet-pre">{invoice.notes}</div>
        </div>
      )}

      {!pro && <div className="sheet-watermark">Created with ChaseInvoice — chaseinvoice.app</div>}
    </div>
  )
}
