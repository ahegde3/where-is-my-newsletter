import { google, type gmail_v1 } from "googleapis";

const clientCache = new Map<string, gmail_v1.Gmail>();

export function getGmailClient({ accessToken }: { accessToken: string }): gmail_v1.Gmail {
  const cached = clientCache.get(accessToken)
  if (cached) return cached

  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  const client = google.gmail({ version: "v1", auth })

  clientCache.set(accessToken, client)
  return client
}
