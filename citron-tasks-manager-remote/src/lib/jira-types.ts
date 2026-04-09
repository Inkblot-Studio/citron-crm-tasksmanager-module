export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low'

export interface JiraConfig {
  domain: string
  email: string
  apiToken: string
}

export interface TaskAssignee {
  id: string
  displayName: string
}

export interface TaskProject {
  key: string
  name: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  assignee: TaskAssignee | null
  due: string | null
  priority: TaskPriority
  status: TaskStatus
  statusId: string
  project: TaskProject
  labels: string[]
  issuetype: string
  createdAt?: string
  updatedAt?: string
}

export const JIRA_CONFIG_KEY = 'citron-jira-config'

export const PRIORITY_MAP: Record<string, TaskPriority> = {
  Highest: 'urgent',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
  Lowest: 'low',
}

export const STATUS_CATEGORY_MAP: Record<string, TaskStatus> = {
  'new': 'todo',
  'indeterminate': 'in_progress',
  'done': 'done',
}
