import { NextResponse } from 'next/server'
import { getReadingsCollection } from '@/lib/mongodb'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const hours = parseInt(searchParams.get('hours')) || 24
    const limit = parseInt(searchParams.get('limit')) || 100

    const readings = await getReadingsCollection()

    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - hours)

    const history = await readings
      .find({
        timestamp: { $gte: cutoffTime }
      })
      .sort({ timestamp: 1 })
      .limit(limit)
      .toArray()

    const formattedHistory = history.map(item => ({
      ppm: item.ppm,
      airQuality: item.airQuality,
      temperature: item.temperature,
      humidity: item.humidity,
      motion: item.motion || false,
      timestamp: item.timestamp
    }))

    return NextResponse.json({
      data: formattedHistory,
      count: formattedHistory.length,
      period: `${hours} hours`
    })
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
