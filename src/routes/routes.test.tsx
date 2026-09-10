import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { JharvisProvider } from '../data/provider'
import { createMockSource } from '../data/mock/mockSource'

function renderAt(path: string) {
  const source = createMockSource({ autoStart: false })
  const view = render(
    <MemoryRouter initialEntries={[path]}>
      <JharvisProvider source={source}>
        <App />
      </JharvisProvider>
    </MemoryRouter>,
  )
  return { ...view, source }
}

describe('routes', () => {
  it('mounts the command center at /', () => {
    const { source } = renderAt('/')
    expect(screen.getByText('JHARVIS_OS//v4.2')).toBeInTheDocument()
    expect(screen.getByText('HARDWARE_TELEM')).toBeInTheDocument()
    expect(screen.getByText('AGENTS_MESH')).toBeInTheDocument()
    source.dispose()
  })

  it('mounts the reactor HUD at /hud', () => {
    const { source } = renderAt('/hud')
    expect(screen.getByText('STARK OS v42.8 // J.A.R.V.I.S.')).toBeInTheDocument()
    expect(screen.getByText(/DISTRIBUCIÓN ENERGÉTICA/)).toBeInTheDocument()
    source.dispose()
  })

  it('shows the scene placeholder before the 3D chunk arrives', () => {
    const { source } = renderAt('/hud')
    expect(screen.getByText(/INICIALIZANDO REACTOR MK-85/)).toBeInTheDocument()
    source.dispose()
  })

  it('redirects an unknown path to the command center', () => {
    const { source } = renderAt('/no-such-deck')
    expect(screen.getByText('JHARVIS_OS//v4.2')).toBeInTheDocument()
    source.dispose()
  })

  it('resolves the lazy 3D panel, then unmounts it without throwing', async () => {
    const { unmount, source } = renderAt('/hud')

    // Wait for the real scene chunk, not just the Suspense fallback.
    await screen.findByText(/VISTA HOLOGRÁFICA \/\/ MK-85/)
    await waitFor(() => expect(screen.queryByText(/INICIALIZANDO REACTOR/)).not.toBeInTheDocument())

    expect(() => unmount()).not.toThrow()
    source.dispose()
  })

  it('resolves the lazy core viewport on the command center', async () => {
    const { unmount, source } = renderAt('/')
    await screen.findByText(/AUDIO HARMONICS:/)
    expect(() => unmount()).not.toThrow()
    source.dispose()
  })
})

describe('command bar', () => {
  it('dispatches the typed command and clears the field', async () => {
    const user = userEvent.setup()
    const { source } = renderAt('/')

    const input = screen.getByLabelText('EXEC::>')
    await user.type(input, 'Consolida la cartera Q3')
    await user.click(screen.getByRole('button', { name: /AGENT DISPATCH/ }))

    expect(input).toHaveValue('')
    expect(source.getSnapshot().transcript.at(-1)?.text).toBe('Consolida la cartera Q3')
    source.dispose()
  })

  it('keeps dispatch disabled while the field is empty', () => {
    const { source } = renderAt('/')
    expect(screen.getByRole('button', { name: /AGENT DISPATCH/ })).toBeDisabled()
    source.dispose()
  })

  it('arms the kill switch before halting autonomy', async () => {
    const user = userEvent.setup()
    const { source } = renderAt('/')

    const kill = screen.getByRole('button', { name: /KILL-SWITCH/ })
    await user.click(kill)

    // First press only arms it — autonomy must still be running.
    expect(source.getSnapshot().session.mode).toBe('AUTONOMOUS')

    await user.click(screen.getByRole('button', { name: /CONFIRMAR/ }))
    expect(source.getSnapshot().session.mode).toBe('SUPERVISED')
    source.dispose()
  })
})

describe('tactical controls', () => {
  it('writes slider changes back through the source', async () => {
    const user = userEvent.setup()
    const { source } = renderAt('/hud')

    await user.click(screen.getByRole('button', { name: /DESPLIEGUE INSTANTÁNEO DE BARRERA/ }))
    expect(source.getSnapshot().tactical.shieldDeployed).toBe(true)
    source.dispose()
  })
})
