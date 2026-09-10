import { Suspense, lazy } from 'react'
import { SceneFallback } from '../components/hud'
import { TopBar } from '../components/desktop/TopBar'
import { SideNav } from '../components/desktop/SideNav'
import { HardwareTelem } from '../components/desktop/HardwareTelem'
import { ThreadMap } from '../components/desktop/ThreadMap'

import { StateBar } from '../components/desktop/StateBar'
import { NeuralTranscript } from '../components/desktop/NeuralTranscript'
import { MissionCard } from '../components/desktop/MissionCard'
import { AgentsMesh } from '../components/desktop/AgentsMesh'
import { WorkingContextCard } from '../components/desktop/WorkingContext'
import { EventTimeline } from '../components/desktop/EventTimeline'
import { CommandBar } from '../components/desktop/CommandBar'

// three.js is ~600kB; keeping it out of the entry chunk lets the HUD paint
// its telemetry immediately and stream the 3D core in behind it.
const CoreViewport = lazy(() =>
  import('../components/desktop/CoreViewport').then((m) => ({ default: m.CoreViewport })),
)

/** JHARVIS OS — Command Center 2040. Three-column tactical deck. */
export function CommandCenter() {
  return (
    <>
      <TopBar />
      <SideNav />

      <div className="pl-64">
        <main className="relative min-h-screen w-full bg-background pt-14">
          <div className="w-full px-pad-md py-pad-md">
            <div className="flex w-full select-none flex-col text-on-surface">
              <div className="grid w-full grid-cols-12 gap-pad-sm xl:min-h-[calc(100vh-10.5rem)]">
                <section className="col-span-12 flex flex-col gap-pad-sm xl:col-span-3">
                  <HardwareTelem />
                  <ThreadMap />
                </section>

                <section className="col-span-12 flex flex-col gap-pad-sm xl:col-span-6">
                  <Suspense fallback={<SceneFallback className="h-[460px] w-full shadow-xl" />}>
                    <CoreViewport />
                  </Suspense>
                  <StateBar />
                  <NeuralTranscript />
                </section>

                <section className="col-span-12 flex flex-col gap-pad-sm xl:col-span-3">
                  <MissionCard />
                  <AgentsMesh>
                    <WorkingContextCard />
                    <EventTimeline />
                  </AgentsMesh>
                </section>
              </div>

              <CommandBar />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
