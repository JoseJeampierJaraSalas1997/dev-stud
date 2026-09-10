import { Navigate, Route, Routes } from 'react-router-dom'
import { CommandCenter } from './routes/CommandCenter'
import { ReactorHud } from './routes/ReactorHud'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CommandCenter />} />
      <Route path="/hud" element={<ReactorHud />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
