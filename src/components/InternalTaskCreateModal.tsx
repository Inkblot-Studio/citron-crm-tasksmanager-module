import { Button, Input, Label, Select } from '@citron-systems/citron-ui'
import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import type { TaskPriority } from '@citron-systems/citron-ui'

const priorityOptions = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

interface InternalTaskCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (payload: { title: string; description?: string; priority?: TaskPriority; date?: string; assignee?: string }) => void
}

export function InternalTaskCreateModal({ open, onOpenChange, onCreate }: InternalTaskCreateModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [due, setDue] = useState('')
  const [assignee, setAssignee] = useState('')

  const handleCreate = () => {
    if (!title.trim()) return
    onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      date: due || undefined,
      assignee: assignee.trim() || undefined,
    })
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDue('')
    setAssignee('')
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-6 glass rounded-xl border border-border shadow-xl z-50 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-sm font-semibold text-foreground mb-4">New Task</Dialog.Title>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px]">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Assignee</Label>
              <Input value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Name" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px]">Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description..."
                rows={3}
                className="w-full bg-surface-1 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1 space-y-1.5">
                <Label className="text-[10px]">Priority</Label>
                <Select options={priorityOptions} value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label className="text-[10px]">Due date</Label>
                <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-6 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => onOpenChange(false)} className="flex-1 text-xs">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!title.trim()} className="flex-1 text-xs">
              Create
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
