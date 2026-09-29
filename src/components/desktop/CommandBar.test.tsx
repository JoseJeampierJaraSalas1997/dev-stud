import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { JharvisProvider } from '../../data/provider'
import { createJharvisSource } from '../../data/jharvis/jharvisSource'
import type { DataSource } from '../../data/types'
import { CommandBar } from './CommandBar'

let source: DataSource | undefined

afterEach(() => {
  source?.dispose()
  source = undefined
  vi.unstubAllGlobals()
})

describe('CommandBar kill switch', () => {
  it('AC-11 sends the setMode SUPERVISED mutation once armed and confirmed', () => {
    const fetchMock = vi.fn((_url: string, init?: RequestInit) =>
      Promise.resolve(
        new Response(JSON.stringify(init?.method === 'POST' ? { data: { setMode: true } } : {}), { status: 200 }),
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    source = createJharvisSource({ baseUrl: 'http://x', pollMs: 60_000 })

    render(
      <JharvisProvider source={source}>
        <CommandBar />
      </JharvisProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: '[ KILL-SWITCH ]' }))
    const posts = () => fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST')
    expect(posts()).toHaveLength(0)

    fireEvent.click(screen.getByRole('button', { name: '[ CONFIRMAR ]' }))
    expect(posts()).toHaveLength(1)
    const [url, init] = posts()[0]
    expect(url).toBe('http://x/graphql')
    const body = JSON.parse(String(init?.body)) as { query: string; variables: unknown }
    expect(body.query).toContain('setMode')
    expect(body.variables).toEqual({ mode: 'SUPERVISED' })
  })
})
