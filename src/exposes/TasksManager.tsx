import '@citron-systems/citron-ds/css'
import '../index.css'

import { Toaster, ThemeProvider } from '@citron-systems/citron-ui'
import { ToastProvider, useToast } from '@/lib/ToastContext'
import { JiraProvider } from '@/lib/JiraContext'
import type { JiraConfig } from '@/lib/jira-types'
import TasksManagerPage from '@/pages/TasksManagerPage'
import type { TasksManagerPageProps } from '@/pages/TasksManagerPage'

export interface TasksManagerProps extends TasksManagerPageProps {
  /** Pre-loaded Jira config; skips localStorage lookup when provided. */
  initialJiraConfig?: JiraConfig | null
}

function InnerToaster() {
  const { toasts, dismissToast } = useToast()
  return (
    <Toaster
      toasts={toasts}
      position="bottom-right"
      onDismiss={dismissToast}
      className="fixed bottom-4 right-4 z-[100]"
    />
  )
}

export default function TasksManager({ initialJiraConfig, ...pageProps }: TasksManagerProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <JiraProvider initialConfig={initialJiraConfig}>
          <TasksManagerPage {...pageProps} />
          <InnerToaster />
        </JiraProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
