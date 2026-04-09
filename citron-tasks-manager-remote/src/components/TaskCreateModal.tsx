import { Button, Input, Label, Select } from '@citron-systems/citron-ui'
import * as Dialog from '@radix-ui/react-dialog'
import { useState, useEffect } from 'react'
import type { JiraConfig } from '@/lib/jira-types'
import { fetchJiraProjects, fetchAssignableUsers, createJiraIssue } from '@/lib/jira-api'

const priorityOptions = [
  { value: 'Highest', label: 'Urgent' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
  { value: 'Lowest', label: 'Low' },
]

interface TaskCreateModalProps {
  config: JiraConfig
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
  onError: (msg: string) => void
}

export function TaskCreateModal({ config, open, onOpenChange, onCreated, onError }: TaskCreateModalProps) {
  const [projects, setProjects] = useState<{ key: string; name: string }[]>([])
  const [projectKey, setProjectKey] = useState('')
  const [assignees, setAssignees] = useState<{ id: string; displayName: string }[]>([])
  const [assigneeId, setAssigneeId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [due, setDue] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (open && config) {
      setLoading(true)
      fetchJiraProjects(config)
        .then((list) => {
          setProjects(list)
          const first = list[0]
          if (first) setProjectKey(first.key)
        })
        .catch(() => onError('Failed to load projects'))
        .finally(() => setLoading(false))
    }
  }, [open, config])

  useEffect(() => {
    if (open && config && projectKey) {
      setLoadingUsers(true)
      setAssigneeId('')
      fetchAssignableUsers(config, projectKey)
        .then((list) => setAssignees(list))
        .catch(() => { setAssignees([]); onError('Failed to load team members') })
        .finally(() => setLoadingUsers(false))
    } else {
      setAssignees([])
      setAssigneeId('')
    }
  }, [open, config, projectKey])

  const handleCreate = async () => {
    if (!title.trim()) return
    setCreating(true)
    try {
      await createJiraIssue(config, {
        projectKey,
        summary: title.trim(),
        description: description.trim() || undefined,
        assigneeId: assigneeId || undefined,
        priority: priority || undefined,
        duedate: due || undefined,
        issuetype: 'Task',
      })
      setTitle('')
      setDescription('')
      setAssigneeId('')
      setDue('')
      onCreated()
      onOpenChange(false)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Failed to create')
    } finally {
      setCreating(false)
    }
  }

  const projectOptions = projects.map((p) => ({ value: p.key, label: `${p.name} (${p.key})` }))
  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...assignees.map((u) => ({ value: u.id, label: u.displayName })),
  ]

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-6 glass rounded-xl border border-border shadow-xl z-50 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-sm font-semibold text-foreground mb-4">New Task</Dialog.Title>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px]">Project</Label>
              <Select
                options={projectOptions}
                value={projectKey}
                onChange={(e) => setProjectKey(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Assignee</Label>
              <Select
                options={assigneeOptions}
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={loadingUsers}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
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
            <div className="flex gap-4">
              <div className="flex-1 space-y-1.5">
                <Label className="text-[10px]">Priority</Label>
                <Select options={priorityOptions} value={priority} onChange={(e) => setPriority(e.target.value)} />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label className="text-[10px]">Due date</Label>
                <Input
                  type="date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-6 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => onOpenChange(false)} className="flex-1 text-xs">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || !title.trim()} className="flex-1 text-xs">
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
