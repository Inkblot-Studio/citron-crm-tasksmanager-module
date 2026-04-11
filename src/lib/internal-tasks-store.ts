import type { TaskStatus, TaskPriority } from '@citron-systems/citron-ui'

export interface InternalTask {
  id: string
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  assignee: string
  company: string
  date: string
  labels: string[]
  createdAt: string
  updatedAt: string
  syncedJiraKey?: string
  pendingSlackSync?: boolean
}

export type InternalTaskCreate = Pick<InternalTask, 'title'> &
  Partial<Pick<InternalTask, 'description' | 'priority' | 'status' | 'assignee' | 'company' | 'date' | 'labels'>>

const STORAGE_KEY = 'citron-internal-tasks-v1'

function read(): InternalTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as InternalTask[]) : []
  } catch {
    return []
  }
}

function write(tasks: InternalTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function loadAll(): InternalTask[] {
  return read()
}

export function create(payload: InternalTaskCreate): InternalTask {
  const now = new Date().toISOString()
  const task: InternalTask = {
    id: crypto.randomUUID(),
    title: payload.title,
    description: payload.description ?? '',
    priority: payload.priority ?? 'medium',
    status: payload.status ?? 'todo',
    assignee: payload.assignee ?? '',
    company: payload.company ?? '',
    date: payload.date ?? '',
    labels: payload.labels ?? [],
    createdAt: now,
    updatedAt: now,
  }
  const tasks = read()
  tasks.unshift(task)
  write(tasks)
  return task
}

export function update(id: string, patch: Partial<Omit<InternalTask, 'id' | 'createdAt'>>): InternalTask | null {
  const tasks = read()
  const idx = tasks.findIndex((t) => t.id === id)
  if (idx === -1) return null
  tasks[idx] = { ...tasks[idx], ...patch, updatedAt: new Date().toISOString() }
  write(tasks)
  return tasks[idx]
}

export function remove(id: string): boolean {
  const tasks = read()
  const filtered = tasks.filter((t) => t.id !== id)
  if (filtered.length === tasks.length) return false
  write(filtered)
  return true
}

/** Replaces persisted order and content (used after board drag-and-drop). */
export function replaceAll(tasks: InternalTask[]) {
  write(tasks)
}
