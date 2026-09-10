import { Suspense, lazy } from 'react'
import { SceneFallback } from '../components/hud'
import { MobileHeader } from '../components/mobile/MobileHeader'
import { StatusMarquee } from '../components/mobile/StatusMarquee'
import { VoiceModule } from '../components/mobile/VoiceModule'
import { TacticalControls } from '../components/mobile/TacticalControls'
import { Biometrics } from '../components/mobile/Biometrics'
import { TabBar } from '../components/mobile/TabBar'

const ReactorStage = lazy(() =>
  import('../components/mobile/ReactorStage').then((m) => ({ default: m.ReactorStage })),
)

/** J.A.R.V.I.S. Arc Reactor HUD — the mobile-first tactical console. */
export function ReactorHud() {
  return (
    <>
      <MobileHeader />

      <main className="relative flex min-h-screen w-full flex-col bg-surface pt-20 pb-20">
        {/* The design is a 390px HUD; on wide screens it stays centred rather
            than stretching its dense tiles across a desktop viewport. */}
        <div className="mx-auto flex w-full max-w-md flex-col gap-space-lg px-space-base pb-space-2xl">
          <StatusMarquee />
          <Suspense
            fallback={<SceneFallback className="h-[420px] w-full rounded-xl" label="INICIALIZANDO REACTOR MK-85" />}
          >
            <ReactorStage />
          </Suspense>
          <VoiceModule />
          <TacticalControls />
          <Biometrics />
        </div>
      </main>

      <TabBar />
    </>
  )
}
