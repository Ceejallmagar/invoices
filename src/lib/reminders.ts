import type { Invoice } from '../types'
import { daysOverdue, formatDate, formatMoney, total } from './calc'

export type ReminderStage = 'friendly' | 'firm' | 'final'

export function stageFor(daysLate: number): ReminderStage {
  if (daysLate <= 7) return 'friendly'
  if (daysLate <= 21) return 'firm'
  return 'final'
}

export const STAGE_LABELS: Record<ReminderStage, string> = {
  friendly: 'Friendly nudge (1–7 days late)',
  firm: 'Firm follow-up (8–21 days late)',
  final: 'Final notice (22+ days late)',
}

export function reminderEmail(inv: Invoice, businessName: string): { subject: string; body: string } {
  const days = daysOverdue(inv)
  const stage = stageFor(days)
  const amount = formatMoney(total(inv), inv.currency)
  const due = formatDate(inv.dueDate)
  const client = inv.client.name || 'there'

  if (stage === 'friendly') {
    return {
      subject: `Friendly reminder: invoice ${inv.number} is due`,
      body: `Hi ${client},

Hope you're doing well! This is a quick, friendly reminder that invoice ${inv.number} for ${amount} was due on ${due} — ${days} day${days === 1 ? '' : 's'} ago.

If it's already scheduled, no action needed and thanks! Otherwise, you can pay at your earliest convenience.

Let me know if you need anything from my side (like a copy of the invoice or payment details).

Best,
${businessName}`,
    }
  }

  if (stage === 'firm') {
    return {
      subject: `Past due: invoice ${inv.number} (${amount}) — ${days} days overdue`,
      body: `Hi ${client},

Invoice ${inv.number} for ${amount} was due on ${due} and is now ${days} days overdue. I haven't received payment yet and wanted to follow up directly in case it slipped through.

Could you let me know when I can expect payment? If there's an issue with the invoice — a dispute, missing PO, or wrong billing contact — tell me and I'll sort it out today.

I'd appreciate settling this within the next 5 business days.

Thanks for your understanding,
${businessName}`,
    }
  }

  return {
    subject: `FINAL NOTICE: invoice ${inv.number} — ${amount}, ${days} days overdue`,
    body: `Hi ${client},

Despite previous reminders, invoice ${inv.number} for ${amount} remains unpaid — now ${days} days past its ${due} due date.

This is a final request for payment. Please settle the invoice within 7 days. If payment isn't received by then, I will:
  • Pause all ongoing work for ${inv.client.company || client}
  • Add late fees as stated in our agreement
  • Consider further collection steps

If payment has already been sent, disregard this notice and accept my thanks. If you're experiencing genuine difficulty, reply and we can discuss a payment plan — I'd rather find a solution than escalate.

Regards,
${businessName}`,
  }
}
