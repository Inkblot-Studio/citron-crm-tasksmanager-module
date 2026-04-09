import { useState, useCallback, useEffect, useMemo } from 'react'
import type { TaskWithStatus } from '@citron-systems/citron-ui'
import { useJiraConfig } from '@/lib/JiraContext'
import { useToast } from '@/lib/ToastContext'
import type { Task } from '@/lib/jira-types'
import {
  fetchJiraIssues,
  updateJiraIssue,
  getTransitions,
  transitionJiraIssue,
  transitionToStatus,
} from '@/lib/jira-api'
import type { JiraTransition } from '@/lib/jira-api'

export function useJiraTasks() {
  const { config, isConnected } = useJiraConfig()
  const { addToast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    if (!config) return
    setLoading(true)
    setError(null)
    try {
      setTasks(await fetchJiraIssues(config))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks')
      addToast({ title: 'Failed to load tasks', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }, [config, addToast])

  useEffect(() => {
    if (config) loadTasks()
    else setTasks([])
  }, [config, loadTasks])

  const kanbanTasks: TaskWithStatus[] = useMemo(
    () =>
      tasks.map((t) => ({
        id: t.id,
        title: t.title,
        company: t.project?.name ?? '',
        priority: t.priority,
        date: t.due ? new Date(t.due).toLocaleDateString() : '-',
        assignee: t.assignee?.displayName ?? 'Unassigned',
        completed: t.status === 'done',
        jiraKey: t.id,
        status: t.status,
      })),
    [tasks],
  )

  const handleKanbanChange = useCallback(
    async (updated: TaskWithStatus[]) => {
      if (!config) return
      for (const kt of updated) {
        const orig = tasks.find((t) => t.id === kt.id)
        if (!orig || orig.status === kt.status) continue
        try {
          const available = await getTransitions(config, kt.id)
          const target = available.find((tr) => transitionToStatus(tr) === kt.status)
          if (target) {
            await transitionJiraIssue(config, kt.id, target.id)
            addToast({
              title: `${kt.id} moved to ${kt.status === 'done' ? 'Done' : kt.status === 'in_progress' ? 'In Progress' : 'To Do'}`,
              variant: 'success',
            })
          } else {
            addToast({ title: `No transition available for ${kt.id}`, variant: 'warning' })
            return
          }
        } catch (e) {
          addToast({ title: e instanceof Error ? e.message : 'Transition failed', variant: 'error' })
          return
        }
      }
      setTasks((prev) =>
        prev.map((t) => {
          const kt = updated.find((u) => u.id === t.id)
          return kt ? { ...t, status: kt.status } : t
        }),
      )
    },
    [config, tasks, addToast],
  )

  const handleStatusChange = useCallback(
    async (taskId: string, transition: JiraTransition) => {
      if (!config) return
      try {
        await transitionJiraIssue(config, taskId, transition.id)
        const newStatus = transitionToStatus(transition)
        if (newStatus) {
          setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))
        }
        addToast({ title: `Status: ${transition.name}`, variant: 'success' })
      } catch (e) {
        addToast({ title: e instanceof Error ? e.message : 'Transition failed', variant: 'error' })
      }
    },
    [config, addToast],
  )

  const handleUpdateTask = useCallback(
    async (key: string, payload: Record<string, unknown>) => {
      if (!config) return
      await updateJiraIssue(config, key, payload as Parameters<typeof updateJiraIssue>[2])
    },
    [config],
  )

  const getTaskTransitions = useCallback(
    async (key: string) => {
      if (!config) return []
      return getTransitions(config, key)
    },
    [config],
  )

  const rawById = useCallback(
    (id: string) => tasks.find((t) => t.id === id) ?? null,
    [tasks],
  )

  return {
    config,
    isConnected,
    tasks,
    kanbanTasks,
    loading,
    error,
    loadTasks,
    handleKanbanChange,
    handleStatusChange,
    handleUpdateTask,
    getTaskTransitions,
    rawById,
  }
}
