import type { VercelRequest, VercelResponse } from '@vercel/node'
import { jiraFetch, setCors } from '../../_utils'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res)
  const key = req.query.key as string
  if (!key) {
    return res.status(400).json({ error: 'Missing issue key' })
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { domain, email, apiToken, action, transitionId } = req.body || {}
  if (!domain || !email || !apiToken) {
    return res.status(400).json({ error: 'Missing domain, email, or apiToken' })
  }

  const creds = { domain, email, apiToken }

  try {
    if (action === 'list' || !transitionId) {
      const response = await jiraFetch(creds, `/issue/${key}/transitions`)
      const data = await response.json()
      if (!response.ok) {
        return res.status(response.status).json({ error: data.errorMessages?.[0] || 'Failed to get transitions' })
      }
      return res.status(200).json({ transitions: data.transitions ?? [] })
    }

    const response = await jiraFetch(creds, `/issue/${key}/transitions`, {
      method: 'POST',
      body: JSON.stringify({ transition: { id: transitionId } }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return res.status(response.status).json({ error: data.errorMessages?.[0] || 'Transition failed' })
    }

    return res.status(204).end()
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process transition' })
  }
}
