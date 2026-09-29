import { useEffect, useMemo, type ReactNode } from 'react'
import { DataSourceContext } from './context'
import type { DataSource } from './types'
import { createMockSource } from './mock/mockSource'
import { createJharvisSource } from './jharvis/jharvisSource'

/**
 * Pick the feed from the environment. `VITE_JHARVIS_SOURCE=jharvis` plus
 * `VITE_JHARVIS_URL` switches the whole HUD onto a real backend.
 */
function resolveSource(): DataSource {
  const kind = import.meta.env.VITE_JHARVIS_SOURCE
  const baseUrl = import.meta.env.VITE_JHARVIS_URL

  if (kind === 'jharvis' && baseUrl) {
    return createJharvisSource({
      baseUrl,
      socketUrl: import.meta.env.VITE_JHARVIS_WS || undefined,
      graphqlUrl: import.meta.env.VITE_JHARVIS_GRAPHQL || undefined,
    })
  }

  return createMockSource()
}

interface JharvisProviderProps {
  children: ReactNode
  /** Inject a source directly; used by tests and Storybook-style harnesses. */
  source?: DataSource
}

export function JharvisProvider({ children, source }: JharvisProviderProps) {
  const resolved = useMemo(() => source ?? resolveSource(), [source])

  useEffect(() => {
    // Only dispose sources we created; an injected one belongs to its owner.
    if (source) return
    return () => resolved.dispose()
  }, [resolved, source])

  return <DataSourceContext.Provider value={resolved}>{children}</DataSourceContext.Provider>
}
