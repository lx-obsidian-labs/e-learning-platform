export type OpenEdxConfig = {
  baseUrl: string
  clientId: string
  clientSecret: string
}

let token: string | null = null
let tokenExpiry = 0

export async function authenticate(config: OpenEdxConfig): Promise<string> {
  if (token && Date.now() < tokenExpiry) return token

  try {
    const res = await fetch(`${config.baseUrl}/oauth2/v1/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        token_type: "jwt",
      }),
    })

    if (!res.ok) throw new Error(`Auth failed: ${res.status}`)

    const data = await res.json()
    token = data.access_token
    tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000
    return token!
  } catch (err) {
    token = null
    throw err
  }
}

export async function authedFetch(config: OpenEdxConfig, path: string, init?: RequestInit) {
  const accessToken = await authenticate(config)
  const res = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  if (res.status === 401) {
    token = null
    tokenExpiry = 0
    return authedFetch(config, path, init)
  }

  if (!res.ok) throw new Error(`Open edX API error: ${res.status} ${res.statusText}`)

  return res.json()
}
