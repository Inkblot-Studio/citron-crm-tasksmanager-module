import {
  Button,
  Skeleton,
  TaskList as CuiTaskList,
  TaskDetailsPanel,
  AssistantPanel,
  TaskKanbanColumn,
  TaskKanbanCard,
} from '@citron-systems/citron-ui'
import type {
  TaskWithStatus,
  TaskSection,
  TaskItemData,
  AssistantMessage,
  TaskStatus as CuiTaskStatus,
} from '@citron-systems/citron-ui'
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd'
import {
  CheckSquare,
  Plus,
  RefreshCw,
  Settings,
  List,
  LayoutGrid,
  Bot,
} from 'lucide-react'
import { useState, useCallback, useMemo } from 'react'
import { useToast } from '@/lib/ToastContext'
import { useJiraTasks } from '@/hooks/useJiraTasks'
import { useInternalTasks } from '@/lib/InternalTasksContext'
import { useJiraConfig } from '@/lib/JiraContext'
import { createJiraIssue, fetchJiraProjects } from '@/lib/jira-api'
import { IntegrationSwitch, type Integration } from '@/components/IntegrationSwitch'
import { SlackPlaceholder } from '@/components/SlackPlaceholder'
import { InternalTaskCreateModal, type InternalTaskCreatePayload } from '@/components/InternalTaskCreateModal'
import { TaskCreateModal } from '@/components/TaskCreateModal'

const PRIORITY_TO_JIRA: Record<string, string> = {
  urgent: 'Highest',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

type ViewMode = 'list' | 'kanban'

export interface TasksManagerPageProps {
  settingsHref?: string
  onOpenSettings?: () => void
}

const STATUS_COLUMNS: { id: CuiTaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
]

function ListSkeleton() {
  return (
    <div className="space-y-6">
      {STATUS_COLUMNS.map((g) => (
        <div key={g.id}>
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
                </div>
                <Skeleton className="h-4 w-12 rounded-full shrink-0" />
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
      {STATUS_COLUMNS.map((g) => (
        <div key={g.id} className="flex flex-col">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Skeleton className="w-3.5 h-3.5 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="space-y-2 flex-1">
            {[1, 2, 3].map((j) => (
              <div key={j} className="glass rounded-xl p-3 space-y-2">
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

export default function TasksManagerPage({ settingsHref = '/settings', onOpenSettings }: TasksManagerPageProps) {
  const { addToast } = useToast()
  const jira = useJiraTasks()
  const internal = useInternalTasks()

  const [integration, setIntegration] = useState<Integration>(() => {
    return (localStorage.getItem('citron-tasks-integration') as Integration) || 'internal'
  })
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('citron-tasks-view') as ViewMode) || 'list'
  })
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([])

  const setAndPersistIntegration = (v: Integration) => {
    setIntegration(v)
    setSelectedTaskId(null)
    localStorage.setItem('citron-tasks-integration', v)
  }

  const setAndPersistView = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem('citron-tasks-view', mode)
  }

  const activeTasks: TaskWithStatus[] = integration === 'jira' ? jira.kanbanTasks : internal.tasks
  const activeLoading = integration === 'jira' ? jira.loading : internal.loading
  const activeError = integration === 'jira' ? jira.error : null

  const sections: TaskSection[] = useMemo(() => {
    return STATUS_COLUMNS.map((s) => {
      const filtered = activeTasks.filter((t) => t.status === s.id)
      return { id: s.id, label: s.label, count: filtered.length, tasks: filtered as TaskItemData[] }
    })
  }, [activeTasks])

  const selectedTask: TaskItemData | null = useMemo(() => {
    if (!selectedTaskId) return null
    return activeTasks.find((t) => t.id === selectedTaskId) ?? null
  }, [selectedTaskId, activeTasks])

  const handleRefresh = useCallback(() => {
    if (integration === 'jira') jira.loadTasks()
    else internal.reload()
  }, [integration, jira, internal])

  const handleKanbanDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return
      const taskId = result.draggableId
      const newStatus = result.destination.droppableId as CuiTaskStatus
      const task = activeTasks.find((t) => t.id === taskId)
      if (!task || task.status === newStatus) return

      const updated = activeTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      if (integration === 'jira') jira.handleKanbanChange(updated)
      else internal.applyKanbanChange(updated)
    },
    [activeTasks, integration, jira, internal],
  )

  const handleStatusChange = useCallback(
    (status: CuiTaskStatus) => {
      if (!selectedTaskId) return
      if (integration === 'internal') internal.moveStatus(selectedTaskId, status)
    },
    [selectedTaskId, integration, internal],
  )

  const handleAssistantSend = useCallback(
    (payload: { text: string; files: File[] }) => {
      const userMsg: AssistantMessage = { id: crypto.randomUUID(), role: 'user', content: payload.text }
      setAssistantMessages((prev) => [...prev, userMsg])
      setTimeout(() => {
        const reply: AssistantMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `You have ${activeTasks.length} tasks. ${activeTasks.filter((t) => t.priority === 'urgent').length} are urgent.`,
        }
        setAssistantMessages((prev) => [...prev, reply])
      }, 600)
    },
    [activeTasks],
  )

  const handleSettingsClick = () => {
    if (onOpenSettings) onOpenSettings()
    else if (settingsHref) window.location.href = settingsHref
  }

  if (integration === 'jira' && (!jira.isConnected || !jira.config)) {
    return (
      <div className="h-full flex flex-col">
        <Header
          integration={integration}
          onIntegrationChange={setAndPersistIntegration}
          viewMode={viewMode}
          onViewModeChange={setAndPersistView}
          loading={false}
          onRefresh={handleRefresh}
          onCreate={() => setCreateOpen(true)}
          onToggleAssistant={() => setAssistantOpen((v) => !v)}
          pendingCount={0}
          urgentCount={0}
        />
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
            <CheckSquare className="w-8 h-8 text-accent" />
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
      </div>
    )
  }

  if (integration === 'slack') {
    return (
      <div className="h-full flex flex-col">
        <Header
          integration={integration}
          onIntegrationChange={setAndPersistIntegration}
          viewMode={viewMode}
          onViewModeChange={setAndPersistView}
          loading={false}
          onRefresh={handleRefresh}
          onCreate={() => setCreateOpen(true)}
          onToggleAssistant={() => setAssistantOpen((v) => !v)}
          pendingCount={0}
          urgentCount={0}
        />
        <SlackPlaceholder />
      </div>
    )
  }

  const pendingCount = activeTasks.filter((t) => t.status !== 'done').length
  const urgentCount = activeTasks.filter((t) => t.priority === 'urgent').length

  return (
    <div className="h-full flex flex-col">
      <Header
        integration={integration}
        onIntegrationChange={setAndPersistIntegration}
        viewMode={viewMode}
        onViewModeChange={setAndPersistView}
        loading={activeLoading}
        onRefresh={handleRefresh}
        onCreate={() => setCreateOpen(true)}
        onToggleAssistant={() => setAssistantOpen((v) => !v)}
        pendingCount={pendingCount}
        urgentCount={urgentCount}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto hide-scrollbar px-8 py-6">
          <div className="max-w-4xl mx-auto">
            {activeLoading && activeTasks.length === 0 ? (
              viewMode === 'kanban' ? <KanbanSkeleton /> : <ListSkeleton />
            ) : activeError ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-muted-foreground mb-4">{activeError}</p>
                <Button variant="secondary" onClick={handleRefresh}>Retry</Button>
              </div>
            ) : viewMode === 'kanban' ? (
              <DragDropContext onDragEnd={handleKanbanDragEnd}>
                <div className="grid grid-cols-3 gap-4 h-full">
                  {STATUS_COLUMNS.map((col) => {
                    const colTasks = activeTasks.filter((t) => t.status === col.id)
                    return (
                      <Droppable key={col.id} droppableId={col.id}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col min-h-0">
                            <TaskKanbanColumn columnId={col.id} title={col.label} count={colTasks.length}>
                              {colTasks.map((task, idx) => (
                                <div key={task.id} onClick={() => setSelectedTaskId(task.id)} className="cursor-pointer">
                                  <TaskKanbanCard task={task} index={idx} />
                                </div>
                              ))}
                              {provided.placeholder}
                            </TaskKanbanColumn>
                          </div>
                        )}
                      </Droppable>
                    )
                  })}
                </div>
              </DragDropContext>
            ) : (
              <CuiTaskList
                sections={sections}
                onTaskToggle={(id) => {
                  if (integration === 'internal') internal.moveStatus(id, internal.raw.find((t) => t.id === id)?.status === 'done' ? 'todo' : 'done')
                }}
                onTaskClick={(id) => setSelectedTaskId(id)}
              />
            )}
            {activeTasks.length === 0 && !activeLoading && !activeError && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-muted-foreground">No tasks found</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {integration === 'jira' ? 'Create one or check your JQL filter' : 'Create your first task'}
                </p>
              </div>
            )}
          </div>
        </div>

        <TaskDetailsPanel
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => { if (!open) setSelectedTaskId(null) }}
          onStatusChange={handleStatusChange}
          className="w-[420px] shrink-0 border-l border-border"
        />
      </div>

      <AssistantPanel
        open={assistantOpen}
        onOpenChange={setAssistantOpen}
        title="Task Agent"
        subtitle="Ask anything about your tasks"
        messages={assistantMessages}
        onSend={handleAssistantSend}
        placeholder="Ask about your tasks..."
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
          onCreated={() => { jira.loadTasks(); addToast({ title: 'Task created', variant: 'success' }) }}
          onError={(msg) => addToast({ title: msg, variant: 'error' })}
        />
      )}
    </div>
  )
}

/* ─── Sync-aware internal create ──────────────────────────────── */

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
  const hasIntegrations = !!jiraConfig

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
      hasActiveIntegrations={hasIntegrations}
    />
  )
}

/* ─── Header ──────────────────────────────────────────────────── */

interface HeaderProps {
  integration: Integration
  onIntegrationChange: (v: Integration) => void
  viewMode: ViewMode
  onViewModeChange: (v: ViewMode) => void
  loading: boolean
  onRefresh: () => void
  onCreate: () => void
  onToggleAssistant: () => void
  pendingCount: number
  urgentCount: number
}

function Header({
  integration,
  onIntegrationChange,
  viewMode,
  onViewModeChange,
  loading,
  onRefresh,
  onCreate,
  onToggleAssistant,
  pendingCount,
  urgentCount,
}: HeaderProps) {
  return (
    <header className="px-8 py-4 border-b border-border flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <CheckSquare className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Tasks</h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {pendingCount} pending · {urgentCount} urgent
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <IntegrationSwitch value={integration} onChange={onIntegrationChange} />

        <div className="flex items-center rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('kanban')}
            className={`p-2 transition-colors ${viewMode === 'kanban' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            aria-label="Kanban view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh tasks"
          className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-150 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>

        <button
          onClick={onToggleAssistant}
          aria-label="Toggle assistant"
          className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-150 active:scale-95"
        >
          <Bot className="w-4 h-4" />
        </button>

        <button
          onClick={onCreate}
          aria-label="New task"
          className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-150 active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
