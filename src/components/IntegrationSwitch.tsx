import { CheckSquare, Cloudy, MessageSquare } from 'lucide-react'

export type Integration = 'internal' | 'jira' | 'slack'

const items: { key: Integration; label: string; icon: typeof CheckSquare }[] = [
  { key: 'internal', label: 'Internal', icon: CheckSquare },
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
          onClick={() => onChange(key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium transition-all duration-150 ${
            value === key
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
    </div>
  )
}
