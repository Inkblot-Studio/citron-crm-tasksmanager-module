import type { VercelRequest, VercelResponse } from '@vercel/node'
import { jiraFetch, setCors } from './_utils'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res)
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { domain, email, apiToken } = req.body || {}
  if (!domain || !email || !apiToken) {
    return res.status(400).json({ error: 'Missing domain, email, or apiToken' })
  }

  try {
    const response = await jiraFetch({ domain, email, apiToken }, '/project')
    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({ error: data.errorMessages?.[0] || 'Failed to fetch projects' })
    }

    const arr = Array.isArray(data) ? data : data.values ?? []
    const projects = arr.map((p: { key: string; name: string; id: string }) => ({ key: p.key, name: p.name, id: p.id }))
    return res.status(200).json({ projects })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch projects' })
  }
}
