import { NextResponse } from 'next/server'

// Data realtime disimpan di memory (bukan database)
let realtimeData = {
  ppm: null,
  temperature: null,
  humidity: null,
  motion: false,
  airQuality: 'Good',
  timestamp: null
}

// POST - Terima data dari ESP32
export async function POST(request) {
  try {
    const data = await request.json()
    const { ppm, temperature, humidity, motion } = data

    realtimeData = {
      ppm: ppm !== undefined ? Number(ppm) : null,
      temperature: temperature !== undefined ? Number(temperature) : null,
      humidity: humidity !== undefined ? Number(humidity) : null,
      motion: motion !== undefined ? Boolean(motion) : false,
      airQuality: getAirQualityStatus(ppm),
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Website ambil data realtime
export async function GET() {
  return NextResponse.json({
    data: realtimeData,
    isAlert: realtimeData.ppm >= 2000
  })
}

function getAirQualityStatus(ppm) {
  if (ppm === null || ppm === undefined) return 'Unknown'
  if (ppm < 500) return 'Good'
  if (ppm < 1000) return 'Moderate'
  if (ppm < 2000) return 'Poor'
  return 'Dangerous'
}

export const dynamic = 'force-dynamic'
