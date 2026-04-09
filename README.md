# Tasks Manager — Module Federation Remote

Standalone Vite + React module that exposes the **Tasks Manager** UI as a [Module Federation](https://github.com/nicolo-ribaudo/module-federation-examples) remote. The host CRM (or any other React host) can dynamically import the component at runtime.

## Quick Start

```bash
npm install
npm run dev        # Vite dev server (port 5173 by default)
npm run dev:full   # vercel dev — serves both SPA + serverless /api routes locally
npm run build      # TypeScript check + production build
npm run preview    # preview production build locally
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE` | Origin prepended to `/api/jira/*` calls. In production, set to the deployment URL of this remote (e.g. `https://citron-tasks-manager.vercel.app`). Leave empty for local dev. | `""` |

Copy `.env.example` to `.env` and fill in as needed.

## Federation Config

| Key | Value |
|-----|-------|
| **Remote name** | `tasksManager` |
| **Entry file** | `remoteEntry.js` |
| **Exposed module** | `./TasksManager` |
| **Import path** | `tasksManager/TasksManager` |

### Production `remoteEntry.js` URL

After deploying to Vercel (or any static host), the entry is available at:

```
https://<your-deployment>/assets/remoteEntry.js
```

### Host Integration Example

In the host's `vite.config.ts`:

```ts
federation({
  name: 'host',
  remotes: {
    tasksManager: 'https://<your-deployment>/assets/remoteEntry.js',
  },
  shared: ['react', 'react-dom', 'react-router-dom'],
})
```

Then consume the component:

```tsx
const TasksManager = lazy(() => import('tasksManager/TasksManager'))

<Suspense fallback={<Loading />}>
  <TasksManager settingsHref="/settings" />
</Suspense>
```

### Props (optional)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `settingsHref` | `string` | `"/settings"` | URL for the "Go to Settings" link shown when Jira is not connected. |
| `onOpenSettings` | `() => void` | — | Callback alternative to `settingsHref`. When provided, the button calls this instead of navigating. |
| `initialJiraConfig` | `JiraConfig \| null` | — | Pre-loaded Jira config object. When provided, the module skips its own `localStorage` lookup. Useful if the host already manages Jira credentials. |

### Type Stub for the Host

Add a declaration file in the host project (e.g. `src/remote-types.d.ts`):

```ts
declare module 'tasksManager/TasksManager' {
  import type { ComponentType } from 'react'
  interface TasksManagerProps {
    settingsHref?: string
    onOpenSettings?: () => void
    initialJiraConfig?: { domain: string; email: string; apiToken: string } | null
  }
  const TasksManager: ComponentType<TasksManagerProps>
  export default TasksManager
}
```

## Shared Dependencies (host alignment)

The following packages are declared as `shared` in the federation config. The host must provide compatible versions to avoid duplicate React runtimes:

| Package | Version range |
|---------|---------------|
| `react` | `^19.2.4` |
| `react-dom` | `^19.2.4` |
| `react-router-dom` | `^7.13.0` |

## Serverless API

The `/api/jira/*` routes are Vercel serverless functions that proxy calls to Jira Cloud REST API v3. They are deployed alongside the static frontend. All endpoints set `Access-Control-Allow-Origin: *`.

## Deployment

```bash
npm run build       # generates dist/ with remoteEntry.js
vercel --prod       # deploy to Vercel (or connect the repo for auto-deploy)
```

Set `VITE_API_BASE` to the final production URL of this deployment before building, so the client-side code points `/api` calls to the correct origin.
