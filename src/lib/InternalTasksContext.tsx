import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { TaskWithStatus } from '@citron-systems/citron-ui'
import * as store from './internal-tasks-store'
import type { InternalTask, InternalTaskCreate } from './internal-tasks-store'

function toKanban(t: InternalTask): TaskWithStatus {
  return {
    id: t.id,
    title: t.title,
    company: t.company,
    priority: t.priority,
    date: t.date ? new Date(t.date).toLocaleDateString() : '-',
    assignee: t.assignee || 'Unassigned',
    completed: t.status === 'done',
    status: t.status,
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
    for (const kt of updated) {
      const existing = raw.find((t) => t.id === kt.id)
      if (existing && existing.status !== kt.status) {
        store.update(kt.id, { status: kt.status })
      }
    }
    setRaw(store.loadAll())
  }, [raw])

  return (
    <Ctx.Provider value={{ raw, tasks, loading, create: createTask, update: updateTask, remove: removeTask, moveStatus, reload, applyKanbanChange }}>
      {children}
    </Ctx.Provider>
  )
}
