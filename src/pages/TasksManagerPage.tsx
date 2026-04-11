import {
  Button,
  Skeleton,
  TaskList as CuiTaskList,
  TaskKanbanBoard,
  IntegrationPlaceholder,
  Popover,
  PopoverTrigger,
  PopoverContent,
  SearchBar,
  Switch,
  Select,
  Separator,
  Tooltip,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Input,
  Textarea,
  Label,
} from '@citron-systems/citron-ui'
import type {
  TaskWithStatus,
  TaskSection,
  TaskItemData,
  TaskStatus as CuiTaskStatus,
  TaskDetailsSavePayload,
  SelectOption,
  TaskDetailsField,
  TaskPriority,
} from '@citron-systems/citron-ui'
import {
  CheckSquare,
  Plus,
  RefreshCw,
  Settings,
  List,
  LayoutGrid,
  Filter,
  MessageSquare,
  Layers,
} from 'lucide-react'
import { useState, useCallback, useMemo, useEffect, type ReactNode } from 'react'
import { useToast } from '@/lib/ToastContext'
import { useJiraTasks } from '@/hooks/useJiraTasks'
import { useInternalTasks } from '@/lib/InternalTasksContext'
import { useJiraConfig } from '@/lib/JiraContext'
import { createJiraIssue, fetchJiraProjects, getTransitions, transitionToStatus, fetchAssignableUsers } from '@/lib/jira-api'
import { IntegrationSwitch, type Integration } from '@/components/IntegrationSwitch'
import { InternalTaskCreateModal, type InternalTaskCreatePayload } from '@/components/InternalTaskCreateModal'
import { TaskCreateModal } from '@/components/TaskCreateModal'

const PRIORITY_TO_JIRA: Record<string, string> = {
  urgent: 'Highest',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const PRIORITY_RANK: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

type ViewMode = 'list' | 'kanban'
type SortKey = 'priority' | 'due' | 'title'

const CONNECT_CARD_CLASS =
  'w-full max-w-lg border-border bg-card/90 shadow-sm backdrop-blur-sm'

export interface TasksManagerPageProps {
  settingsHref?: string
  onOpenSettings?: () => void
}

const STATUS_COLUMNS: { id: CuiTaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
]

function mergeBoardAfterPartialUpdate(
  full: TaskWithStatus[],
  partialUpdated: TaskWithStatus[],
): TaskWithStatus[] {
  const displayIds = new Set(partialUpdated.map((t) => t.id))
  const hidden = full.filter((t) => !displayIds.has(t.id))
  return [...partialUpdated, ...hidden]
}

function matchesSearch(task: TaskWithStatus, q: string): boolean {
  if (!q.trim()) return true
  const s = q.toLowerCase()
  return (
    task.title.toLowerCase().includes(s) ||
    task.company.toLowerCase().includes(s) ||
    task.assignee.toLowerCase().includes(s) ||
    (task.jiraKey?.toLowerCase().includes(s) ?? false)
  )
}

function sortTasks(tasks: TaskWithStatus[], sortKey: SortKey): TaskWithStatus[] {
  const copy = [...tasks]
  copy.sort((a, b) => {
    if (sortKey === 'title') return a.title.localeCompare(b.title)
    if (sortKey === 'priority') return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    const ad = a.dueDateIso ? a.dueDateIso : '9999'
    const bd = b.dueDateIso ? b.dueDateIso : '9999'
    return ad.localeCompare(bd)
  })
  return copy
}

function ConnectIntegrationLayout({
  title,
  description,
  icon,
  onOpenSettings,
}: {
  title: string
  description: string
  icon: ReactNode
  onOpenSettings: () => void
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
      <IntegrationPlaceholder
        name={title}
        description={description}
        icon={icon}
        connected={false}
        onConnect={onOpenSettings}
        connectLabel="Open settings"
        className={CONNECT_CARD_CLASS}
      />
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-6">
      {STATUS_COLUMNS.map((g) => (
        <div key={g.id}>
          <div className="mb-3 flex items-center gap-2">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          <div className="space-y-2">
            {[1, 2].map((j) => (
              <div key={j} className="glass flex items-start gap-4 rounded-xl p-4">
                <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-12 shrink-0 rounded-full" />
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
    <div className="flex min-h-[50vh] w-full min-w-0 gap-4">
      {STATUS_COLUMNS.map((g) => (
        <div key={g.id} className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="mb-3 flex items-center gap-2 px-1">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex-1 space-y-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="glass space-y-2 rounded-xl p-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const TASK_PRIORITY_EDIT_OPTIONS: SelectOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

function deriveTaskStatus(task: TaskItemData): CuiTaskStatus {
  if (task.status) return task.status
  if (task.completed) return 'done'
  return 'todo'
}

function TaskDetailsDialog({
  task,
  open,
  onOpenChange,
  extraFields,
  assigneeOptions,
  saving,
  onSaveDetails,
  onStatusChange,
}: {
  task: TaskItemData | null
  open: boolean
  onOpenChange: (next: boolean) => void
  extraFields: TaskDetailsField[]
  assigneeOptions?: SelectOption[]
  saving: boolean
  onSaveDetails: (payload: TaskDetailsSavePayload) => void | Promise<void>
  onStatusChange: (status: CuiTaskStatus) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeText, setAssigneeText] = useState('')
  const [assigneeAccountId, setAssigneeAccountId] = useState<string | null>(null)
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDateIso, setDueDateIso] = useState('')

  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setDescription(task.description ?? '')
    setAssigneeText(task.assignee ?? '')
    setAssigneeAccountId(task.assigneeAccountId ?? null)
    setPriority(task.priority)
    setDueDateIso(task.dueDateIso ? task.dueDateIso.slice(0, 10) : '')
  }, [
    task?.id,
    task?.title,
    task?.description,
    task?.assignee,
    task?.assigneeAccountId,
    task?.priority,
    task?.dueDateIso,
    task?.status,
    task?.completed,
  ])

  const syncFormFromTask = useCallback(() => {
    if (!task) return
    setTitle(task.title)
    setDescription(task.description ?? '')
    setAssigneeText(task.assignee ?? '')
    setAssigneeAccountId(task.assigneeAccountId ?? null)
    setPriority(task.priority)
    setDueDateIso(task.dueDateIso ? task.dueDateIso.slice(0, 10) : '')
  }, [task])

  const handleSave = useCallback(() => {
    if (!task) return
    void onSaveDetails({
      title: title.trim(),
      description: description.trim(),
      assignee: assigneeText.trim(),
      assigneeAccountId:
        assigneeOptions && assigneeOptions.length > 0 ? assigneeAccountId : null,
      priority,
      dueDateIso: dueDateIso.trim() || null,
    })
  }, [
    task,
    title,
    description,
    assigneeText,
    assigneeAccountId,
    assigneeOptions,
    priority,
    dueDateIso,
    onSaveDetails,
  ])

  const statusOptions: SelectOption[] = STATUS_COLUMNS.map((c) => ({ value: c.id, label: c.label }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(92vh,820px)] w-full max-w-[min(100vw-1.5rem,36rem)] gap-0 overflow-hidden p-0"
        showCloseButton
      >
        {task ? (
          <div className="flex max-h-[min(92vh,820px)] flex-col">
            <div className="border-b border-[var(--inkblot-semantic-color-border-default)] px-6 pb-4 pt-6">
              <DialogHeader className="space-y-1 text-left">
                <DialogTitle className="text-left">Task details</DialogTitle>
                {task.jiraKey ? (
                  <DialogDescription className="text-left">{task.jiraKey}</DialogDescription>
                ) : (
                  <DialogDescription className="sr-only">Edit task fields</DialogDescription>
                )}
              </DialogHeader>
              <div className="mt-4 space-y-2">
                <Label htmlFor="citron-task-edit-title">Title</Label>
                <Input
                  id="citron-task-edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              {extraFields.map((f) => (
                <div
                  key={f.label}
                  className="flex flex-col gap-1 border-b border-[var(--inkblot-semantic-color-border-default)] py-3"
                >
                  <span className="[font:var(--inkblot-semantic-typography-body-small)] text-[var(--inkblot-semantic-color-text-tertiary)]">
                    {f.label}
                  </span>
                  <div className="[font:var(--inkblot-semantic-typography-body-small)] text-[var(--inkblot-semantic-color-text-primary)]">
                    {f.value}
                  </div>
                </div>
              ))}

              <div className="flex flex-col gap-1 border-b border-[var(--inkblot-semantic-color-border-default)] py-3">
                <span className="[font:var(--inkblot-semantic-typography-body-small)] text-[var(--inkblot-semantic-color-text-tertiary)]">
                  Company
                </span>
                <div className="[font:var(--inkblot-semantic-typography-body-small)] text-[var(--inkblot-semantic-color-text-primary)]">
                  {task.company?.trim() ? task.company : '—'}
                </div>
              </div>

              <div className="space-y-2 border-b border-[var(--inkblot-semantic-color-border-default)] py-3">
                <Label htmlFor="citron-task-edit-status">Status</Label>
                <Select
                  id="citron-task-edit-status"
                  aria-label="Task status"
                  value={deriveTaskStatus(task)}
                  onChange={(e) => onStatusChange(e.target.value as CuiTaskStatus)}
                  options={statusOptions}
                />
              </div>

              <div className="space-y-2 border-b border-[var(--inkblot-semantic-color-border-default)] py-3">
                <Label htmlFor="citron-task-edit-desc">Description</Label>
                <Textarea
                  id="citron-task-edit-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2 border-b border-[var(--inkblot-semantic-color-border-default)] py-3">
                <Label htmlFor="citron-task-edit-priority">Priority</Label>
                <Select
                  id="citron-task-edit-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  options={TASK_PRIORITY_EDIT_OPTIONS}
                />
              </div>

              <div className="space-y-2 border-b border-[var(--inkblot-semantic-color-border-default)] py-3">
                <Label htmlFor="citron-task-edit-due">Due date</Label>
                <Input
                  id="citron-task-edit-due"
                  type="date"
                  value={dueDateIso}
                  onChange={(e) => setDueDateIso(e.target.value)}
                />
              </div>

              {assigneeOptions && assigneeOptions.length > 0 ? (
                <div className="space-y-2 border-b border-[var(--inkblot-semantic-color-border-default)] py-3">
                  <Label htmlFor="citron-task-edit-assignee-sel">Assignee</Label>
                  <Select
                    id="citron-task-edit-assignee-sel"
                    value={assigneeAccountId ?? ''}
                    onChange={(e) => {
                      const v = e.target.value
                      setAssigneeAccountId(v || null)
                      const opt = assigneeOptions.find((o) => o.value === v)
                      if (opt) setAssigneeText(opt.label)
                    }}
                    options={[{ value: '', label: 'Unassigned' }, ...assigneeOptions]}
                  />
                </div>
              ) : (
                <div className="space-y-2 py-3">
                  <Label htmlFor="citron-task-edit-assignee">Assignee</Label>
                  <Input
                    id="citron-task-edit-assignee"
                    value={assigneeText}
                    onChange={(e) => setAssigneeText(e.target.value)}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="border-t border-[var(--inkblot-semantic-color-border-default)] px-6 py-4">
              <DialogClose type="button">Close</DialogClose>
              <Button type="button" variant="secondary" disabled={saving} onClick={syncFormFromTask}>
                Discard
              </Button>
              <Button type="button" variant="primary" disabled={saving} onClick={handleSave}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export default function TasksManagerPage({ settingsHref = '/settings', onOpenSettings }: TasksManagerPageProps) {
  const { addToast } = useToast()
  const jira = useJiraTasks()
  const internal = useInternalTasks()

  const [integration, setIntegration] = useState<Integration>(() =>
    (localStorage.getItem('citron-tasks-integration') as Integration) || 'internal',
  )
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    (localStorage.getItem('citron-tasks-view') as ViewMode) || 'list',
  )
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [panelSaving, setPanelSaving] = useState(false)
  const [assigneeOptions, setAssigneeOptions] = useState<SelectOption[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [refreshSpinning, setRefreshSpinning] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>(() =>
    (localStorage.getItem('citron-tasks-sort') as SortKey) || 'priority',
  )
  const [hideDone, setHideDone] = useState(() => localStorage.getItem('citron-tasks-hide-done') === '1')
  const [filterUrgent, setFilterUrgent] = useState(false)

  const setAndPersistIntegration = (v: Integration) => {
    setIntegration(v)
    setSelectedTaskId(null)
    localStorage.setItem('citron-tasks-integration', v)
  }

  const setAndPersistView = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('citron-tasks-view', mode)
  }

  const persistSort = (k: SortKey) => {
    setSortKey(k)
    localStorage.setItem('citron-tasks-sort', k)
  }

  const baseTasks: TaskWithStatus[] = integration === 'jira' ? jira.kanbanTasks : internal.tasks
  const activeLoading = integration === 'jira' ? jira.loading : internal.loading
  const activeError = integration === 'jira' ? jira.error : null

  const displayTasks = useMemo(() => {
    let list = baseTasks.filter((t) => matchesSearch(t, searchQuery))
    if (hideDone) list = list.filter((t) => t.status !== 'done')
    if (filterUrgent) list = list.filter((t) => t.priority === 'urgent')
    return sortTasks(list, sortKey)
  }, [baseTasks, searchQuery, hideDone, filterUrgent, sortKey])

  const sections: TaskSection[] = useMemo(
    () =>
      STATUS_COLUMNS.map((s) => {
        const col = displayTasks.filter((t) => t.status === s.id)
        return { id: s.id, label: s.label, count: col.length, tasks: col as TaskItemData[] }
      }),
    [displayTasks],
  )

  const selectedTask: TaskItemData | null = useMemo(() => {
    if (!selectedTaskId) return null
    return baseTasks.find((t) => t.id === selectedTaskId) ?? null
  }, [selectedTaskId, baseTasks])

  const taskExtraFields: TaskDetailsField[] = useMemo(() => {
    const fields: TaskDetailsField[] = []
    if (!selectedTaskId) return fields
    if (integration === 'internal') {
      const raw = internal.raw.find((t) => t.id === selectedTaskId)
      if (raw?.labels?.length) fields.push({ label: 'Labels', value: raw.labels.join(', ') })
    }
    if (integration === 'jira') {
      const raw = jira.rawById(selectedTaskId)
      if (raw?.project?.name) fields.push({ label: 'Project', value: raw.project.name })
      if (raw?.issuetype) fields.push({ label: 'Issue type', value: raw.issuetype })
      if (raw?.labels?.length) fields.push({ label: 'Labels', value: raw.labels.join(', ') })
    }
    return fields
  }, [integration, selectedTaskId, internal.raw, jira])

  useEffect(() => {
    if (integration !== 'jira' || !selectedTaskId || !jira.config) {
      setAssigneeOptions([])
      return
    }
    const raw = jira.rawById(selectedTaskId)
    const pk = raw?.project?.key
    if (!pk) {
      setAssigneeOptions([])
      return
    }
    let cancelled = false
    fetchAssignableUsers(jira.config, pk)
      .then((users) => {
        if (!cancelled) setAssigneeOptions(users.map((u) => ({ value: u.id, label: u.displayName })))
      })
      .catch(() => {
        if (!cancelled) setAssigneeOptions([])
      })
    return () => {
      cancelled = true
    }
  }, [integration, selectedTaskId, jira.config, jira.rawById])

  const handleRefresh = useCallback(() => {
    setRefreshSpinning(true)
    const finish = () => setRefreshSpinning(false)
    if (integration === 'jira') {
      void jira.loadTasks().finally(finish)
    } else {
      internal.reload()
      window.setTimeout(finish, 450)
    }
  }, [integration, jira, internal])

  const applyBoardChange = useCallback(
    (updatedVisible: TaskWithStatus[]) => {
      const merged = mergeBoardAfterPartialUpdate(baseTasks, updatedVisible)
      if (integration === 'jira') void jira.handleKanbanChange(merged)
      else internal.applyKanbanChange(merged)
    },
    [baseTasks, integration, jira, internal],
  )

  const handleListTaskStatusChange = useCallback(
    (taskId: string, status: CuiTaskStatus) => {
      const next = displayTasks.map((t) => (t.id === taskId ? { ...t, status } : t))
      applyBoardChange(next)
    },
    [displayTasks, applyBoardChange],
  )

  const handleStatusChange = useCallback(
    (status: CuiTaskStatus) => {
      if (!selectedTaskId) return
      if (integration === 'internal') {
        internal.moveStatus(selectedTaskId, status)
        return
      }
      if (integration === 'jira' && jira.config) {
        void (async () => {
          try {
            const available = await getTransitions(jira.config!, selectedTaskId)
            const target = available.find((tr) => transitionToStatus(tr) === status)
            if (target) await jira.handleStatusChange(selectedTaskId, target)
            else addToast({ title: 'No transition available for this status', variant: 'warning' })
          } catch (e) {
            addToast({ title: e instanceof Error ? e.message : 'Status update failed', variant: 'error' })
          }
        })()
      }
    },
    [selectedTaskId, integration, internal, jira, addToast],
  )

  const handleSaveDetails = useCallback(
    async (payload: TaskDetailsSavePayload) => {
      if (!selectedTaskId) return
      setPanelSaving(true)
      try {
        if (integration === 'internal') {
          internal.update(selectedTaskId, {
            title: payload.title,
            description: payload.description,
            assignee: payload.assignee,
            priority: payload.priority,
            date: payload.dueDateIso ?? '',
          })
          addToast({ title: 'Task updated', variant: 'success' })
          setSelectedTaskId(null)
        } else if (integration === 'jira' && jira.config) {
          await jira.handleUpdateTask(selectedTaskId, {
            summary: payload.title,
            description: payload.description,
            assigneeId: payload.assigneeAccountId,
            priority: PRIORITY_TO_JIRA[payload.priority] ?? 'Medium',
            duedate: payload.dueDateIso,
          })
          await jira.loadTasks()
          addToast({ title: 'Issue updated', variant: 'success' })
          setSelectedTaskId(null)
        }
      } catch (e) {
        addToast({ title: e instanceof Error ? e.message : 'Save failed', variant: 'error' })
      } finally {
        setPanelSaving(false)
      }
    },
    [selectedTaskId, integration, internal, jira, addToast, setSelectedTaskId],
  )

  const handleSettingsClick = () => {
    if (onOpenSettings) onOpenSettings()
    else if (settingsHref) window.location.href = settingsHref
  }

  const exportFilteredJson = () => {
    const blob = new Blob([JSON.stringify(displayTasks, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `citron-tasks-${integration}-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast({ title: 'Exported filtered tasks', variant: 'success' })
    setFiltersOpen(false)
  }

  const headerProps = {
    integration,
    onIntegrationChange: setAndPersistIntegration,
    viewMode,
    onViewModeChange: setAndPersistView,
    loading: activeLoading,
    refreshSpinning,
    onRefresh: handleRefresh,
    onCreate: () => setCreateOpen(true),
    filtersOpen,
    onFiltersOpenChange: setFiltersOpen,
    searchQuery,
    onSearchChange: setSearchQuery,
    sortKey,
    onSortChange: persistSort,
    hideDone,
    onHideDoneChange: (v: boolean) => {
      setHideDone(v)
      localStorage.setItem('citron-tasks-hide-done', v ? '1' : '0')
    },
    filterUrgent,
    onFilterUrgentChange: setFilterUrgent,
    onExport: exportFilteredJson,
    filteredCount: displayTasks.length,
    totalCount: baseTasks.length,
  }

  const jiraIcon = (
    <Layers className="h-5 w-5 text-muted-foreground" aria-hidden />
  )

  if (integration === 'jira' && (!jira.isConnected || !jira.config)) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <Header {...headerProps} pendingCount={0} urgentCount={0} />
        <ConnectIntegrationLayout
          title="Jira"
          description="Connect Jira in Settings to load issues, move them across columns, and edit summaries and details from this module."
          icon={jiraIcon}
          onOpenSettings={handleSettingsClick}
        />
      </div>
    )
  }

  if (integration === 'slack') {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <Header {...headerProps} pendingCount={0} urgentCount={0} />
        <ConnectIntegrationLayout
          title="Slack"
          description="Connect Slack in Settings to sync tasks and notifications with the channels your team already uses."
          icon={<MessageSquare className="h-5 w-5 text-muted-foreground" aria-hidden />}
          onOpenSettings={handleSettingsClick}
        />
      </div>
    )
  }

  const pendingCount = baseTasks.filter((t) => t.status !== 'done').length
  const urgentCount = baseTasks.filter((t) => t.priority === 'urgent').length

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Header {...headerProps} pendingCount={pendingCount} urgentCount={urgentCount} />

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto hide-scrollbar px-6 py-6 sm:px-8">
          <div className="mx-auto w-full max-w-[1600px]">
            {activeLoading && baseTasks.length === 0 ? (
              viewMode === 'kanban' ? (
                <KanbanSkeleton />
              ) : (
                <ListSkeleton />
              )
            ) : activeError ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="mb-4 text-sm text-muted-foreground">{activeError}</p>
                <Button variant="secondary" onClick={handleRefresh}>
                  Retry
                </Button>
              </div>
            ) : viewMode === 'kanban' ? (
              <TaskKanbanBoard
                className="min-h-[min(520px,calc(100vh-200px))] w-full min-w-0"
                tasks={displayTasks}
                onTasksChange={applyBoardChange}
                onTaskOpen={(id) => setSelectedTaskId(id)}
              />
            ) : (
              <CuiTaskList
                sections={sections}
                statusDropdown
                onTaskStatusChange={handleListTaskStatusChange}
                onTaskToggle={(id) => {
                  if (integration === 'internal')
                    internal.moveStatus(
                      id,
                      internal.raw.find((t) => t.id === id)?.status === 'done' ? 'todo' : 'done',
                    )
                }}
                onTaskClick={(id) => setSelectedTaskId(id)}
              />
            )}
            {baseTasks.length === 0 && !activeLoading && !activeError && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-muted-foreground">No tasks found</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {integration === 'jira' ? 'Create one or check your JQL filter' : 'Create your first task'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskDetailsDialog
        task={selectedTask}
        open={Boolean(selectedTask)}
        onOpenChange={(o) => {
          if (!o) setSelectedTaskId(null)
        }}
        onStatusChange={handleStatusChange}
        onSaveDetails={handleSaveDetails}
        assigneeOptions={integration === 'jira' ? assigneeOptions : undefined}
        saving={panelSaving}
        extraFields={taskExtraFields}
      />

      {integration === 'internal' && (
        <InternalCreateWithSync
          open={createOpen}
          onOpenChange={setCreateOpen}
          internal={internal}
          addToast={addToast}
        />
      )}
      {integration === 'jira' && jira.config && (
        <TaskCreateModal
          config={jira.config}
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={() => {
            jira.loadTasks()
            addToast({ title: 'Task created', variant: 'success' })
          }}
          onError={(msg) => addToast({ title: msg, variant: 'error' })}
        />
      )}
    </div>
  )
}

function InternalCreateWithSync({
  open,
  onOpenChange,
  internal,
  addToast,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  internal: ReturnType<typeof useInternalTasks>
  addToast: ReturnType<typeof useToast>['addToast']
}) {
  const { config: jiraConfig } = useJiraConfig()

  const handleCreate = async (payload: InternalTaskCreatePayload) => {
    internal.create({
      title: payload.title,
      description: payload.description,
      priority: payload.priority,
      date: payload.date,
      assignee: payload.assignee,
    })
    addToast({ title: 'Task created', variant: 'success' })

    if (payload.syncWithIntegrations && jiraConfig) {
      try {
        const projects = await fetchJiraProjects(jiraConfig)
        const projectKey = projects[0]?.key
        if (projectKey) {
          await createJiraIssue(jiraConfig, {
            projectKey,
            summary: payload.title,
            description: payload.description,
            priority: PRIORITY_TO_JIRA[payload.priority ?? 'medium'],
            duedate: payload.date,
            issuetype: 'Task',
          })
          addToast({ title: 'Synced to Jira', variant: 'success' })
        }
      } catch {
        addToast({ title: 'Jira sync failed', variant: 'error' })
      }
    }
  }

  return (
    <InternalTaskCreateModal
      open={open}
      onOpenChange={onOpenChange}
      onCreate={handleCreate}
      hasActiveIntegrations={!!jiraConfig}
    />
  )
}

interface HeaderProps {
  integration: Integration
  onIntegrationChange: (v: Integration) => void
  viewMode: ViewMode
  onViewModeChange: (v: ViewMode) => void
  loading: boolean
  refreshSpinning: boolean
  onRefresh: () => void
  onCreate: () => void
  filtersOpen: boolean
  onFiltersOpenChange: (v: boolean) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  sortKey: SortKey
  onSortChange: (k: SortKey) => void
  hideDone: boolean
  onHideDoneChange: (v: boolean) => void
  filterUrgent: boolean
  onFilterUrgentChange: (v: boolean) => void
  onExport: () => void
  filteredCount: number
  totalCount: number
  pendingCount: number
  urgentCount: number
}

function Header({
  integration,
  onIntegrationChange,
  viewMode,
  onViewModeChange,
  loading,
  refreshSpinning,
  onRefresh,
  onCreate,
  filtersOpen,
  onFiltersOpenChange,
  searchQuery,
  onSearchChange,
  sortKey,
  onSortChange,
  hideDone,
  onHideDoneChange,
  filterUrgent,
  onFilterUrgentChange,
  onExport,
  filteredCount,
  totalCount,
  pendingCount,
  urgentCount,
}: HeaderProps) {
  const spinIcon = loading || refreshSpinning
  const filtersActive =
    Boolean(searchQuery.trim()) || hideDone || filterUrgent || sortKey !== 'priority'

  const sortOptions: SelectOption[] = [
    { value: 'priority', label: 'Priority' },
    { value: 'due', label: 'Due date' },
    { value: 'title', label: 'Title' },
  ]

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-8 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <CheckSquare className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Tasks</h1>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {pendingCount} pending · {urgentCount} urgent
            {integration === 'internal' || integration === 'jira' ? (
              <>
                {' '}
                · {filteredCount}/{totalCount} shown
              </>
            ) : null}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <IntegrationSwitch value={integration} onChange={onIntegrationChange} />

        <div className="flex items-center overflow-hidden rounded-lg border border-border">
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`p-2 transition-colors ${
              viewMode === 'list'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            }`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('kanban')}
            className={`p-2 transition-colors ${
              viewMode === 'kanban'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            }`}
            aria-label="Kanban view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>

        <Popover open={filtersOpen} onOpenChange={onFiltersOpenChange}>
          <Tooltip content="Search, sort, filters, export JSON" side="bottom">
            <span className="inline-flex">
              <PopoverTrigger
                type="button"
                aria-label="Filters"
                title="Filters"
                className={`!h-8 !w-8 !min-h-0 !p-0 ${filtersActive ? 'border-accent/40 bg-accent/10 text-accent' : ''}`}
              >
                <Filter className="h-4 w-4" />
              </PopoverTrigger>
            </span>
          </Tooltip>
          <PopoverContent className="right-0 left-auto min-w-[min(100vw-2rem,320px)] max-w-[min(100vw-2rem,360px)] space-y-4">
            <p className="text-xs font-medium text-muted-foreground">Filters</p>
            <SearchBar
              placeholder="Search tasks…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
            <Select
              aria-label="Sort by"
              value={sortKey}
              onChange={(e) => onSortChange(e.target.value as SortKey)}
              options={sortOptions}
            />
            <label className="flex items-center justify-between gap-3 text-sm text-foreground">
              <span>Hide completed</span>
              <Switch
                checked={hideDone}
                onCheckedChange={(c) => {
                  onHideDoneChange(c)
                }}
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm text-foreground">
              <span>Urgent only</span>
              <Switch checked={filterUrgent} onCheckedChange={onFilterUrgentChange} />
            </label>
            <Separator className="bg-border" />
            <Button type="button" variant="secondary" className="w-full" onClick={onExport}>
              Export filtered (JSON)
            </Button>
          </PopoverContent>
        </Popover>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh tasks"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all duration-150 hover:bg-secondary/50 hover:text-foreground active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 transition-transform ${spinIcon ? 'animate-spin' : ''}`} />
        </button>

        <button
          type="button"
          onClick={onCreate}
          aria-label="New task"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-all duration-150 hover:bg-accent/90 active:scale-95"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
