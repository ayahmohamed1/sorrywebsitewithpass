import { Routes, Route } from 'react-router-dom'
import GiftPage from '@/pages/GiftPage'
import NotFound from '@/components/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GiftPage />} />
      <Route path="/gift/:id" element={<GiftPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
