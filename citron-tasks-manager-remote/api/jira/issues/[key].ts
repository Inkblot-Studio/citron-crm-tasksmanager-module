import type { VercelRequest, VercelResponse } from '@vercel/node'
import { jiraFetch, textToAdf, setCors } from '../_utils'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res)
  const key = req.query.key as string
  if (!key) {
    return res.status(400).json({ error: 'Missing issue key' })
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { domain, email, apiToken, summary, description, assigneeId, priority, duedate } = req.body || {}
  if (!domain || !email || !apiToken) {
    return res.status(400).json({ error: 'Missing domain, email, or apiToken' })
  }

  const fields: Record<string, unknown> = {}
  if (summary !== undefined) fields.summary = summary
  if (description !== undefined) fields.description = description ? textToAdf(description) : null
  if (assigneeId !== undefined) fields.assignee = assigneeId ? { accountId: assigneeId } : null
  if (priority !== undefined) fields.priority = priority ? { name: priority } : null
  if (duedate !== undefined) fields.duedate = duedate || null

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: 'No fields to update' })
  }

  try {
    const response = await jiraFetch({ domain, email, apiToken }, `/issue/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ fields }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      const errMsg = data.errors ? Object.values(data.errors).flat().join(', ') : data.errorMessages?.[0] || 'Update failed'
      return res.status(response.status).json({ error: errMsg })
    }

    return res.status(204).end()
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update issue' })
  }
}
