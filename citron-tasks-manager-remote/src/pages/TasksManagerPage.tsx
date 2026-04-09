import { Button, Skeleton, TaskKanbanBoard } from '@citron-systems/citron-ui'
import type { TaskWithStatus as KanbanTask } from '@citron-systems/citron-ui'
import * as Popover from '@radix-ui/react-popover'
import {
  CheckSquare,
  Plus,
  Circle,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  RefreshCw,
  ExternalLink,
  Settings,
  FolderKanban,
  Tag,
  ChevronDown,
  List,
  LayoutGrid,
} from 'lucide-react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useToast } from '@/lib/ToastContext'
import { useJiraConfig } from '@/lib/JiraContext'
import {
  fetchJiraIssues,
  updateJiraIssue,
  getTransitions,
  transitionJiraIssue,
  transitionToStatus,
} from '@/lib/jira-api'
import type { JiraTransition } from '@/lib/jira-api'
import type { Task, TaskPriority } from '@/lib/jira-types'
import { TaskEditModal } from '@/components/TaskEditModal'
import { TaskCreateModal } from '@/components/TaskCreateModal'

type ViewMode = 'list' | 'kanban'

export interface TasksManagerPageProps {
  settingsHref?: string
  onOpenSettings?: () => void
}

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  urgent: { label: 'Urgent', color: 'text-destructive', bg: 'bg-destructive/10' },
  high: { label: 'High', color: 'text-citrus-orange', bg: 'bg-citrus-orange/10' },
  medium: { label: 'Medium', color: 'text-citrus-lemon', bg: 'bg-citrus-lemon/10' },
  low: { label: 'Low', color: 'text-muted-foreground', bg: 'bg-secondary' },
}

const statusGroups = [
  { key: 'todo' as const, label: 'To Do', icon: Circle },
  { key: 'in_progress' as const, label: 'In Progress', icon: Clock },
  { key: 'done' as const, label: 'Done', icon: CheckCircle2 },
]

function TasksListSkeleton() {
  return (
    <div className="space-y-6">
      {statusGroups.map((g) => (
        <div key={g.key}>
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="w-3.5 h-3.5 rounded-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          <div className="space-y-2">
            {[1, 2].map((j) => (
              <div key={j} className="glass rounded-xl p-4 flex items-start gap-4">
                <Skeleton className="w-4 h-4 rounded-full shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
                <Skeleton className="h-4 w-12 rounded-full shrink-0" />
                <Skeleton className="h-3 w-16 shrink-0" />
                <Skeleton className="h-3 w-20 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {statusGroups.map((g) => (
        <div key={g.key} className="flex flex-col">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Skeleton className="w-3.5 h-3.5 rounded-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          <div className="space-y-2 flex-1">
            {[1, 2, 3].map((j) => (
              <div key={j} className="glass rounded-xl p-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-12 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function TasksManagerPage({ settingsHref = '/settings', onOpenSettings }: TasksManagerPageProps) {
  const { config, isConnected } = useJiraConfig()
  const { addToast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [statusPopoverTask, setStatusPopoverTask] = useState<string | null>(null)
  const [transitions, setTransitions] = useState<JiraTransition[]>([])
  const [loadingTransition, setLoadingTransition] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('citron-tasks-view') as ViewMode) || 'list'
  })

  const setAndPersistView = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('citron-tasks-view', mode)
  }

  const loadTasks = useCallback(async () => {
    if (!config) return
    setLoading(true)
    setError(null)
    try {
      const list = await fetchJiraIssues(config)
      setTasks(list)
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

  const handleStatusPopoverOpen = useCallback(
    async (open: boolean, task: Task) => {
      if (!open) {
        setStatusPopoverTask(null)
        setTransitions([])
        return
      }
      setStatusPopoverTask(task.id)
      setTransitions([])
      if (!config) return
      try {
        const list = await getTransitions(config, task.id)
        setTransitions(list)
      } catch {
        addToast({ title: 'Failed to load transitions', variant: 'error' })
      }
    },
    [config, addToast]
  )

  const handleApplyTransition = async (task: Task, transition: JiraTransition) => {
    if (!config) return
    setLoadingTransition(task.id)
    try {
      await transitionJiraIssue(config, task.id, transition.id)
      const newStatus = transitionToStatus(transition) ?? task.status
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      )
      setStatusPopoverTask(null)
      addToast({ title: `Status: ${transition.name}`, variant: 'success' })
    } catch (e) {
      addToast({ title: e instanceof Error ? e.message : 'Transition failed', variant: 'error' })
    } finally {
      setLoadingTransition(null)
    }
  }

  const handleUpdateTask = async (
    cfg: { domain: string; email: string; apiToken: string },
    key: string,
    payload: Record<string, unknown>
  ) => {
    await updateJiraIssue(cfg, key, payload as Parameters<typeof updateJiraIssue>[2])
  }

  const kanbanTasks: KanbanTask[] = useMemo(
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
    [tasks]
  )

  const handleKanbanChange = async (updated: KanbanTask[]) => {
    if (!config) return
    for (const kt of updated) {
      const orig = tasks.find((t) => t.id === kt.id)
      if (!orig || orig.status === kt.status) continue
      try {
        const available = await getTransitions(config, kt.id)
        const target = available.find((tr) => {
          const mapped = transitionToStatus(tr)
          return mapped === kt.status
        })
        if (target) {
          await transitionJiraIssue(config, kt.id, target.id)
          addToast({ title: `${kt.id} moved to ${kt.status === 'done' ? 'Done' : kt.status === 'in_progress' ? 'In Progress' : 'To Do'}`, variant: 'success' })
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
      })
    )
  }

  const handleSettingsClick = () => {
    if (onOpenSettings) {
      onOpenSettings()
    } else if (settingsHref) {
      window.location.href = settingsHref
    }
  }

  if (!isConnected || !config) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8">
        <div className="w-16 h-16 rounded-2xl bg-citrus-green/10 flex items-center justify-center mb-4">
          <CheckSquare className="w-8 h-8 text-citrus-green" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Connect Jira to view tasks</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          Connect your Jira account in Settings to sync and manage your tasks from Jira Cloud.
        </p>
        <Button onClick={handleSettingsClick} className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Go to Settings
        </Button>
      </div>
    )
  }

  const jiraBaseUrl = config.domain.replace(/\/$/, '')

  return (
    <div className="h-full flex flex-col">
      <header className="px-8 py-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-citrus-green/10 flex items-center justify-center">
            <CheckSquare className="w-4 h-4 text-citrus-green" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Tasks Manager</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {tasks.filter((t) => t.status !== 'done').length} pending · {tasks.filter((t) => t.priority === 'urgent').length} urgent
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setAndPersistView('list')}
              className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAndPersistView('kanban')}
              className={`p-1.5 transition-colors ${viewMode === 'kanban' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
              aria-label="Kanban view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Button
            variant="secondary"
            onClick={loadTasks}
            disabled={loading}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="text-xs flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            New Task
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-8 py-6">
        {loading && tasks.length === 0 ? (
          viewMode === 'kanban' ? <KanbanSkeleton /> : <TasksListSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="secondary" onClick={loadTasks}>
              Retry
            </Button>
          </div>
        ) : viewMode === 'kanban' ? (
          <TaskKanbanBoard
            tasks={kanbanTasks}
            onTasksChange={handleKanbanChange}
          />
        ) : (
          <div className="space-y-6">
            {statusGroups.map((group) => {
              const groupTasks = tasks.filter((t) => t.status === group.key)
              if (groupTasks.length === 0) return null
              return (
                <div key={group.key}>
                  <div className="flex items-center gap-2 mb-3">
                    <group.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {group.label}
                    </h2>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {groupTasks.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {groupTasks.map((task) => {
                      const p = priorityConfig[task.priority]
                      const isPopoverOpen = statusPopoverTask === task.id
                      const isLoading = loadingTransition === task.id
                      const StatusIcon =
                        group.key === 'done'
                          ? CheckCircle2
                          : group.key === 'in_progress'
                            ? Clock
                            : Circle
                      return (
                        <div
                          key={task.id}
                          className={`glass rounded-xl p-4 flex items-start gap-4 hover:bg-secondary/20 transition-colors ${
                            group.key === 'done' ? 'opacity-60' : ''
                          }`}
                        >
                          <Popover.Root
                            open={isPopoverOpen}
                            onOpenChange={(open) => handleStatusPopoverOpen(open, task)}
                          >
                            <Popover.Trigger
                              disabled={isLoading}
                              className="shrink-0 mt-0.5 flex items-center gap-0.5 p-0.5 rounded hover:bg-secondary/50 text-muted-foreground hover:text-foreground disabled:opacity-50"
                              aria-label="Change status"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <StatusIcon
                                className={`w-4 h-4 ${
                                  group.key === 'done' ? 'text-citrus-lime' : ''
                                }`}
                              />
                              <ChevronDown className="w-3 h-3 opacity-70" />
                            </Popover.Trigger>
                            <Popover.Portal>
                              <Popover.Content
                                side="right"
                                align="start"
                                sideOffset={6}
                                className="min-w-[160px] p-1 bg-surface-1 border border-border rounded-lg shadow-lg z-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {transitions.length === 0 && isPopoverOpen ? (
                                  <div className="px-3 py-2 text-xs text-muted-foreground">
                                    Loading...
                                  </div>
                                ) : transitions.length === 0 ? (
                                  <div className="px-3 py-2 text-xs text-muted-foreground">
                                    No transitions available
                                  </div>
                                ) : (
                                  transitions.map((t) => (
                                    <button
                                      key={t.id}
                                      onClick={() => handleApplyTransition(task, t)}
                                      disabled={isLoading}
                                      className="w-full text-left px-3 py-2 text-xs rounded hover:bg-secondary/70 flex items-center gap-2"
                                    >
                                      {['done', 'completed'].includes(
                                        t.to?.statusCategory?.key ?? ''
                                      ) && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-citrus-lime shrink-0" />
                                      )}
                                      {['indeterminate', 'in-flight'].includes(
                                        t.to?.statusCategory?.key ?? ''
                                      ) && (
                                        <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                      )}
                                      {t.to?.statusCategory?.key === 'new' && (
                                        <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                      )}
                                      <span>{t.name}</span>
                                    </button>
                                  ))
                                )}
                              </Popover.Content>
                            </Popover.Portal>
                          </Popover.Root>
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => setEditTask(task)}
                          >
                            <p className={`text-sm font-medium text-foreground ${group.key === 'done' ? 'line-through' : ''}`}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              {task.project?.name && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <FolderKanban className="w-3 h-3" />
                                  {task.project.name}
                                </span>
                              )}
                              {task.labels?.length > 0 && (
                                <span className="flex items-center gap-1 flex-wrap">
                                  {task.labels.slice(0, 3).map((l) => (
                                    <span
                                      key={l}
                                      className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/50 text-muted-foreground flex items-center gap-0.5"
                                    >
                                      <Tag className="w-2.5 h-2.5" />{l}
                                    </span>
                                  ))}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${p.bg} ${p.color}`}>
                            {p.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                            <Calendar className="w-3 h-3" />
                            {task.due ? new Date(task.due).toLocaleDateString() : '-'}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                            <User className="w-3 h-3" />
                            {task.assignee?.displayName ?? 'Unassigned'}
                          </span>
                          <a
                            href={`${jiraBaseUrl}/browse/${task.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 p-1 rounded hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
                            title="Open in Jira"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            {tasks.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-muted-foreground">No tasks found</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Create one or check your JQL filter</p>
              </div>
            )}
          </div>
        )}
      </div>

      {editTask && config && (
        <TaskEditModal
          task={editTask}
          config={config}
          open={!!editTask}
          onOpenChange={(open) => !open && setEditTask(null)}
          onSave={loadTasks}
          onError={(msg) => addToast({ title: msg, variant: 'error' })}
          updateJiraIssue={handleUpdateTask}
        />
      )}

      <TaskCreateModal
        config={config!}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => { loadTasks(); addToast({ title: 'Task created', variant: 'success' }) }}
        onError={(msg) => addToast({ title: msg, variant: 'error' })}
      />
    </div>
  )
}
