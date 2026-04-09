import type { JiraConfig, Task } from './jira-types'
import { PRIORITY_MAP, STATUS_CATEGORY_MAP } from './jira-types'

const API_BASE = import.meta.env.VITE_API_BASE || ''

function apiUrl(path: string): string {
  return `${API_BASE}/api${path}`
}

function adfToPlainText(adf: unknown): string {
  if (!adf || typeof adf !== 'object') return ''
  const obj = adf as { content?: Array<{ content?: Array<{ text?: string }>; text?: string }> }
  if (!obj.content || !Array.isArray(obj.content)) return ''
  return obj.content
    .map((c) => (c.content ? c.content.map((n) => n.text || '').join('') : c.text || ''))
    .join('\n')
}

function mapJiraIssueToTask(issue: {
  key: string
  fields: {
    summary?: string
    description?: unknown
    assignee?: { accountId: string; displayName: string } | null
    duedate?: string | null
    priority?: { name: string } | null
    status?: { id: string; statusCategory?: { key: string } }
    project?: { key: string; name: string }
    labels?: string[]
    issuetype?: { name: string }
    created?: string
    updated?: string
  }
}): Task {
  const f = issue.fields
  const statusCategory = f.status?.statusCategory?.key ?? 'new'
  const priorityName = f.priority?.name ?? 'Medium'
  return {
    id: issue.key,
    title: f.summary ?? '',
    description: f.description ? adfToPlainText(f.description) : null,
    assignee: f.assignee ? { id: f.assignee.accountId, displayName: f.assignee.displayName } : null,
    due: f.duedate ?? null,
    priority: PRIORITY_MAP[priorityName] ?? 'medium',
    status: STATUS_CATEGORY_MAP[statusCategory] ?? 'todo',
    statusId: f.status?.id ?? '',
    project: f.project ? { key: f.project.key, name: f.project.name } : { key: '', name: '' },
    labels: f.labels ?? [],
    issuetype: f.issuetype?.name ?? 'Task',
    createdAt: f.created,
    updatedAt: f.updated,
  }
}

export async function fetchJiraIssues(config: JiraConfig, jql?: string): Promise<Task[]> {
  const res = await fetch(apiUrl('/jira/search'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain: config.domain, email: config.email, apiToken: config.apiToken, jql, maxResults: 50 }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to fetch issues')
  }
  const data = await res.json()
  return (data.issues ?? []).map(mapJiraIssueToTask)
}

export async function verifyJiraConnection(config: JiraConfig): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(apiUrl('/jira/myself'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain: config.domain, email: config.email, apiToken: config.apiToken }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return { ok: false, error: err.error || 'Connection failed' }
  }
  return { ok: true }
}

export async function createJiraIssue(
  config: JiraConfig,
  payload: { projectKey: string; summary: string; description?: string; assigneeId?: string; priority?: string; duedate?: string; issuetype?: string }
): Promise<{ key: string }> {
  const res = await fetch(apiUrl('/jira/issues'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domain: config.domain,
      email: config.email,
      apiToken: config.apiToken,
      ...payload,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to create issue')
  }
  return res.json()
}

export async function updateJiraIssue(
  config: JiraConfig,
  key: string,
  payload: { summary?: string; description?: string; assigneeId?: string | null; priority?: string; duedate?: string | null }
): Promise<void> {
  const res = await fetch(apiUrl(`/jira/issues/${encodeURIComponent(key)}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domain: config.domain,
      email: config.email,
      apiToken: config.apiToken,
      ...payload,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to update issue')
  }
}

export interface JiraTransition {
  id: string
  name: string
  to?: {
    name?: string
    statusCategory?: { key: string }
  }
}

export function transitionToStatus(t: JiraTransition): 'todo' | 'in_progress' | 'done' | null {
  const cat = t.to?.statusCategory?.key?.toLowerCase()
  if (cat === 'done' || cat === 'completed') return 'done'
  if (cat === 'indeterminate' || cat === 'in-flight') return 'in_progress'
  if (cat === 'new') return 'todo'
  const text = `${(t.to?.name ?? '')} ${(t.name ?? '')}`.toLowerCase()
  if (/done|complete|resolved|closed/.test(text)) return 'done'
  if (/in progress|in-flight|indeterminate/.test(text)) return 'in_progress'
  if (/to do|open|reopen/.test(text)) return 'todo'
  return null
}

export async function getTransitions(config: JiraConfig, key: string): Promise<JiraTransition[]> {
  const res = await fetch(apiUrl(`/jira/issues/${encodeURIComponent(key)}/transitions`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domain: config.domain,
      email: config.email,
      apiToken: config.apiToken,
      action: 'list',
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to get transitions')
  }
  const data = await res.json()
  return data.transitions ?? []
}

export async function transitionJiraIssue(config: JiraConfig, key: string, transitionId: string): Promise<void> {
  const res = await fetch(apiUrl(`/jira/issues/${encodeURIComponent(key)}/transitions`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domain: config.domain,
      email: config.email,
      apiToken: config.apiToken,
      transitionId,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to transition issue')
  }
}

export async function fetchAssignableUsers(
  config: JiraConfig,
  projectKey: string
): Promise<{ id: string; displayName: string }[]> {
  const res = await fetch(apiUrl('/jira/users/assignable'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domain: config.domain,
      email: config.email,
      apiToken: config.apiToken,
      projectKey,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to fetch assignable users')
  }
  const data = await res.json()
  return data.users ?? []
}

export async function fetchJiraProjects(config: JiraConfig): Promise<{ key: string; name: string; id: string }[]> {
  const res = await fetch(apiUrl('/jira/projects'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain: config.domain, email: config.email, apiToken: config.apiToken }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to fetch projects')
  }
  const data = await res.json()
  return data.projects ?? []
}
