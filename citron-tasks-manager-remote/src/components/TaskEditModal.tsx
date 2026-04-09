import { Button, Input, Label, Select } from '@citron-systems/citron-ui'
import * as Dialog from '@radix-ui/react-dialog'
import { useState, useEffect } from 'react'
import type { Task, TaskPriority } from '@/lib/jira-types'
import type { JiraConfig } from '@/lib/jira-types'
import { fetchAssignableUsers } from '@/lib/jira-api'

const priorityConfig = {
  urgent: { label: 'Urgent', jira: 'Highest' },
  high: { label: 'High', jira: 'High' },
  medium: { label: 'Medium', jira: 'Medium' },
  low: { label: 'Low', jira: 'Low' },
}

const priorityOptions = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

interface TaskEditModalProps {
  task: Task
  config: JiraConfig
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
  onError: (msg: string) => void
  updateJiraIssue: (config: JiraConfig, key: string, payload: Record<string, unknown>) => Promise<void>
}

export function TaskEditModal({ task, config, open, onOpenChange, onSave, onError, updateJiraIssue }: TaskEditModalProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [assigneeId, setAssigneeId] = useState(task.assignee?.id ?? '')
  const [assignees, setAssignees] = useState<{ id: string; displayName: string }[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [due, setDue] = useState(task.due ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTitle(task.title)
    setDescription(task.description ?? '')
    setPriority(task.priority)
    setAssigneeId(task.assignee?.id ?? '')
    setDue(task.due ?? '')
  }, [task])

  useEffect(() => {
    if (open && config && task.project?.key) {
      setLoadingUsers(true)
      fetchAssignableUsers(config, task.project.key)
        .then((list) => setAssignees(list))
        .catch(() => setAssignees([]))
        .finally(() => setLoadingUsers(false))
    } else {
      setAssignees([])
    }
  }, [open, config, task.project?.key])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateJiraIssue(config, task.id, {
        summary: title,
        description: description || undefined,
        priority: priorityConfig[priority].jira,
        assigneeId: assigneeId || null,
        duedate: due || null,
      })
      onSave()
      onOpenChange(false)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-6 glass rounded-xl border border-border shadow-xl z-50 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-sm font-semibold text-foreground mb-4">Edit Task</Dialog.Title>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px]">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Assignee</Label>
              <Select
                options={[
                  { value: '', label: 'Unassigned' },
                  ...assignees.map((u) => ({ value: u.id, label: u.displayName })),
                ]}
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={loadingUsers}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description..."
                rows={4}
                className="w-full bg-surface-1 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Priority</Label>
              <Select
                options={priorityOptions}
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Due date</Label>
              <Input
                type="date"
                value={due ? due.split('T')[0] : ''}
                onChange={(e) => setDue(e.target.value || '')}
                placeholder="YYYY-MM-DD"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => onOpenChange(false)} className="flex-1 text-xs">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 text-xs">
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
