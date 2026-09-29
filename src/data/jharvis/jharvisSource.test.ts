import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createJharvisSource, type JharvisSourceOptions } from './jharvisSource'
import type { DataSource } from '../types'

interface Mutation {
  url: string
  headers: Record<string, string>
  query: string
  variables: Record<string, unknown>
}

type Reply = () => Promise<Response>

const ok = (body: unknown): Reply => () => Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))

let fetchMock: ReturnType<typeof vi.fn>
let mutationReply: Reply
let source: DataSource | undefined

beforeEach(() => {
  vi.useFakeTimers()
  mutationReply = ok({ data: { setMode: true, setEnergy: true, setTactical: true } })
  fetchMock = vi.fn((_url: string, init?: RequestInit) => {
    if (init?.method === 'POST') return mutationReply()
    // Snapshot poll: an empty object is a valid partial frame, so the link goes live.
    return ok({})()
  })
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  source?.dispose()
  source = undefined
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

async function start(options: Partial<JharvisSourceOptions> = {}) {
  source = createJharvisSource({ baseUrl: 'http://x/', pollMs: 60_000, ...options })
  // Let the first poll resolve so the snapshot is `live`.
  await vi.advanceTimersByTimeAsync(0)
  return source
}

function mutations(): Mutation[] {
  return fetchMock.mock.calls
    .filter(([, init]) => (init as RequestInit | undefined)?.method === 'POST')
    .map(([url, init]) => {
      const request = init as RequestInit
      const body = JSON.parse(String(request.body)) as { query: string; variables: Record<string, unknown> }
      return { url: String(url), headers: request.headers as Record<string, string>, ...body }
    })
}

describe('createJharvisSource operator controls', () => {
  it('AC-1 sends setMode immediately as a GraphQL mutation to {baseUrl}/graphql', async () => {
    const src = await start()
    src.setMode?.('SUPERVISED')

    const sent = mutations()
    expect(sent).toHaveLength(1)
    expect(sent[0].url).toBe('http://x/graphql')
    expect(sent[0].headers['content-type']).toBe('application/json')
    expect(sent[0].query).toMatch(/mutation\b[\s\S]*setMode\(mode: \$mode\)/)
    expect(sent[0].variables).toEqual({ mode: 'SUPERVISED' })
  })

  it('AC-2 sends setEnergy after the coalescing window, energy.mode included', async () => {
    const src = await start()
    src.setEnergy?.({ propulsion: 40, mode: 'COMBAT' })
    expect(mutations()).toHaveLength(0)

    await vi.advanceTimersByTimeAsync(250)
    const sent = mutations()
    expect(sent).toHaveLength(1)
    expect(sent[0].query).toMatch(/setEnergy\(input: \$input\)/)
    expect(sent[0].variables).toEqual({ input: { propulsion: 40, mode: 'COMBAT' } })
  })

  it('AC-3 sends setTactical after the coalescing window', async () => {
    const src = await start()
    src.setTactical?.({ shieldDeployed: true })

    await vi.advanceTimersByTimeAsync(250)
    const sent = mutations()
    expect(sent).toHaveLength(1)
    expect(sent[0].query).toMatch(/setTactical\(input: \$input\)/)
    expect(sent[0].variables).toEqual({ input: { shieldDeployed: true } })
  })

  it('AC-4 honours an explicit graphqlUrl', async () => {
    const src = await start({ graphqlUrl: 'http://y/gql' })
    src.setMode?.('AUTONOMOUS')
    src.setTactical?.({ repulsorPowerPct: 10 })
    await vi.advanceTimersByTimeAsync(250)

    expect(mutations().map((m) => m.url)).toEqual(['http://y/gql', 'http://y/gql'])
  })

  it('AC-5 applies the change optimistically in a new frame without mutating the old one', async () => {
    const src = await start()
    const before = src.getSnapshot()
    expect(before.status).toBe('live')
    expect(before.session.mode).toBe('AUTONOMOUS')
    const onChange = vi.fn()
    src.subscribe(onChange)

    src.setMode?.('SUPERVISED')
    src.setEnergy?.({ propulsion: 12 })
    src.setTactical?.({ shieldDeployed: !before.tactical.shieldDeployed })

    const after = src.getSnapshot()
    expect(after).not.toBe(before)
    expect(after.session.mode).toBe('SUPERVISED')
    expect(after.energy.propulsion).toBe(12)
    expect(after.energy.armament).toBe(before.energy.armament)
    expect(after.tactical.shieldDeployed).toBe(!before.tactical.shieldDeployed)
    expect(before.session.mode).toBe('AUTONOMOUS')
    expect(onChange).toHaveBeenCalledTimes(3)
  })

  it('AC-6 marks the link as error on HTTP 500 and keeps the optimistic value', async () => {
    mutationReply = () => Promise.resolve(new Response('boom', { status: 500 }))
    const src = await start()
    src.setMode?.('SUPERVISED')
    await vi.advanceTimersByTimeAsync(0)

    expect(src.getSnapshot().status).toBe('error')
    expect(src.getSnapshot().session.mode).toBe('SUPERVISED')
  })

  it('AC-6 marks the link as error when fetch rejects', async () => {
    mutationReply = () => Promise.reject(new TypeError('network down'))
    const src = await start()
    src.setMode?.('SUPERVISED')
    await vi.advanceTimersByTimeAsync(0)

    expect(src.getSnapshot().status).toBe('error')
  })

  it.each([
    ['GraphQL errors', { errors: [{ message: 'denied' }] }],
    ['a false result', { data: { setMode: false } }],
  ])('AC-7 treats a 200 with %s as a failure', async (_label, body) => {
    mutationReply = ok(body)
    const src = await start()
    src.setMode?.('SUPERVISED')
    await vi.advanceTimersByTimeAsync(0)

    expect(src.getSnapshot().status).toBe('error')
  })

  it('AC-8 coalesces rapid setEnergy calls into one mutation with the latest values', async () => {
    const src = await start()
    src.setEnergy?.({ propulsion: 10 })
    await vi.advanceTimersByTimeAsync(40)
    src.setEnergy?.({ propulsion: 20 })
    await vi.advanceTimersByTimeAsync(40)
    src.setEnergy?.({ armament: 5 })
    await vi.advanceTimersByTimeAsync(40)
    src.setEnergy?.({ propulsion: 30 })
    await vi.advanceTimersByTimeAsync(40)
    src.setEnergy?.({ armament: 7 })

    await vi.advanceTimersByTimeAsync(250)
    const sent = mutations()
    expect(sent).toHaveLength(1)
    expect(sent[0].variables).toEqual({ input: { propulsion: 30, armament: 7 } })
  })

  it('AC-9 never holds setMode behind a pending coalesced control', async () => {
    const src = await start()
    src.setEnergy?.({ propulsion: 10 })
    src.setMode?.('SUPERVISED')

    const sent = mutations()
    expect(sent).toHaveLength(1)
    expect(sent[0].variables).toEqual({ mode: 'SUPERVISED' })

    await vi.advanceTimersByTimeAsync(250)
    expect(mutations()).toHaveLength(2)
  })

  it('AC-10 drops pending coalesced controls on dispose', async () => {
    const src = await start()
    src.setTactical?.({ repulsorPowerPct: 80 })
    src.dispose()
    source = undefined

    await vi.advanceTimersByTimeAsync(250)
    expect(mutations()).toHaveLength(0)
  })
})
