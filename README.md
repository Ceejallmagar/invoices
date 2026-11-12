# ChaseInvoice 💸

**Invoices that chase their own payments.** A freelancer-first invoicing tool with a built-in
payment-chaser: track who owes you, and generate the exact escalating reminder email to send —
friendly nudge → firm follow-up → final notice.

Freelancers lose 5–10% of revenue to late/unpaid invoices, and existing chaser tools (Chaser,
InvoiceSherpa) are priced for mid-market. ChaseInvoice is the free-to-start wedge for freelancers.

## Features

- **Invoice builder** with live preview, line items, tax/discount, 8 currencies, accent colors
- **One-click PDF** via print-to-PDF (clean print stylesheet, no server needed)
- **Client book** — save clients, load them into any invoice
- **Overdue tracking** — dashboard highlights overdue invoices with days-late badges and an
  outstanding-value summary
- **Payment chaser** — generates stage-appropriate reminder emails (copy to clipboard or open in
  your email app), tone escalates automatically with days overdue
- **100% local** — all data stays in the browser's localStorage, with JSON export/import backups.
  No backend, no database, no hosting cost.

## Monetization

Free plan: 3 saved invoices, 3 clients, small "Created with ChaseInvoice" footer on PDFs.
**Pro: $19 one-time** — unlimited invoices/clients, no footer, all colors.

To turn on payments:

1. Create a one-time $19 payment link on [Gumroad](https://gumroad.com) or
   [Stripe Payment Links](https://stripe.com/payments/payment-links).
2. Put the URL in `src/lib/license.ts` → `PAYMENT_LINK`.
3. Issue license keys to buyers with `makeLicenseKey('buyer-name-or-email')` (see below), or wire
   the Gumroad license API into `isValidLicenseKey` for fully automated activation.

```bash
npx esbuild src/lib/license.ts --bundle --format=cjs > /tmp/license.cjs
node -e "console.log(require('/tmp/license.cjs').makeLicenseKey('customer@email.com'))"
```

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Deploy (free)

Static build — deploy `dist/` to Vercel, Netlify, Cloudflare Pages, or GitHub Pages in minutes.
Zero server cost means every dollar of revenue is margin.

## The math to $1,000/month

| Path | Numbers |
| --- | --- |
| One-time licences | 53 sales × $19 ≈ $1,000/mo in sales volume |
| Or subscriptions | 125 users × $8/mo = $1,000/mo recurring |

Distribution playbook:

1. **SEO long-tail**: "overdue invoice reminder email template", "how to chase an unpaid invoice",
   "freelance invoice template" — write one comparison/template post per week; the reminder
   templates in this app are the content.
2. **Communities**: r/freelance, Indie Hackers, X/Twitter build-in-public, freelance Facebook
   groups, Upwork/Fiverr seller forums.
3. **Product Hunt / BetaList** launch once the payment link is live.
4. **Free tool as lead magnet**: the reminder-email generator alone is shareable — every free user
   sees the Pro upsell at invoice #4.

## Stack

React 19 + TypeScript + Vite. No runtime dependencies, no backend.
