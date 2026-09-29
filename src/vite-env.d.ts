/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `mock` (default) or `jharvis` to talk to a real backend. */
  readonly VITE_JHARVIS_SOURCE?: 'mock' | 'jharvis'
  /** Base URL of the jharvis HTTP API, required when SOURCE=jharvis. */
  readonly VITE_JHARVIS_URL?: string
  /** Optional websocket URL for streaming snapshots. */
  readonly VITE_JHARVIS_WS?: string
  /** Optional GraphQL endpoint for operator controls; defaults to `{URL}/graphql`. */
  readonly VITE_JHARVIS_GRAPHQL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
