import { NextResponse } from 'next/server'
import { getReadingsCollection } from '@/lib/mongodb'

export async function GET() {
  try {
    const readings = await getReadingsCollection()

    const latestReading = await readings
      .find({})
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray()

    if (latestReading.length === 0) {
      return NextResponse.json({
        data: null,
        message: 'No data available'
      })
    }

    const data = latestReading[0]

    return NextResponse.json({
      data: {
        ppm: data.ppm,
        airQuality: data.airQuality,
        temperature: data.temperature,
        humidity: data.humidity,
        motion: data.motion || false,
        timestamp: data.timestamp,
        isAlert: data.ppm >= 2000
      }
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
