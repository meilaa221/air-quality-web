import { NextResponse } from 'next/server'
import { getReadingsCollection } from '@/lib/mongodb'

export async function POST(request) {
  try {
    const data = await request.json()

    const { ppm, airQuality, temperature, humidity, status, motion } = data

    if (ppm === undefined) {
      return NextResponse.json(
        { error: 'PPM value is required' },
        { status: 400 }
      )
    }

    const readings = await getReadingsCollection()

    const reading = {
      ppm: Number(ppm),
      airQuality: airQuality || status || getAirQualityStatus(ppm),
      temperature: temperature !== undefined ? Number(temperature) : null,
      humidity: humidity !== undefined ? Number(humidity) : null,
      motion: motion !== undefined ? Boolean(motion) : false,
      timestamp: new Date(),
    }

    await readings.insertOne(reading)

    return NextResponse.json({
      success: true,
      message: 'Data received',
      data: reading
    })
  } catch (error) {
    console.error('Error saving sensor data:', error)
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    )
  }
}

function getAirQualityStatus(ppm) {
  if (ppm < 500) return 'Good'
  if (ppm < 1000) return 'Moderate'
  if (ppm < 2000) return 'Poor'
  return 'Dangerous'
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to send sensor data',
    format: {
      ppm: 'number (required)',
      airQuality: 'string (optional)',
      temperature: 'number (optional)',
      humidity: 'number (optional)',
      motion: 'boolean (optional)'
    }
  })
}
