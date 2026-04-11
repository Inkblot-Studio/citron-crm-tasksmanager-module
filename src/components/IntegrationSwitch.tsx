import { CheckSquare, Cloudy, MessageSquare } from 'lucide-react'

export type Integration = 'internal' | 'jira' | 'slack'

const items: { key: Integration; label: string; icon: typeof CheckSquare }[] = [
  { key: 'internal', label: 'Internal tasks', icon: CheckSquare },
  { key: 'jira', label: 'Jira', icon: Cloudy },
  { key: 'slack', label: 'Slack', icon: MessageSquare },
]

interface IntegrationSwitchProps {
  value: Integration
  onChange: (v: Integration) => void
}

export function IntegrationSwitch({ value, onChange }: IntegrationSwitchProps) {
  return (
    <div className="flex items-center rounded-lg border border-border overflow-hidden">
      {items.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          aria-label={label}
          title={label}
          onClick={() => onChange(key)}
          className={`inline-flex h-8 w-8 items-center justify-center transition-all duration-150 ${
            value === key
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
        </button>
      ))}
    </div>
  )
}
