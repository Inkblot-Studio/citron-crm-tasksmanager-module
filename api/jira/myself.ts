import type { VercelRequest, VercelResponse } from '@vercel/node'
import { jiraFetch, setCors } from './_utils'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    setCors(res)
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ ok: true })
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const body = typeof req.body === 'object' ? req.body : {}
    const { domain, email, apiToken } = body as Record<string, string>
    if (!domain || !email || !apiToken) {
      return res.status(400).json({ error: 'Missing domain, email, or apiToken' })
    }

    const response = await jiraFetch({ domain, email, apiToken }, '/myself')
    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({ error: data.errorMessages?.[0] || 'Invalid credentials' })
    }

    return res.status(200).json(data)
  } catch (err) {
    setCors(res)
    const msg = err instanceof Error ? err.message : 'Failed to connect to Jira'
    return res.status(500).json({ error: msg })
  }
}
