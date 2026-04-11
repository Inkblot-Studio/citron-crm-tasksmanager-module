import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { TaskWithStatus } from '@citron-systems/citron-ui'
import * as store from './internal-tasks-store'
import type { InternalTask, InternalTaskCreate } from './internal-tasks-store'

function toKanban(t: InternalTask): TaskWithStatus {
  const iso = t.date && /^\d{4}-\d{2}-\d{2}/.test(t.date) ? t.date.slice(0, 10) : null
  return {
    id: t.id,
    title: t.title,
    company: t.company,
    priority: t.priority,
    date: t.date ? (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString() : new Date(t.date).toLocaleDateString()) : '-',
    assignee: t.assignee || 'Unassigned',
    completed: t.status === 'done',
    status: t.status,
    description: t.description,
    dueDateIso: iso,
  }
}

interface InternalTasksContextType {
  raw: InternalTask[]
  tasks: TaskWithStatus[]
  loading: boolean
  create: (payload: InternalTaskCreate) => void
  update: (id: string, patch: Partial<Omit<InternalTask, 'id' | 'createdAt'>>) => void
  remove: (id: string) => void
  moveStatus: (id: string, status: TaskWithStatus['status']) => void
  reload: () => void
  applyKanbanChange: (updated: TaskWithStatus[]) => void
}

const Ctx = createContext<InternalTasksContextType | null>(null)

export function useInternalTasks() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useInternalTasks must be inside InternalTasksProvider')
  return ctx
}

export function InternalTasksProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<InternalTask[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(() => {
    setLoading(true)
    setRaw(store.loadAll())
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  const tasks = raw.map(toKanban)

  const createTask = useCallback((payload: InternalTaskCreate) => {
    store.create(payload)
    setRaw(store.loadAll())
  }, [])

  const updateTask = useCallback((id: string, patch: Partial<Omit<InternalTask, 'id' | 'createdAt'>>) => {
    store.update(id, patch)
    setRaw(store.loadAll())
  }, [])

  const removeTask = useCallback((id: string) => {
    store.remove(id)
    setRaw(store.loadAll())
  }, [])

  const moveStatus = useCallback((id: string, status: TaskWithStatus['status']) => {
    store.update(id, { status })
    setRaw(store.loadAll())
  }, [])

  const applyKanbanChange = useCallback((updated: TaskWithStatus[]) => {
    const byId = new Map(raw.map((t) => [t.id, t]))
    const next: typeof raw = []
    for (const kt of updated) {
      const ex = byId.get(kt.id)
      if (!ex) continue
      const statusChanged = ex.status !== kt.status
      next.push(
        statusChanged
          ? { ...ex, status: kt.status, updatedAt: new Date().toISOString() }
          : ex
      )
    }
    for (const t of raw) {
      if (!updated.some((u) => u.id === t.id)) next.push(t)
    }
    store.replaceAll(next)
    setRaw(store.loadAll())
  }, [raw])

  return (
    <Ctx.Provider value={{ raw, tasks, loading, create: createTask, update: updateTask, remove: removeTask, moveStatus, reload, applyKanbanChange }}>
      {children}
    </Ctx.Provider>
  )
}
