import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import { ReactNode, TextareaHTMLAttributes, ButtonHTMLAttributes, Component, InputHTMLAttributes, ComponentType, HTMLAttributes, RefObject, FormHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, ChangeEvent, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';
import { FallbackProps } from 'react-error-boundary';
import { DropResult } from '@hello-pangea/dnd';
import { NavLinkProps as NavLinkProps$1 } from 'react-router-dom';

interface PendingAttachment {
    file: File;
    kind: 'image' | 'file';
    previewUrl?: string;
}

interface AssistantMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    renderedContent?: ReactNode;
}
interface GlobalAssistantChatProps {
    messages?: AssistantMessage[];
    onSend?: (payload: {
        text: string;
        files: File[];
    }) => void;
    isProcessing?: boolean;
    placeholder?: string;
    emptyStateMessage?: string;
    className?: string;
}
declare function GlobalAssistantChat({ messages, onSend, isProcessing, placeholder, emptyStateMessage, className, }: GlobalAssistantChatProps): react_jsx_runtime.JSX.Element;

interface AssistantPanelProps extends Omit<GlobalAssistantChatProps, 'className'> {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    title?: string;
    subtitle?: string;
    className?: string;
}
/**
 * Inline assistant panel that pushes layout content to the left on desktop.
 * On screens < 768px it falls back to a fixed overlay.
 *
 * Must be placed as a direct flex child alongside the main content area
 * (e.g. inside AppLayout's <main> or a custom flex wrapper).
 */
declare function AssistantPanel({ open, onOpenChange, title, subtitle, className, ...chatProps }: AssistantPanelProps): react_jsx_runtime.JSX.Element;

interface CenteredAssistantChatProps extends GlobalAssistantChatProps {
}
declare function CenteredAssistantChat({ className, ...props }: CenteredAssistantChatProps): react_jsx_runtime.JSX.Element;

interface CenteredAIChatAgent {
    id: string;
    label: string;
    description?: string;
}
interface CenteredAIChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    renderedContent?: ReactNode;
}
interface CenteredAIChatComposePayload {
    text: string;
    files: File[];
}
interface CenteredAIChatProps {
    messages?: CenteredAIChatMessage[];
    /**
     * Igual que `GlobalAssistantChat` / `CenteredAssistantChat`: texto y archivos en un solo callback.
     */
    onSend?: (payload: {
        text: string;
        files: File[];
    }) => void;
    /**
     * Si está definido, se usa al enviar en lugar de `onSend` (misma forma de payload).
     */
    onComposeSubmit?: (payload: CenteredAIChatComposePayload) => void;
    isProcessing?: boolean;
    placeholder?: string;
    agents?: CenteredAIChatAgent[];
    activeAgent?: string;
    onAgentChange?: (agentId: string) => void;
    /**
     * Solo si no hay `onSend` ni `onComposeSubmit`: se llama con los archivos al enviar (el texto no tiene destino).
     * @deprecated Prefer `onSend` con `{ text, files }`.
     */
    onFilesAttach?: (files: File[]) => void;
    onVoiceClick?: () => void;
    emptyStateMessage?: string;
    className?: string;
}
declare function CenteredAIChat({ messages, onSend, onComposeSubmit, isProcessing, placeholder, agents, activeAgent, onAgentChange, onFilesAttach, onVoiceClick, emptyStateMessage, className, }: CenteredAIChatProps): react_jsx_runtime.JSX.Element;

interface ActionButtonItem {
    id: string;
    label: string;
    variant: 'primary' | 'secondary';
    icon?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}
interface ActionButtonsProps {
    buttons: ActionButtonItem[];
    className?: string;
}
declare function ActionButtons({ buttons, className }: ActionButtonsProps): react_jsx_runtime.JSX.Element;
declare function EmailComposeActionButtons({ onSendNow, onSchedule, onSaveDraft, className, }: {
    onSendNow?: () => void;
    onSchedule?: () => void;
    onSaveDraft?: () => void;
    className?: string;
}): react_jsx_runtime.JSX.Element;

interface AIComposeInputProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
    label?: string;
    loading?: boolean;
    onWriteWithAI?: () => void | Promise<void>;
    className?: string;
}
declare const AIComposeInput: react.ForwardRefExoticComponent<AIComposeInputProps & react.RefAttributes<HTMLTextAreaElement>>;

type ButtonVariant = 'primary' | 'secondary';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}
declare const Button: react.ForwardRefExoticComponent<ButtonProps & react.RefAttributes<HTMLButtonElement>>;

type CampaignStatus = 'sent' | 'active' | 'draft' | 'scheduled';
interface CampaignTableRow {
    id: string;
    campaignName: string;
    recipients: string;
    status: CampaignStatus;
    statusSubtext?: string;
    opens: string;
    clicks: string;
    date: string;
}
interface CampaignTableProps {
    columns: {
        key: string;
        label: string;
    }[];
    rows: CampaignTableRow[];
    sortKey?: string;
    sortDirection?: 'asc' | 'desc';
    defaultSortKey?: string;
    defaultSortDirection?: 'asc' | 'desc';
    onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
    sortableColumns?: string[];
    emptyTitle?: string;
    emptyDescription?: string;
    className?: string;
}
declare function CampaignTable({ columns, rows, sortKey, sortDirection, defaultSortKey, defaultSortDirection, onSortChange, sortableColumns, emptyTitle, emptyDescription, className, }: CampaignTableProps): react_jsx_runtime.JSX.Element;

interface EmailTemplateItem {
    id: string;
    category: string;
    title: string;
    uses: string;
}
interface EmailTemplatesSectionProps {
    title?: string;
    onGenerateWithAI?: () => void;
    templates: EmailTemplateItem[];
    onTemplateClick?: (template: EmailTemplateItem) => void;
    className?: string;
}
declare function EmailTemplatesSection({ title, onGenerateWithAI, templates, onTemplateClick, className, }: EmailTemplatesSectionProps): react_jsx_runtime.JSX.Element;

type EntityType = 'Person' | 'Organization' | 'Deal';
interface Edge {
    type: string;
    target?: string;
}
interface EntityCardStat {
    label: string;
    value: string;
    icon?: LucideIcon;
}
interface EntityCardProps {
    name: string;
    entityType: EntityType;
    /** Subtitle text displayed below the name (e.g. "Enterprise · Series C · SaaS"). */
    subtitle?: string;
    /** Status badge label (e.g. "Active"). Only shown in company variant. */
    statusLabel?: string;
    metadata?: Record<string, string>;
    edges?: Edge[];
    /** Stats grid displayed under the header. Activates the company card layout. */
    stats?: EntityCardStat[];
    /** Connections summary text (e.g. "Connected to Jane Smith, TechVentures +3 more"). */
    connections?: string;
    className?: string;
}
declare function EntityCard({ name, entityType, subtitle, statusLabel, metadata, edges, stats, connections, className, }: EntityCardProps): react_jsx_runtime.JSX.Element;

interface EntityCommandCardStat {
    label: string;
    value: string | number;
}
interface EntityCommandCardProps {
    title: string;
    insights?: ReactNode;
    stats?: EntityCommandCardStat[];
    commandValue?: string;
    onCommandChange?: (value: string) => void;
    onCommandSubmit?: () => void;
    className?: string;
}
declare function EntityCommandCard({ title, insights, stats, commandValue, onCommandChange, onCommandSubmit, className, }: EntityCommandCardProps): react_jsx_runtime.JSX.Element;

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    className?: string;
}
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}
declare class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): ErrorBoundaryState;
    render(): string | number | bigint | boolean | react_jsx_runtime.JSX.Element | Iterable<ReactNode> | Promise<string | number | bigint | boolean | react.ReactPortal | react.ReactElement<unknown, string | react.JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined;
}

interface CitronEvent {
    id?: string;
    actor: string;
    subject: string;
    event_type: string;
    timestamp: string;
    confidence_score: number;
    metadata?: Record<string, unknown>;
}
interface EventRowProps {
    event: CitronEvent;
    className?: string;
}
declare function EventRow({ event, className }: EventRowProps): react_jsx_runtime.JSX.Element;

type EventStreamStatus = 'success' | 'warning' | 'error' | 'info';
interface EventStreamEvent {
    id: string;
    icon?: ReactNode;
    title: string;
    timestamp: string;
    status?: EventStreamStatus;
}
interface EventStreamFeedProps {
    events: EventStreamEvent[];
    className?: string;
}
declare function EventStreamFeed({ events, className }: EventStreamFeedProps): react_jsx_runtime.JSX.Element;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}
declare const Input: react.ForwardRefExoticComponent<InputProps & react.RefAttributes<HTMLInputElement>>;

interface IntelligenceScoreCardProps {
    label: string;
    value: number;
    subtext?: string;
    trend?: 'up' | 'down';
    className?: string;
}
declare function IntelligenceScoreCard({ label, value, subtext, trend, className, }: IntelligenceScoreCardProps): react_jsx_runtime.JSX.Element;

type MetricComparisonVariant = 'default' | 'success' | 'warning' | 'error';
interface MetricComparisonItem {
    label: string;
    value?: string | number;
    variant?: MetricComparisonVariant;
}
interface MetricComparisonListProps {
    items: MetricComparisonItem[];
    className?: string;
}
declare function MetricComparisonList({ items, className }: MetricComparisonListProps): react_jsx_runtime.JSX.Element;

interface ModuleContainerProps {
    children: ReactNode;
    loading?: boolean;
    title?: string;
    className?: string;
    onRetry?: () => void;
}
declare function ModuleContainer({ children, loading, title, className, onRetry, }: ModuleContainerProps): react_jsx_runtime.JSX.Element;

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}
declare function PageHeader({ title, subtitle, icon, action, className, }: PageHeaderProps): react_jsx_runtime.JSX.Element;
interface PageHeaderActionButtonProps {
    label: string;
    onClick?: () => void;
    icon?: ReactNode;
    className?: string;
}
declare function PageHeaderActionButton({ label, onClick, icon, className, }: PageHeaderActionButtonProps): react_jsx_runtime.JSX.Element;

interface ModuleErrorBoundaryProps {
    children: ReactNode;
    onRetry?: () => void;
    className?: string;
}
interface ModuleErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}
declare class ModuleErrorBoundary extends Component<ModuleErrorBoundaryProps, ModuleErrorBoundaryState> {
    constructor(props: ModuleErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): ModuleErrorBoundaryState;
    render(): string | number | bigint | boolean | react_jsx_runtime.JSX.Element | Iterable<ReactNode> | Promise<string | number | bigint | boolean | react.ReactPortal | react.ReactElement<unknown, string | react.JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined;
}

interface PageErrorFallbackProps extends FallbackProps {
}
declare function PageErrorFallback({ resetErrorBoundary, }: PageErrorFallbackProps): react_jsx_runtime.JSX.Element;

interface RouteWithErrorBoundaryProps {
    children: ReactNode;
    fallback?: ComponentType<FallbackProps>;
}
declare function RouteWithErrorBoundary({ children, fallback, }: RouteWithErrorBoundaryProps): react_jsx_runtime.JSX.Element;

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: boolean;
}
declare const SearchBar: react.ForwardRefExoticComponent<SearchBarProps & react.RefAttributes<HTMLInputElement>>;

interface StatCardGridProps {
    children: ReactNode;
    columns?: 1 | 2 | 3 | 4;
    className?: string;
}
declare function StatCardGrid({ children, columns, className, }: StatCardGridProps): react_jsx_runtime.JSX.Element;

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
}
declare function Skeleton({ className, ...props }: SkeletonProps): react_jsx_runtime.JSX.Element;

interface ModuleSkeletonProps extends HTMLAttributes<HTMLDivElement> {
}
declare function ModuleSkeleton({ className, ...props }: ModuleSkeletonProps): react_jsx_runtime.JSX.Element;

interface OSNavigationRailItem {
    id: string;
    icon: ReactNode;
    label?: string;
    active?: boolean;
    disabled?: boolean;
    onClick?: (id: string) => void;
}
interface OSNavigationRailProps {
    items: OSNavigationRailItem[];
    activeItemId?: string;
    defaultActiveItemId?: string;
    onActiveItemChange?: (id: string, item: OSNavigationRailItem) => void;
    onItemClick?: (id: string, item: OSNavigationRailItem) => void;
    className?: string;
}
declare function OSNavigationRail({ items, activeItemId, defaultActiveItemId, onActiveItemChange, onItemClick, className, }: OSNavigationRailProps): react_jsx_runtime.JSX.Element;

type StatCardChangeVariant = 'success' | 'error' | 'neutral';
interface StatCardItem {
    label: string;
    value: string;
    change?: string;
    changeVariant?: StatCardChangeVariant;
}
interface StatCardsProps {
    items: StatCardItem[];
    className?: string;
}
declare function StatCards({ items, className }: StatCardsProps): react_jsx_runtime.JSX.Element;
interface StatCardWithChartItem extends StatCardItem {
    chartData?: number[];
}
interface StatCardsWithChartProps {
    items: StatCardWithChartItem[];
    className?: string;
}
declare function StatCardsWithChart({ items, className, }: StatCardsWithChartProps): react_jsx_runtime.JSX.Element;

type StatusBadgeVariant = 'success' | 'warning' | 'error' | 'info';
interface StatusBadgeProps {
    label: string;
    variant?: StatusBadgeVariant;
    className?: string;
}
declare function StatusBadge({ label, variant, className, }: StatusBadgeProps): react_jsx_runtime.JSX.Element;

interface TabItem {
    id: string;
    label: string;
}
interface TabSystemProps {
    tabs: TabItem[];
    activeTabId: string;
    onTabChange: (tabId: string) => void;
    className?: string;
}
declare function TabSystem({ tabs, activeTabId, onTabChange, className, }: TabSystemProps): react_jsx_runtime.JSX.Element;

type TaskStatus = 'todo' | 'in_progress' | 'done';
type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
interface TaskItemData {
    id: string;
    title: string;
    company: string;
    priority: TaskPriority;
    date: string;
    assignee: string;
    completed?: boolean;
    /** Jira issue key when synced (e.g. PROJ-123). Shown on Kanban cards. */
    jiraKey?: string;
    /** Plain-text body when available (e.g. Jira description). */
    description?: string;
    /** Canonical status for CRM views; overrides inference from `completed` when set. */
    status?: TaskStatus;
    /** Jira assignee account id for API updates. */
    assigneeAccountId?: string;
    /** Due date as yyyy-mm-dd for editable fields. */
    dueDateIso?: string | null;
}
interface TaskWithStatus extends TaskItemData {
    status: TaskStatus;
}
interface TaskSection {
    id: TaskStatus;
    label: string;
    count: number;
    tasks: TaskItemData[];
}
interface TaskCreatePayload {
    title: string;
    company?: string;
    priority?: TaskPriority;
}

interface TaskItemProps extends TaskItemData {
    onToggle?: (id: string) => void;
    onClick?: (id: string) => void;
    /** Rendered next to the task title (e.g. status dropdown). Clicks do not open the row. */
    titleAddon?: ReactNode;
    className?: string;
}
declare function TaskItem({ id, title, company, priority, date, assignee, completed, onToggle, onClick, titleAddon, className, }: TaskItemProps): react_jsx_runtime.JSX.Element;

interface TaskListProps {
    sections: TaskSection[];
    onTaskToggle?: (taskId: string) => void;
    onTaskClick?: (taskId: string) => void;
    /**
     * When true, tasks can be dragged across sections (status columns).
     * Ignored when `statusDropdown` is true.
     */
    enableDrag?: boolean;
    onBoardTasksChange?: (tasks: TaskWithStatus[]) => void;
    /**
     * When true, each row shows a compact status dropdown next to the title instead of drag-and-drop.
     */
    statusDropdown?: boolean;
    onTaskStatusChange?: (taskId: string, status: TaskStatus) => void;
    /** Applied to each `TaskItem` row (e.g. compact density). */
    taskRowClassName?: string;
    className?: string;
}
declare function TaskList({ sections, onTaskToggle, onTaskClick, enableDrag, onBoardTasksChange, statusDropdown, onTaskStatusChange, taskRowClassName, className, }: TaskListProps): react_jsx_runtime.JSX.Element;

interface TemplateCardProps {
    category: string;
    title: string;
    uses: string;
    onClick?: () => void;
    className?: string;
}
declare function TemplateCard({ category, title, uses, onClick, className, }: TemplateCardProps): react_jsx_runtime.JSX.Element;

interface GraphNode$1 {
    id: string;
    type: EntityType;
    name: string;
    metadata?: Record<string, string>;
}
interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    intent?: 'entity' | 'event' | 'general';
    timestamp: string;
}

interface ActivityStreamProps {
    events: CitronEvent[];
    onEntitySelect?: (entity: GraphNode$1) => void;
    findEntity?: (name: string) => GraphNode$1 | null;
    emptyMessage?: string;
    className?: string;
}
declare function ActivityStream({ events, onEntitySelect, findEntity, emptyMessage, className, }: ActivityStreamProps): react_jsx_runtime.JSX.Element;

interface AppNavigationRailItem {
    id: string;
    path: string;
    icon: LucideIcon;
    label: string;
}
interface AppNavigationRailProps {
    items?: AppNavigationRailItem[];
    brandLogo?: ReactNode;
    brandTitle?: string;
    className?: string;
}
declare function AppNavigationRail({ items, brandLogo, brandTitle, className, }: AppNavigationRailProps): react_jsx_runtime.JSX.Element;

interface CommandBarProps {
    prompt: string;
    onPromptChange: (value: string) => void;
    onSubmit: () => void;
    onFilesAttach?: (files: File[]) => void;
    isProcessing: boolean;
    placeholder?: string;
    subtitle?: string;
    className?: string;
}
declare function CommandBar({ prompt, onPromptChange, onSubmit, onFilesAttach, isProcessing, placeholder, subtitle, className, }: CommandBarProps): react_jsx_runtime.JSX.Element;

interface EventStreamSidebarProps {
    events: CitronEvent[];
    title?: string;
    showLive?: boolean;
    className?: string;
}
declare function EventStreamSidebar({ events, title, showLive, className, }: EventStreamSidebarProps): react_jsx_runtime.JSX.Element;

interface IntelligenceLabKpiCard {
    label: string;
    value: number;
    subtext?: string;
    trend?: 'up' | 'down';
}
interface IntelligenceLabInsight {
    title: string;
    description: string;
    confidence: number;
}
interface IntelligenceLabProps {
    entities: GraphNode$1[];
    events: CitronEvent[];
    focusEntity: GraphNode$1;
    setFocusEntity: (entity: GraphNode$1) => void;
    loading: boolean;
    kpiCards?: IntelligenceLabKpiCard[];
    aiInsights?: IntelligenceLabInsight[];
    title?: string;
    subtitle?: string;
    className?: string;
}
declare function IntelligenceLab({ loading, kpiCards, aiInsights, title, subtitle, className, }: IntelligenceLabProps): react_jsx_runtime.JSX.Element;

interface MainShellProps {
    navigation: ReactNode;
    eventStream: ReactNode | null;
    commandBar: ReactNode;
    children: ReactNode;
    className?: string;
    eventStreamWidth?: string;
}
declare function MainShell({ navigation, eventStream, commandBar, children, className, eventStreamWidth, }: MainShellProps): react_jsx_runtime.JSX.Element;

interface TaskCreateFormProps {
    onConfirm: (payload: TaskCreatePayload) => void;
    onCancel: () => void;
    className?: string;
}
declare function TaskCreateForm({ onConfirm, onCancel, className, }: TaskCreateFormProps): react_jsx_runtime.JSX.Element;

interface TasksViewProps {
    initialTasks?: TaskWithStatus[];
    onTaskCreate?: (payload: TaskCreatePayload) => void;
    onTaskToggle?: (taskId: string) => void;
    onTaskClick?: (taskId: string) => void;
    /** Invoked when tasks are reordered or moved between columns in Kanban (Jira-style board). */
    onTasksReorder?: (tasks: TaskWithStatus[]) => void;
    className?: string;
}
declare function TasksView({ initialTasks, onTaskCreate, onTaskToggle, onTaskClick, onTasksReorder, className, }: TasksViewProps): react_jsx_runtime.JSX.Element;

interface EmailCampaignsViewProps {
    onSendNow?: () => void;
    onSchedule?: () => void;
    onSaveDraft?: () => void;
    onNewCampaign?: () => void;
    onGenerateWithAI?: () => void;
    onTemplateClick?: (template: EmailTemplateItem) => void;
    className?: string;
}
declare function EmailCampaignsView({ onSendNow, onSchedule, onSaveDraft, onNewCampaign, onGenerateWithAI, onTemplateClick, className, }: EmailCampaignsViewProps): react_jsx_runtime.JSX.Element;

type CitronTheme = 'light' | 'dark';
declare const CITRON_THEME_STORAGE_KEY = "citron-ui-theme";
interface ThemeContextValue {
    theme: CitronTheme;
    setTheme: (theme: CitronTheme) => void;
    toggleTheme: () => void;
}
interface ThemeProviderProps {
    children: ReactNode;
}
declare function ThemeProvider({ children }: ThemeProviderProps): react_jsx_runtime.JSX.Element;
declare function useTheme(): ThemeContextValue;

interface ThemeSwitcherButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
}
declare function ThemeSwitcherButton({ className, type, ...props }: ThemeSwitcherButtonProps): react_jsx_runtime.JSX.Element;

/** Applies a @hello-pangea/dnd drop result to a flat task list grouped by `status`. */
declare function applyTaskBoardDragResult(tasks: TaskWithStatus[], result: DropResult): TaskWithStatus[];
interface TaskKanbanBoardProps {
    tasks: TaskWithStatus[];
    onTasksChange: (tasks: TaskWithStatus[]) => void;
    /** Opens task details when a card is activated (click, not drag). */
    onTaskOpen?: (taskId: string) => void;
    className?: string;
}
declare function TaskKanbanBoard({ tasks, onTasksChange, onTaskOpen, className }: TaskKanbanBoardProps): react_jsx_runtime.JSX.Element;

interface TaskKanbanColumnProps {
    columnId: TaskStatus;
    title: string;
    count: number;
    children: ReactNode;
    className?: string;
}
declare function TaskKanbanColumn({ columnId, title, count, children, className, }: TaskKanbanColumnProps): react_jsx_runtime.JSX.Element;

interface TaskKanbanCardProps {
    task: TaskWithStatus;
    index: number;
    /** Fires on card click when not dragging. */
    onOpen?: () => void;
    className?: string;
}
declare function TaskKanbanCard({ task, index, onOpen, className }: TaskKanbanCardProps): react_jsx_runtime.JSX.Element;

interface NavLinkRouterProps extends Omit<NavLinkProps$1, 'className'> {
    className?: string;
    activeClassName?: string;
    pendingClassName?: string;
}
declare const NavLinkRouter: react.ForwardRefExoticComponent<NavLinkRouterProps & react.RefAttributes<HTMLAnchorElement>>;

interface InvoiceClient {
    id: string;
    name: string;
    email?: string;
}
interface InvoiceProduct {
    id: string;
    name: string;
    unitPrice?: number;
}
interface InvoiceFormData {
    clientId: string;
    productId: string;
    quantity: number;
    paymentMethod: string;
    taxType: string;
    invoiceType: string;
    bankAccount: string;
    notes: string;
}
interface InvoiceFormProps {
    clients: InvoiceClient[];
    products: InvoiceProduct[];
    paymentMethods?: string[];
    taxTypes?: string[];
    invoiceTypes?: string[];
    bankAccounts?: string[];
    value?: Partial<InvoiceFormData>;
    onChange?: (data: Partial<InvoiceFormData>) => void;
    onCreateClient?: () => void;
    attempted?: boolean;
    className?: string;
}
declare function InvoiceForm({ clients, products, paymentMethods, taxTypes, invoiceTypes, bankAccounts, value, onChange, onCreateClient, attempted, className, }: InvoiceFormProps): react_jsx_runtime.JSX.Element;

interface InvoicePreviewProps {
    data: Partial<InvoiceFormData>;
    clients: InvoiceClient[];
    products: InvoiceProduct[];
    className?: string;
}
declare function InvoicePreview({ data, clients, products, className }: InvoicePreviewProps): react_jsx_runtime.JSX.Element;

interface InvoiceEditorPageProps extends Omit<InvoiceFormProps, 'value' | 'onChange' | 'attempted'> {
    onSubmit?: (data: InvoiceFormData) => void;
    isSubmitting?: boolean;
    className?: string;
}
declare function InvoiceEditorPage({ clients, products, onSubmit, onCreateClient, isSubmitting, className, ...formProps }: InvoiceEditorPageProps): react_jsx_runtime.JSX.Element;

interface AccordionItem {
    id: string;
    title: ReactNode;
    content: ReactNode;
    disabled?: boolean;
}
interface AccordionProps {
    items: AccordionItem[];
    defaultValue?: string[];
    allowMultiple?: boolean;
    className?: string;
}
declare function Accordion({ items, defaultValue, allowMultiple, className, }: AccordionProps): react_jsx_runtime.JSX.Element;

interface AdvancedDropdownOption {
    value: string;
    label: string;
    description?: string;
    icon?: ReactNode;
    disabled?: boolean;
}
interface AdvancedDropdownProps {
    options?: AdvancedDropdownOption[];
    /** Async loader — called with the current search query; takes precedence over `options`. */
    loadOptions?: (query: string) => Promise<AdvancedDropdownOption[]>;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string | null) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    loadingMessage?: string;
    clearable?: boolean;
    disabled?: boolean;
    className?: string;
}
declare function AdvancedDropdown({ options: staticOptions, loadOptions, value: controlledValue, defaultValue, onChange, placeholder, searchPlaceholder, emptyMessage, loadingMessage, clearable, disabled, className, }: AdvancedDropdownProps): react_jsx_runtime.JSX.Element;

type AlertVariant = 'info' | 'success' | 'warning' | 'error';
interface AlertProps {
    title: ReactNode;
    description?: ReactNode;
    variant?: AlertVariant;
    className?: string;
}
declare function Alert({ title, description, variant, className, }: AlertProps): react_jsx_runtime.JSX.Element;

interface AlertDialogProps {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    confirmDisabled?: boolean;
    closeOnConfirm?: boolean;
    initialFocusRef?: RefObject<HTMLElement | null>;
    onOpenChange?: (open: boolean) => void;
    onConfirm?: () => void;
    onCancel?: () => void;
    className?: string;
}
declare function AlertDialog({ open, title, description, confirmLabel, cancelLabel, destructive, confirmDisabled, closeOnConfirm, initialFocusRef, onOpenChange, onConfirm, onCancel, className, }: AlertDialogProps): react_jsx_runtime.JSX.Element | null;

type BlockType = 'heading' | 'text' | 'image' | 'button' | 'divider' | 'columns';
interface EmailBlock {
    id: string;
    type: BlockType;
    content: string;
}
interface EmailBlockEditorProps {
    blocks: EmailBlock[];
    onBlocksChange: (blocks: EmailBlock[]) => void;
    availableBlockTypes?: BlockType[];
    editingId?: string | null;
    onEditingIdChange?: (editingId: string | null) => void;
    onAddBlock?: (type: BlockType, block: EmailBlock) => void;
    onDeleteBlock?: (id: string) => void;
    onMoveBlock?: (id: string, direction: -1 | 1) => void;
    onBlockContentChange?: (id: string, content: string) => void;
    readOnly?: boolean;
    className?: string;
}
declare function EmailBlockEditor({ blocks, onBlocksChange, availableBlockTypes, editingId, onEditingIdChange, onAddBlock, onDeleteBlock, onMoveBlock, onBlockContentChange, readOnly, className, }: EmailBlockEditorProps): react_jsx_runtime.JSX.Element;

interface AIEmailGeneratorProps {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    isGenerating?: boolean;
    onGeneratingChange?: (isGenerating: boolean) => void;
    generated?: boolean;
    onGeneratedChange?: (generated: boolean) => void;
    generationDelayMs?: number;
    onSubmitPrompt?: (prompt: string) => void;
    generateBlocks?: (prompt: string) => EmailBlock[] | Promise<EmailBlock[]>;
    onGenerate?: (blocks: EmailBlock[]) => void;
    suggestions?: string[];
    className?: string;
}
declare function AIEmailGenerator({ value, defaultValue, onValueChange, isGenerating, onGeneratingChange, generated, onGeneratedChange, generationDelayMs, onSubmitPrompt, generateBlocks, onGenerate, suggestions, className, }: AIEmailGeneratorProps): react_jsx_runtime.JSX.Element;

interface AppSidebarItem {
    id: string;
    icon: LucideIcon;
    label: string;
    path: string;
    dataTour?: string;
}
interface AppSidebarProps {
    items?: AppSidebarItem[];
    bottomItems?: AppSidebarItem[];
    activePath?: string;
    onNavigate?: (path: string) => void;
    logo?: ReactNode;
    /** When true the status dot at the bottom pulses with an animation. */
    showStatusDot?: boolean;
    /** Renders the global theme toggle (moon/sun) next to bottom nav items. Requires ThemeProvider. */
    showThemeToggle?: boolean;
    className?: string;
}
declare function AppSidebar({ items, bottomItems, activePath, onNavigate, logo, showStatusDot, showThemeToggle, className, }: AppSidebarProps): react_jsx_runtime.JSX.Element;

type EventStatus = 'success' | 'warning' | 'error' | 'danger' | 'info';
interface EventFeedItem {
    id: string | number;
    icon: LucideIcon;
    title: string;
    meta: string;
    time: string;
    status: EventStatus;
}
interface EventFeedProps {
    title?: string;
    liveLabel?: string;
    events?: EventFeedItem[];
    onItemClick?: (event: EventFeedItem) => void;
    className?: string;
}
declare function EventFeed({ title, liveLabel, events, onItemClick, className, }: EventFeedProps): react_jsx_runtime.JSX.Element;

interface CanvasBlock {
    id: string;
    type: 'text' | 'entity' | 'intelligence' | 'loading';
    content?: string;
}
interface CanvasContextValue {
    blocks: CanvasBlock[];
    addBlocks: (blocks: CanvasBlock[]) => void;
    clearBlocks: () => void;
}
declare function useCanvas(): CanvasContextValue;
interface CanvasProviderProps {
    children: ReactNode;
    initialBlocks?: CanvasBlock[];
}
declare function CanvasProvider({ children, initialBlocks }: CanvasProviderProps): react_jsx_runtime.JSX.Element;

interface AppLayoutProps {
    children: ReactNode;
    showEventFeed?: boolean;
    sidebarProps?: Partial<AppSidebarProps>;
    eventFeedProps?: Partial<EventFeedProps>;
    canvasProviderProps?: Partial<CanvasProviderProps>;
    className?: string;
}
declare function AppLayout({ children, showEventFeed, sidebarProps, eventFeedProps, canvasProviderProps, className, }: AppLayoutProps): react_jsx_runtime.JSX.Element;

interface AspectRatioProps {
    ratio?: number;
    children: ReactNode;
    className?: string;
}
declare function AspectRatio({ ratio, children, className }: AspectRatioProps): react_jsx_runtime.JSX.Element;

type AvatarSize = 'sm' | 'md' | 'lg';
interface AvatarProps {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: AvatarSize;
    disabled?: boolean;
    className?: string;
}
declare function Avatar({ src, alt, fallback, size, disabled, className, }: AvatarProps): react_jsx_runtime.JSX.Element;

type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    disabled?: boolean;
    className?: string;
}
declare function Badge({ children, variant, disabled, className, }: BadgeProps): react_jsx_runtime.JSX.Element;

interface BreadcrumbItem {
    id: string;
    label: string;
    href?: string;
    current?: boolean;
    disabled?: boolean;
    onClick?: () => void;
}
interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}
declare function Breadcrumb({ items, className }: BreadcrumbProps): react_jsx_runtime.JSX.Element;

interface CalendarProps {
    value?: Date;
    onChange?: (date: Date) => void;
    disabledDates?: Date[];
    className?: string;
}
declare function Calendar({ value, onChange, disabledDates, className }: CalendarProps): react_jsx_runtime.JSX.Element;

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    interactive?: boolean;
    disabled?: boolean;
}
declare function Card({ className, interactive, disabled, ...props }: CardProps): react_jsx_runtime.JSX.Element;
declare function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
declare function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>): react_jsx_runtime.JSX.Element;
declare function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>): react_jsx_runtime.JSX.Element;
declare function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
declare function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;

interface CarouselProps {
    items: ReactNode[];
    initialIndex?: number;
    loop?: boolean;
    className?: string;
}
declare function Carousel({ items, initialIndex, loop, className, }: CarouselProps): react_jsx_runtime.JSX.Element;

interface ChartDatum {
    id: string;
    label: string;
    value: number;
    color?: string;
}
interface ChartProps {
    data: ChartDatum[];
    title?: string;
    emptyMessage?: string;
    className?: string;
}
declare function Chart({ data, title, emptyMessage, className, }: ChartProps): react_jsx_runtime.JSX.Element;

interface CheckboxProps {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    label?: ReactNode;
    description?: ReactNode;
    disabled?: boolean;
    error?: boolean;
    className?: string;
}
declare function Checkbox({ checked, defaultChecked, onCheckedChange, label, description, disabled, error, className, }: CheckboxProps): react_jsx_runtime.JSX.Element;

interface CircularScoreProps {
    label: string;
    value: number;
    tone?: 'success' | 'warning' | 'error' | 'info' | 'primary';
    /** Override the stroke color with an arbitrary CSS color value. Takes precedence over `tone`. */
    color?: string;
    /** When true the arc represents the inverse (100 - value). Useful for risk-style scores. */
    inverted?: boolean;
    size?: number;
    className?: string;
}
declare function CircularScore({ label, value, tone, color, inverted, size, className, }: CircularScoreProps): react_jsx_runtime.JSX.Element;

interface CollapsibleProps {
    title: ReactNode;
    children: ReactNode;
    defaultOpen?: boolean;
    disabled?: boolean;
    className?: string;
}
declare function Collapsible({ title, children, defaultOpen, disabled, className, }: CollapsibleProps): react_jsx_runtime.JSX.Element;

interface CommandItem {
    id: string;
    label: string;
    keywords?: string[];
    icon?: ReactNode;
    disabled?: boolean;
}
interface CommandProps {
    items: CommandItem[];
    placeholder?: string;
    onSelect?: (item: CommandItem) => void;
    className?: string;
}
declare function Command({ items, placeholder, onSelect, className, }: CommandProps): react_jsx_runtime.JSX.Element;

type CommandCanvasCardType = 'entity' | 'intelligence';
interface CommandCanvasMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    cards?: CommandCanvasCardType[];
}
interface CommandCanvasProps {
    title?: string;
    subtitle?: string;
    readyLabel?: string;
    placeholder?: string;
    footerText?: string;
    /**
     * When provided, the canvas renders blocks from CanvasContext instead of the
     * built-in message list. Use `renderBlock` to customise how each block type
     * is rendered.
     */
    blocks?: CanvasBlock[];
    /** Custom renderer for each block type when using blocks mode. */
    renderBlock?: (block: CanvasBlock) => ReactNode;
    messages?: CommandCanvasMessage[];
    initialMessages?: CommandCanvasMessage[];
    onMessagesChange?: (messages: CommandCanvasMessage[]) => void;
    inputValue?: string;
    defaultInputValue?: string;
    onInputValueChange?: (value: string) => void;
    autoAssistantResponse?: boolean;
    assistantResponseDelayMs?: number;
    isResponding?: boolean;
    onRespondingChange?: (isResponding: boolean) => void;
    onSend?: (value: string) => void;
    generateAssistantMessage?: (value: string) => Omit<CommandCanvasMessage, 'id' | 'role'>;
    renderCard?: (type: CommandCanvasCardType) => ReactNode;
    /** When true, hides the built-in input bar. */
    hideInput?: boolean;
    className?: string;
}
declare function CommandCanvas({ title, subtitle, readyLabel, placeholder, footerText, blocks, renderBlock, messages, initialMessages, onMessagesChange, inputValue, defaultInputValue, onInputValueChange, autoAssistantResponse, assistantResponseDelayMs, isResponding, onRespondingChange, onSend, generateAssistantMessage, renderCard, hideInput, className, }: CommandCanvasProps): react_jsx_runtime.JSX.Element;

interface ContextMenuItem {
    id: string;
    label: string;
    icon?: ReactNode;
    shortcut?: string;
    disabled?: boolean;
    danger?: boolean;
    onSelect?: () => void;
}
interface ContextMenuProps {
    trigger: ReactNode;
    items: ContextMenuItem[];
    className?: string;
}
declare function ContextMenu({ trigger, items, className }: ContextMenuProps): react_jsx_runtime.JSX.Element;

interface DialogProps {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: ReactNode;
}
declare function Dialog({ open, defaultOpen, onOpenChange, children, }: DialogProps): react_jsx_runtime.JSX.Element;
type DialogTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;
declare const DialogTrigger: react.ForwardRefExoticComponent<DialogTriggerProps & react.RefAttributes<HTMLButtonElement>>;
interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
    showCloseButton?: boolean;
    initialFocusRef?: RefObject<HTMLElement | null>;
}
declare const DialogContent: react.ForwardRefExoticComponent<DialogContentProps & react.RefAttributes<HTMLDivElement>>;
interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {
}
declare function DialogHeader({ className, ...props }: DialogHeaderProps): react_jsx_runtime.JSX.Element;
type DialogTitleProps = HTMLAttributes<HTMLHeadingElement>;
declare function DialogTitle({ className, ...props }: DialogTitleProps): react_jsx_runtime.JSX.Element;
type DialogDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
declare function DialogDescription({ className, ...props }: DialogDescriptionProps): react_jsx_runtime.JSX.Element;
interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {
}
declare function DialogFooter({ className, ...props }: DialogFooterProps): react_jsx_runtime.JSX.Element;
type DialogCloseProps = ButtonHTMLAttributes<HTMLButtonElement>;
declare const DialogClose: react.ForwardRefExoticComponent<DialogCloseProps & react.RefAttributes<HTMLButtonElement>>;

type DrawerSide = 'left' | 'right';
interface DrawerProps {
    children: ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: DrawerSide;
}
declare function Drawer({ children, open, defaultOpen, onOpenChange, side, }: DrawerProps): react_jsx_runtime.JSX.Element;
type DrawerTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;
declare const DrawerTrigger: react.ForwardRefExoticComponent<DrawerTriggerProps & react.RefAttributes<HTMLButtonElement>>;
interface DrawerContentProps extends HTMLAttributes<HTMLDivElement> {
    initialFocusRef?: RefObject<HTMLElement | null>;
}
declare const DrawerContent: react.ForwardRefExoticComponent<DrawerContentProps & react.RefAttributes<HTMLDivElement>>;
interface DrawerHeaderProps extends HTMLAttributes<HTMLDivElement> {
}
declare function DrawerHeader({ className, ...props }: DrawerHeaderProps): react_jsx_runtime.JSX.Element;
type DrawerTitleProps = HTMLAttributes<HTMLHeadingElement>;
declare function DrawerTitle({ className, ...props }: DrawerTitleProps): react_jsx_runtime.JSX.Element;
type DrawerDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
declare function DrawerDescription({ className, ...props }: DrawerDescriptionProps): react_jsx_runtime.JSX.Element;
interface DrawerFooterProps extends HTMLAttributes<HTMLDivElement> {
}
declare function DrawerFooter({ className, ...props }: DrawerFooterProps): react_jsx_runtime.JSX.Element;
type DrawerCloseProps = ButtonHTMLAttributes<HTMLButtonElement>;
declare const DrawerClose: react.ForwardRefExoticComponent<DrawerCloseProps & react.RefAttributes<HTMLButtonElement>>;

interface DropdownMenuProps {
    children: ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}
declare function DropdownMenu({ children, open, defaultOpen, onOpenChange, }: DropdownMenuProps): react_jsx_runtime.JSX.Element;
interface DropdownMenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    showChevron?: boolean;
}
declare const DropdownMenuTrigger: react.ForwardRefExoticComponent<DropdownMenuTriggerProps & react.RefAttributes<HTMLButtonElement>>;
interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
}
declare const DropdownMenuContent: react.ForwardRefExoticComponent<DropdownMenuContentProps & react.RefAttributes<HTMLDivElement>>;
interface DropdownMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: ReactNode;
}
declare const DropdownMenuItem: react.ForwardRefExoticComponent<DropdownMenuItemProps & react.RefAttributes<HTMLButtonElement>>;
interface DropdownMenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {
}
declare function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps): react_jsx_runtime.JSX.Element;

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
}
declare const Form: react.ForwardRefExoticComponent<FormProps & react.RefAttributes<HTMLFormElement>>;
interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
    label?: ReactNode;
    hint?: ReactNode;
    error?: ReactNode;
    requiredIndicator?: boolean;
}
declare function FormField({ className, label, hint, error, children, requiredIndicator, ...props }: FormFieldProps): react_jsx_runtime.JSX.Element;
interface FormActionsProps extends HTMLAttributes<HTMLDivElement> {
}
declare function FormActions({ className, ...props }: FormActionsProps): react_jsx_runtime.JSX.Element;

interface GraphNode {
    id: string;
    label: string;
    kind: 'org' | 'person';
    x: number;
    y: number;
    score: number;
}
interface GraphEdge {
    from: string;
    to: string;
    strength: number;
}
interface GraphViewProps {
    title?: string;
    subtitle?: string;
    nodes?: GraphNode[];
    edges?: GraphEdge[];
    className?: string;
}
declare function GraphView({ title, subtitle, nodes, edges, className, }: GraphViewProps): react_jsx_runtime.JSX.Element;

interface GuidedTourStep {
    target: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}
interface GuidedTourProps {
    steps?: GuidedTourStep[];
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    stepIndex?: number;
    defaultStepIndex?: number;
    onStepIndexChange?: (stepIndex: number) => void;
    onComplete: () => void;
    className?: string;
}
declare function GuidedTour({ steps, open, defaultOpen, onOpenChange, stepIndex, defaultStepIndex, onStepIndexChange, onComplete, className, }: GuidedTourProps): react_jsx_runtime.JSX.Element | null;

interface HoverCardProps {
    children: ReactNode;
    openDelay?: number;
    closeDelay?: number;
}
declare function HoverCard({ children, openDelay, closeDelay, }: HoverCardProps): react_jsx_runtime.JSX.Element;
interface HoverCardTriggerProps extends HTMLAttributes<HTMLDivElement> {
}
declare const HoverCardTrigger: react.ForwardRefExoticComponent<HoverCardTriggerProps & react.RefAttributes<HTMLDivElement>>;
interface HoverCardContentProps extends HTMLAttributes<HTMLDivElement> {
}
declare const HoverCardContent: react.ForwardRefExoticComponent<HoverCardContentProps & react.RefAttributes<HTMLDivElement>>;

interface InputOtpProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'> {
    length?: number;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    containerProps?: HTMLAttributes<HTMLDivElement>;
}
declare const InputOtp: react.ForwardRefExoticComponent<InputOtpProps & react.RefAttributes<HTMLDivElement>>;

interface IntelligenceScoreItem {
    label: string;
    value: number;
    tone?: 'success' | 'warning' | 'error' | 'info' | 'primary';
    /** Override the stroke color with an arbitrary CSS color value. */
    color?: string;
    /** When true the arc represents the inverse (100 - value). Useful for risk scores. */
    inverted?: boolean;
}
interface IntelligenceCardProps {
    title?: string;
    items?: IntelligenceScoreItem[];
    className?: string;
}
declare function IntelligenceCard({ title, items, className, }: IntelligenceCardProps): react_jsx_runtime.JSX.Element;

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    requiredIndicator?: boolean;
}
declare const Label: react.ForwardRefExoticComponent<LabelProps & react.RefAttributes<HTMLLabelElement>>;

interface MenubarProps extends HTMLAttributes<HTMLDivElement> {
}
declare const Menubar: react.ForwardRefExoticComponent<MenubarProps & react.RefAttributes<HTMLDivElement>>;
interface MenubarMenuProps extends HTMLAttributes<HTMLDivElement> {
    id: string;
}
declare function MenubarMenu({ id, className, ...props }: MenubarMenuProps): react_jsx_runtime.JSX.Element;
interface MenubarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    showChevron?: boolean;
}
declare const MenubarTrigger: react.ForwardRefExoticComponent<MenubarTriggerProps & react.RefAttributes<HTMLButtonElement>>;
interface MenubarContentProps extends HTMLAttributes<HTMLDivElement> {
}
declare const MenubarContent: react.ForwardRefExoticComponent<MenubarContentProps & react.RefAttributes<HTMLDivElement>>;
interface MenubarItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: ReactNode;
}
declare const MenubarItem: react.ForwardRefExoticComponent<MenubarItemProps & react.RefAttributes<HTMLButtonElement>>;
interface MenubarSeparatorProps extends HTMLAttributes<HTMLDivElement> {
}
declare function MenubarSeparator({ className, ...props }: MenubarSeparatorProps): react_jsx_runtime.JSX.Element;
interface MenubarCloseZoneProps extends HTMLAttributes<HTMLDivElement> {
}
declare const MenubarCloseZone: react.ForwardRefExoticComponent<MenubarCloseZoneProps & react.RefAttributes<HTMLDivElement>>;

interface NavigationMenuItem {
    id: string;
    label: string;
    href?: string;
    active?: boolean;
    disabled?: boolean;
    icon?: ReactNode;
}
interface NavigationMenuProps {
    items: NavigationMenuItem[];
    className?: string;
    onItemSelect?: (item: NavigationMenuItem) => void;
}
declare function NavigationMenu({ items, className, onItemSelect, }: NavigationMenuProps): react_jsx_runtime.JSX.Element;

interface NavLinkProps {
    label: string;
    icon: LucideIcon;
    active?: boolean;
    onClick?: () => void;
    title?: string;
    dataTour?: string;
    className?: string;
}
declare function NavLink({ label, icon: Icon, active, onClick, title, dataTour, className, }: NavLinkProps): react_jsx_runtime.JSX.Element;

interface OnboardingStep {
    id: string;
    question: string;
    subtitle: string;
    icon: LucideIcon;
    type: 'input' | 'select' | 'multi-select';
    field: string;
    placeholder?: string;
    options?: Array<{
        value: string;
        label: string;
    }>;
}
interface OnboardingWizardProps {
    onComplete: (data: Record<string, string | string[]>) => void;
    steps?: OnboardingStep[];
    value?: Record<string, string | string[]>;
    defaultValue?: Record<string, string | string[]>;
    onValueChange?: (value: Record<string, string | string[]>) => void;
    stepIndex?: number;
    defaultStepIndex?: number;
    onStepIndexChange?: (index: number) => void;
    onCancel?: () => void;
    showSkip?: boolean;
    className?: string;
}
declare function OnboardingWizard({ onComplete, steps, value, defaultValue, onValueChange, stepIndex, defaultStepIndex, onStepIndexChange, onCancel, showSkip, className, }: OnboardingWizardProps): react_jsx_runtime.JSX.Element;

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}
declare function Pagination({ page, totalPages, onPageChange, className, }: PaginationProps): react_jsx_runtime.JSX.Element;

interface PopoverProps {
    children: ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}
declare function Popover({ children, open, defaultOpen, onOpenChange, }: PopoverProps): react_jsx_runtime.JSX.Element;
type PopoverTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;
declare const PopoverTrigger: react.ForwardRefExoticComponent<PopoverTriggerProps & react.RefAttributes<HTMLButtonElement>>;
interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
}
declare const PopoverContent: react.ForwardRefExoticComponent<PopoverContentProps & react.RefAttributes<HTMLDivElement>>;
type PopoverCloseProps = ButtonHTMLAttributes<HTMLButtonElement>;
declare const PopoverClose: react.ForwardRefExoticComponent<PopoverCloseProps & react.RefAttributes<HTMLButtonElement>>;

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
    value: number;
    max?: number;
    showValueLabel?: boolean;
}
declare const Progress: react.ForwardRefExoticComponent<ProgressProps & react.RefAttributes<HTMLDivElement>>;

interface RadioGroupOption {
    value: string;
    label: ReactNode;
    description?: ReactNode;
    disabled?: boolean;
}
interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
    options: RadioGroupOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    name?: string;
}
declare const RadioGroup: react.ForwardRefExoticComponent<RadioGroupProps & react.RefAttributes<HTMLDivElement>>;
interface RadioGroupItemProps extends InputHTMLAttributes<HTMLInputElement> {
}
declare const RadioGroupItem: react.ForwardRefExoticComponent<RadioGroupItemProps & react.RefAttributes<HTMLInputElement>>;

type ResizableDirection = 'horizontal' | 'vertical';
interface ResizableProps {
    primary: ReactNode;
    secondary: ReactNode;
    direction?: ResizableDirection;
    defaultPrimarySize?: number;
    minPrimarySize?: number;
    minSecondarySize?: number;
    className?: string;
}
declare function Resizable({ primary, secondary, direction, defaultPrimarySize, minPrimarySize, minSecondarySize, className, }: ResizableProps): react_jsx_runtime.JSX.Element;

interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
    maxHeight?: string;
}
declare const ScrollArea: react.ForwardRefExoticComponent<ScrollAreaProps & react.RefAttributes<HTMLDivElement>>;

interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}
interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'children' | 'onChange' | 'multiple'> {
    options: SelectOption[];
    placeholder?: string;
    error?: boolean;
    onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
}
declare const Select: react.ForwardRefExoticComponent<SelectProps & react.RefAttributes<HTMLButtonElement>>;

type SeparatorOrientation = 'horizontal' | 'vertical';
interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
    orientation?: SeparatorOrientation;
    decorative?: boolean;
}
declare const Separator: react.ForwardRefExoticComponent<SeparatorProps & react.RefAttributes<HTMLDivElement>>;

type SheetSide = 'top' | 'right' | 'bottom' | 'left';
interface SheetProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: SheetSide;
    title?: ReactNode;
    description?: ReactNode;
    showCloseButton?: boolean;
    overlayClassName?: string;
}
declare function Sheet({ open, onOpenChange, side, title, description, showCloseButton, className, overlayClassName, children, ...props }: SheetProps): react_jsx_runtime.JSX.Element | null;

interface SidebarItem {
    id: string;
    label: string;
    icon?: LucideIcon;
    active?: boolean;
    disabled?: boolean;
    badge?: ReactNode;
    onClick?: () => void;
}
interface SidebarProps extends HTMLAttributes<HTMLElement> {
    items: SidebarItem[];
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    header?: ReactNode;
    footer?: ReactNode;
}
declare function Sidebar({ items, collapsed, onCollapsedChange, header, footer, className, ...props }: SidebarProps): react_jsx_runtime.JSX.Element;

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange'> {
    value?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    showValue?: boolean;
    onValueChange?: (value: number) => void;
}
declare const Slider: react.ForwardRefExoticComponent<SliderProps & react.RefAttributes<HTMLInputElement>>;

type ToastVariant = 'info' | 'success' | 'warning' | 'error';
interface ToastAction extends ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
}
interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    title: ReactNode;
    description?: ReactNode;
    variant?: ToastVariant;
    action?: ToastAction;
    onClose?: () => void;
}
declare function Toast({ title, description, variant, action, onClose, className, ...props }: ToastProps): react_jsx_runtime.JSX.Element;

type ToasterPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
interface ToasterItem extends ToastProps {
    id: string;
}
interface ToasterProps extends HTMLAttributes<HTMLDivElement> {
    toasts: ToasterItem[];
    position?: ToasterPosition;
    onDismiss?: (id: string) => void;
}
declare function Toaster({ toasts, position, onDismiss, className, ...props }: ToasterProps): react_jsx_runtime.JSX.Element;

interface SonnerProps extends HTMLAttributes<HTMLDivElement> {
    toasts: ToasterItem[];
    maxVisible?: number;
    position?: ToasterPosition;
    onDismiss?: (id: string) => void;
}
declare function Sonner({ toasts, maxVisible, position, onDismiss, ...props }: SonnerProps): react_jsx_runtime.JSX.Element;

interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}
declare const Switch: react.ForwardRefExoticComponent<SwitchProps & react.RefAttributes<HTMLButtonElement>>;

declare const Table: react.ForwardRefExoticComponent<TableHTMLAttributes<HTMLTableElement> & react.RefAttributes<HTMLTableElement>>;
declare const TableHeader: react.ForwardRefExoticComponent<HTMLAttributes<HTMLTableSectionElement> & react.RefAttributes<HTMLTableSectionElement>>;
declare const TableBody: react.ForwardRefExoticComponent<HTMLAttributes<HTMLTableSectionElement> & react.RefAttributes<HTMLTableSectionElement>>;
declare const TableRow: react.ForwardRefExoticComponent<HTMLAttributes<HTMLTableRowElement> & react.RefAttributes<HTMLTableRowElement>>;
type TableSortDirection = 'asc' | 'desc';
interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
    sortable?: boolean;
    sortDirection?: TableSortDirection;
    onSort?: () => void;
    sortButtonProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onClick'>;
}
declare const TableHead: react.ForwardRefExoticComponent<TableHeadProps & react.RefAttributes<HTMLTableCellElement>>;
declare const TableCell: react.ForwardRefExoticComponent<TdHTMLAttributes<HTMLTableCellElement> & react.RefAttributes<HTMLTableCellElement>>;
declare const TableCaption: react.ForwardRefExoticComponent<HTMLAttributes<HTMLTableCaptionElement> & react.RefAttributes<HTMLTableCaptionElement>>;
interface TableEmptyStateProps extends TdHTMLAttributes<HTMLTableCellElement> {
    colSpan: number;
    title?: string;
    description?: string;
}
declare const TableEmptyState: react.ForwardRefExoticComponent<TableEmptyStateProps & react.RefAttributes<HTMLTableCellElement>>;

interface TabsItem {
    id: string;
    label: ReactNode;
    content: ReactNode;
    disabled?: boolean;
}
interface TabsProps extends HTMLAttributes<HTMLDivElement> {
    items: TabsItem[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    fullWidth?: boolean;
}
declare function Tabs({ items, value, defaultValue, onValueChange, fullWidth, className, ...props }: TabsProps): react_jsx_runtime.JSX.Element;

type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
    resize?: TextareaResize;
}
declare const Textarea: react.ForwardRefExoticComponent<TextareaProps & react.RefAttributes<HTMLTextAreaElement>>;

type ToggleSize = 'sm' | 'md' | 'lg';
type ToggleVariant = 'default' | 'outline';
interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
    pressed?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
    size?: ToggleSize;
    variant?: ToggleVariant;
}
declare function Toggle({ pressed, defaultPressed, onPressedChange, size, variant, disabled, className, children, ...props }: ToggleProps): react_jsx_runtime.JSX.Element;

type ToggleGroupType = 'single' | 'multiple';
interface ToggleGroupItem {
    id: string;
    label: string;
    icon?: LucideIcon;
    disabled?: boolean;
}
interface ToggleGroupProps extends HTMLAttributes<HTMLDivElement> {
    type?: ToggleGroupType;
    items: ToggleGroupItem[];
    value?: string | string[];
    defaultValue?: string | string[];
    onValueChange?: (value: string | string[]) => void;
}
declare function ToggleGroup({ type, items, value, defaultValue, onValueChange, className, ...props }: ToggleGroupProps): react_jsx_runtime.JSX.Element;

type TooltipSide = 'top' | 'right' | 'bottom' | 'left';
interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
    content: ReactNode;
    side?: TooltipSide;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    children: ReactNode;
}
declare function Tooltip({ content, side, open, defaultOpen, onOpenChange, disabled, className, children, ...props }: TooltipProps): react_jsx_runtime.JSX.Element;

interface TemplateMasonryItem {
    id: string;
    title: string;
    description?: string;
    category?: string;
    thumbnail?: string;
}
interface TemplateMasonryGridProps {
    items: TemplateMasonryItem[];
    columns?: number;
    onSelect?: (item: TemplateMasonryItem) => void;
    onGenerateWithAI?: (item: TemplateMasonryItem) => void;
    className?: string;
}
declare function TemplateMasonryGrid({ items, columns, onSelect, onGenerateWithAI, className, }: TemplateMasonryGridProps): react_jsx_runtime.JSX.Element;

interface TaskDetailsField {
    label: string;
    value: ReactNode;
}
type TaskDetailsPresentation = 'overlay' | 'dock' | 'modal';
interface TaskDetailsSavePayload {
    title: string;
    description: string;
    assignee: string;
    assigneeAccountId: string | null;
    priority: TaskPriority;
    dueDateIso: string | null;
}
interface TaskDetailsPanelProps {
    task: TaskItemData | null;
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    /** `modal` = centered dialog (portaled); `overlay` = right sheet; `dock` = inline column. */
    presentation?: TaskDetailsPresentation;
    extraFields?: TaskDetailsField[];
    onStatusChange?: (status: TaskStatus) => void;
    /** When set, shows an editable form with Save / Discard. */
    onSaveDetails?: (payload: TaskDetailsSavePayload) => void | Promise<void>;
    /** Optional Jira-style assignee picker; values are account ids. */
    assigneeUserOptions?: SelectOption[];
    saving?: boolean;
    /** Disable editing even when `onSaveDetails` is set. */
    readOnly?: boolean;
    className?: string;
}
declare function TaskDetailsPanel({ task, open, onOpenChange, presentation, extraFields, onStatusChange, onSaveDetails, assigneeUserOptions, saving, readOnly, className, }: TaskDetailsPanelProps): react_jsx_runtime.JSX.Element | null;

interface IntegrationPlaceholderProps {
    name: string;
    description: string;
    icon?: ReactNode;
    connected?: boolean;
    onConnect?: () => void;
    onDisconnect?: () => void;
    /** Overrides the default “Connect” label on the primary action. */
    connectLabel?: string;
    className?: string;
}
declare function IntegrationPlaceholder({ name, description, icon, connected, onConnect, onDisconnect, connectLabel, className, }: IntegrationPlaceholderProps): react_jsx_runtime.JSX.Element;

/**
 * Semantic CSS variable names from @citron-systems/citron-ds (resolved values follow [data-theme] on documentElement).
 */
declare const semanticBackgroundPrimary = "var(--inkblot-semantic-color-background-primary)";
declare const semanticBackgroundSecondary = "var(--inkblot-semantic-color-background-secondary)";
declare const semanticBorderDefault = "var(--inkblot-semantic-color-border-default)";
declare const semanticTextPrimary = "var(--inkblot-semantic-color-text-primary)";
declare const semanticTextSecondary = "var(--inkblot-semantic-color-text-secondary)";
declare const semanticInteractivePrimary = "var(--inkblot-semantic-color-interactive-primary)";
declare const semanticInteractiveSecondary = "var(--inkblot-semantic-color-interactive-secondary)";
declare const semanticInteractiveSecondaryHover = "var(--inkblot-semantic-color-interactive-secondary-hover)";

export { AIComposeInput, type AIComposeInputProps, AIEmailGenerator, type AIEmailGeneratorProps, Accordion, type AccordionItem, type AccordionProps, type ActionButtonItem, ActionButtons, type ActionButtonsProps, ActivityStream, type ActivityStreamProps, AdvancedDropdown, type AdvancedDropdownOption, type AdvancedDropdownProps, Alert, AlertDialog, type AlertDialogProps, type AlertProps, type AlertVariant, AppLayout, type AppLayoutProps, AppNavigationRail, type AppNavigationRailItem, type AppNavigationRailProps, AppSidebar, type AppSidebarItem, type AppSidebarProps, AspectRatio, type AspectRatioProps, type AssistantMessage, AssistantPanel, type AssistantPanelProps, Avatar, type AvatarProps, type AvatarSize, Badge, type BadgeProps, type BadgeVariant, type BlockType, Breadcrumb, type BreadcrumbItem, type BreadcrumbProps, Button, type ButtonProps, type ButtonVariant, CITRON_THEME_STORAGE_KEY, Calendar, type CalendarProps, type CampaignStatus, CampaignTable, type CampaignTableProps, type CampaignTableRow, type CanvasBlock, type CanvasContextValue, CanvasProvider, type CanvasProviderProps, Card, CardContent, CardDescription, CardFooter, CardHeader, type CardProps, CardTitle, Carousel, type CarouselProps, CenteredAIChat, type CenteredAIChatAgent, type CenteredAIChatComposePayload, type CenteredAIChatMessage, type CenteredAIChatProps, CenteredAssistantChat, type CenteredAssistantChatProps, Chart, type ChartDatum, type ChartProps, type ChatMessage, Checkbox, type CheckboxProps, CircularScore, type CircularScoreProps, type CitronEvent, type CitronTheme, Collapsible, type CollapsibleProps, Command, CommandBar, type CommandBarProps, CommandCanvas, type CommandCanvasCardType, type CommandCanvasMessage, type CommandCanvasProps, type CommandItem, type CommandProps, ContextMenu, type ContextMenuItem, type ContextMenuProps, Dialog, DialogClose, type DialogCloseProps, DialogContent, type DialogContentProps, DialogDescription, type DialogDescriptionProps, DialogFooter, type DialogFooterProps, DialogHeader, type DialogHeaderProps, type DialogProps, DialogTitle, type DialogTitleProps, DialogTrigger, type DialogTriggerProps, Drawer, DrawerClose, type DrawerCloseProps, DrawerContent, type DrawerContentProps, DrawerDescription, type DrawerDescriptionProps, DrawerFooter, type DrawerFooterProps, DrawerHeader, type DrawerHeaderProps, type DrawerProps, DrawerTitle, type DrawerTitleProps, DrawerTrigger, type DrawerTriggerProps, DropdownMenu, DropdownMenuContent, type DropdownMenuContentProps, DropdownMenuItem, type DropdownMenuItemProps, type DropdownMenuProps, DropdownMenuSeparator, type DropdownMenuSeparatorProps, DropdownMenuTrigger, type DropdownMenuTriggerProps, type Edge, type EmailBlock, EmailBlockEditor, type EmailBlockEditorProps, EmailCampaignsView, type EmailCampaignsViewProps, EmailComposeActionButtons, type EmailTemplateItem, EmailTemplatesSection, type EmailTemplatesSectionProps, EntityCard, type EntityCardProps, type EntityCardStat, EntityCommandCard, type EntityCommandCardProps, type EntityCommandCardStat, type EntityType, ErrorBoundary, type ErrorBoundaryProps, EventFeed, type EventFeedItem, type EventFeedProps, EventRow, type EventRowProps, type EventStatus, type EventStreamEvent, EventStreamFeed, type EventStreamFeedProps, EventStreamSidebar, type EventStreamSidebarProps, type EventStreamStatus, Form, FormActions, type FormActionsProps, FormField, type FormFieldProps, type FormProps, GlobalAssistantChat, type GlobalAssistantChatProps, type GraphEdge, type GraphNode$1 as GraphNode, GraphView, type GraphViewProps, GuidedTour, type GuidedTourProps, type GuidedTourStep, HoverCard, HoverCardContent, type HoverCardContentProps, type HoverCardProps, HoverCardTrigger, type HoverCardTriggerProps, Input, InputOtp, type InputOtpProps, type InputProps, IntegrationPlaceholder, type IntegrationPlaceholderProps, IntelligenceCard, type IntelligenceCardProps, IntelligenceLab, type IntelligenceLabInsight, type IntelligenceLabKpiCard, type IntelligenceLabProps, IntelligenceScoreCard, type IntelligenceScoreCardProps, type IntelligenceScoreItem, type InvoiceClient, InvoiceEditorPage, type InvoiceEditorPageProps, InvoiceForm, type InvoiceFormData, type InvoiceFormProps, InvoicePreview, type InvoicePreviewProps, type InvoiceProduct, Label, type LabelProps, MainShell, type MainShellProps, Menubar, MenubarCloseZone, type MenubarCloseZoneProps, MenubarContent, type MenubarContentProps, MenubarItem, type MenubarItemProps, MenubarMenu, type MenubarMenuProps, type MenubarProps, MenubarSeparator, type MenubarSeparatorProps, MenubarTrigger, type MenubarTriggerProps, type MetricComparisonItem, MetricComparisonList, type MetricComparisonListProps, type MetricComparisonVariant, ModuleContainer, type ModuleContainerProps, ModuleErrorBoundary, type ModuleErrorBoundaryProps, ModuleSkeleton, type ModuleSkeletonProps, NavLink, type NavLinkProps, NavLinkRouter, type NavLinkRouterProps, NavigationMenu, type NavigationMenuItem, type NavigationMenuProps, OSNavigationRail, type OSNavigationRailItem, type OSNavigationRailProps, OnboardingWizard, type OnboardingWizardProps, PageErrorFallback, type PageErrorFallbackProps, PageHeader, PageHeaderActionButton, type PageHeaderActionButtonProps, type PageHeaderProps, Pagination, type PaginationProps, type PendingAttachment, Popover, PopoverClose, type PopoverCloseProps, PopoverContent, type PopoverContentProps, type PopoverProps, PopoverTrigger, type PopoverTriggerProps, Progress, type ProgressProps, RadioGroup, RadioGroupItem, type RadioGroupItemProps, type RadioGroupOption, type RadioGroupProps, Resizable, type ResizableProps, RouteWithErrorBoundary, type RouteWithErrorBoundaryProps, ScrollArea, type ScrollAreaProps, SearchBar, type SearchBarProps, Select, type SelectOption, type SelectProps, Separator, type SeparatorOrientation, type SeparatorProps, Sheet, type SheetProps, type SheetSide, Sidebar, type SidebarItem, type SidebarProps, Skeleton, type SkeletonProps, Slider, type SliderProps, Sonner, type SonnerProps, type StatCardChangeVariant, StatCardGrid, type StatCardGridProps, type StatCardItem, type StatCardWithChartItem, StatCards, type StatCardsProps, StatCardsWithChart, type StatCardsWithChartProps, StatusBadge, type StatusBadgeProps, type StatusBadgeVariant, Switch, type SwitchProps, type TabItem, TabSystem, type TabSystemProps, Table, TableBody, TableCaption, TableCell, TableEmptyState, TableHead, TableHeader, TableRow, type TableSortDirection, Tabs, type TabsItem, type TabsProps, TaskCreateForm, type TaskCreateFormProps, type TaskCreatePayload, type TaskDetailsField, TaskDetailsPanel, type TaskDetailsPanelProps, type TaskDetailsPresentation, type TaskDetailsSavePayload, TaskItem, type TaskItemData, type TaskItemProps, TaskKanbanBoard as TaskKanban, TaskKanbanBoard, type TaskKanbanBoardProps, TaskKanbanCard, type TaskKanbanCardProps, TaskKanbanColumn, type TaskKanbanColumnProps, type TaskKanbanBoardProps as TaskKanbanProps, TaskList, type TaskListProps, type TaskPriority, type TaskSection, type TaskStatus, type TaskWithStatus, TasksView, type TasksViewProps, TemplateCard, type TemplateCardProps, TemplateMasonryGrid, type TemplateMasonryGridProps, type TemplateMasonryItem, Textarea, type TextareaProps, type TextareaResize, type ThemeContextValue, ThemeProvider, ThemeSwitcherButton, type ThemeSwitcherButtonProps, Toast, type ToastAction, type ToastProps, type ToastVariant, Toaster, type ToasterItem, type ToasterPosition, type ToasterProps, Toggle, ToggleGroup, type ToggleGroupItem, type ToggleGroupProps, type ToggleGroupType, type ToggleProps, type ToggleSize, type ToggleVariant, Tooltip, type TooltipProps, type TooltipSide, applyTaskBoardDragResult, semanticBackgroundPrimary, semanticBackgroundSecondary, semanticBorderDefault, semanticInteractivePrimary, semanticInteractiveSecondary, semanticInteractiveSecondaryHover, semanticTextPrimary, semanticTextSecondary, useCanvas, useTheme };
