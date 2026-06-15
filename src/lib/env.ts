const requiredVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const

const paymentVars = [
  "BANK_NAME",
  "BANK_ACCOUNT_NAME",
  "BANK_ACCOUNT_NUMBER",
  "BANK_BRANCH_CODE",
  "PAYMENT_REFERENCE_PREFIX",
] as const

let validated = false

export function validateEnv() {
  if (validated) return
  validated = true

  const missing: string[] = []
  for (const key of requiredVars) {
    if (!process.env[key]) missing.push(key)
  }

  if (missing.length > 0) {
    console.warn(
      `Missing environment variables: ${missing.join(", ")}\n` +
      "Set these in your .env file."
    )
  }

  const paymentMissing: string[] = []
  for (const key of paymentVars) {
    if (!process.env[key]) paymentMissing.push(key)
  }

  if (paymentMissing.length > 0) {
    console.warn(
      `Warning: Missing payment environment variables: ${paymentMissing.join(", ")}\n` +
      "EFT payments will not work until these are configured."
    )
  }
}

export function getPaymentConfig() {
  return {
    bankName: process.env.BANK_NAME || "First National Bank (FNB)",
    accountName: process.env.BANK_ACCOUNT_NAME || "Edu Learn",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || "628419273810",
    branchCode: process.env.BANK_BRANCH_CODE || "255005",
    referencePrefix: process.env.PAYMENT_REFERENCE_PREFIX || "EDU",
  }
}
