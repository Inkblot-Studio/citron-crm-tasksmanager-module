import {
  Button,
  Skeleton,
  TaskKanbanBoard,
  TaskList as CuiTaskList,
  TaskDetailsPanel,
  ModuleAssistantPanel,
} from '@citron-systems/citron-ui'
import type { TaskWithStatus, TaskSection, TaskItemData } from '@citron-systems/citron-ui'
import {
  CheckSquare,
  Plus,
  RefreshCw,
  Settings,
  List,
  LayoutGrid,
} from 'lucide-react'
import { useState, useCallback, useMemo } from 'react'
import { useToast } from '@/lib/ToastContext'
import { useJiraTasks } from '@/hooks/useJiraTasks'
import { useInternalTasks } from '@/lib/InternalTasksContext'
import { IntegrationSwitch, type Integration } from '@/components/IntegrationSwitch'
import { SlackPlaceholder } from '@/components/SlackPlaceholder'
import { InternalTaskCreateModal } from '@/components/InternalTaskCreateModal'
import { TaskCreateModal } from '@/components/TaskCreateModal'

type ViewMode = 'list' | 'kanban'

export interface TasksManagerPageProps {
  settingsHref?: string
  onOpenSettings?: () => void
}

const STATUS_SECTIONS: { id: 'todo' | 'in_progress' | 'done'; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
]

function ListSkeleton() {
  return (
    <div className="space-y-6">
      {STATUS_SECTIONS.map((g) => (
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
      {STATUS_SECTIONS.map((g) => (
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
    return STATUS_SECTIONS.map((s) => {
      const filtered = activeTasks.filter((t) => t.status === s.id)
      return {
        id: s.id,
        label: s.label,
        count: filtered.length,
        tasks: filtered as TaskItemData[],
      }
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

  const handleCreate = useCallback(() => {
    setCreateOpen(true)
  }, [])

  const handleKanbanChange = useCallback(
    (updated: TaskWithStatus[]) => {
      if (integration === 'jira') jira.handleKanbanChange(updated)
      else internal.applyKanbanChange(updated)
    },
    [integration, jira, internal],
  )

  const handleStatusChange = useCallback(
    (status: 'todo' | 'in_progress' | 'done') => {
      if (!selectedTaskId) return
      if (integration === 'internal') {
        internal.moveStatus(selectedTaskId, status)
      }
    },
    [selectedTaskId, integration, internal],
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
          onCreate={handleCreate}
          pendingCount={0}
          urgentCount={0}
        />
        <div className="flex-1 flex flex-col items-center justify-center px-8">
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
          onCreate={handleCreate}
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
        onCreate={handleCreate}
        pendingCount={pendingCount}
        urgentCount={urgentCount}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Main content */}
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
              <TaskKanbanBoard tasks={activeTasks} onTasksChange={handleKanbanChange} />
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

        {/* Detail panel */}
        <TaskDetailsPanel
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => { if (!open) setSelectedTaskId(null) }}
          onStatusChange={handleStatusChange}
          className="w-[420px] shrink-0 border-l border-border"
        />

        {/* Assistant panel */}
        <div className="w-[340px] shrink-0 border-l border-border">
          <ModuleAssistantPanel
            moduleId="tasks-manager"
            moduleLabel="Tasks Manager"
            agentLabel="Task Agent"
            placeholder="Ask about your tasks..."
          />
        </div>
      </div>

      {/* Create modals */}
      {integration === 'internal' && (
        <InternalTaskCreateModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreate={(payload) => {
            internal.create(payload)
            addToast({ title: 'Task created', variant: 'success' })
          }}
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

/* ─── Header ──────────────────────────────────────────────────── */

interface HeaderProps {
  integration: Integration
  onIntegrationChange: (v: Integration) => void
  viewMode: ViewMode
  onViewModeChange: (v: ViewMode) => void
  loading: boolean
  onRefresh: () => void
  onCreate: () => void
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
  pendingCount,
  urgentCount,
}: HeaderProps) {
  return (
    <header className="px-8 py-4 border-b border-border flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-citrus-green/10 flex items-center justify-center">
          <CheckSquare className="w-4 h-4 text-citrus-green" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Tasks</h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {pendingCount} pending · {urgentCount} urgent
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <IntegrationSwitch value={integration} onChange={onIntegrationChange} />

        <div className="flex items-center rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('kanban')}
            className={`p-1.5 transition-colors ${viewMode === 'kanban' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
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
          onClick={onCreate}
          aria-label="New task"
          className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-citrus-green text-white hover:bg-citrus-green/90 transition-all duration-150 active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
