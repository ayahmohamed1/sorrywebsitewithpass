import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import giftData from '@/lib/giftData'
import GiftClient from '@/components/GiftClient'
import NotFound from '@/components/NotFound'

export default function GiftPage() {
  const { id } = useParams<{ id: string }>()
  const safeId = (id || 'aya').toLowerCase()
  const data = id ? giftData[safeId] : (giftData['aya'] || Object.values(giftData)[0])

  useEffect(() => {
    if (data) {
      document.title = `for you ${data.name}! 🎂`
    } else {
      document.title = 'Gift Not Found'
    }
  }, [data])

  if (!data) {
    return <NotFound />
  }

  return <GiftClient data={data} />
}
