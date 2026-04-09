import { IntegrationPlaceholder } from '@citron-systems/citron-ui'
import { MessageSquare } from 'lucide-react'

export function SlackPlaceholder() {
  return (
    <div className="h-full flex items-center justify-center px-8">
      <IntegrationPlaceholder
        name="Slack"
        description="Connect your Slack workspace to sync tasks and receive notifications directly in your channels."
        icon={<MessageSquare className="w-6 h-6" />}
        connected={false}
        onConnect={() => {}}
      />
    </div>
  )
}
