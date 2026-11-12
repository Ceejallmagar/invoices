export const PAYMENT_LINK = 'https://your-payment-link.example.com/checkout'
export const FREE_INVOICE_LIMIT = 3

const BLOCK = /[A-Z0-9]{4}/

function checksum(a: string, b: string, c: string): string {
  let h = 7
  const all = a + b + c
  for (let i = 0; i < all.length; i++) {
    h = (h * 31 + all.charCodeAt(i) * (i + 1)) % 1679615
  }
  return h.toString(36).toUpperCase().padStart(4, '0')
}

export function makeLicenseKey(seed: string): string {
  const clean = seed.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  const block = (i: number) => (clean.slice(i * 4, i * 4 + 4) + '0000').slice(0, 4)
  const a = block(0)
  const b = block(1)
  const c = block(2)
  return `CHASE-${a}-${b}-${c}-${checksum(a, b, c)}`
}

export function isValidLicenseKey(key: string): boolean {
  const parts = key.trim().toUpperCase().split('-')
  if (parts.length !== 5) return false
  if (parts[0] !== 'CHASE') return false
  if (!parts.slice(1).every((p) => BLOCK.test(p))) return false
  return checksum(parts[1], parts[2], parts[3]) === parts[4]
}

export function isPro(licenseKey: string): boolean {
  return licenseKey.trim() !== '' && isValidLicenseKey(licenseKey)
}
