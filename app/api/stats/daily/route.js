import { NextResponse } from 'next/server'
import { getReadingsCollection } from '@/lib/mongodb'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days')) || 7

    const readings = await getReadingsCollection()

    const cutoffTime = new Date()
    cutoffTime.setDate(cutoffTime.getDate() - days)

    const pipeline = [
      {
        $match: {
          timestamp: { $gte: cutoffTime }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          avgPpm: { $avg: '$ppm' },
          maxPpm: { $max: '$ppm' },
          minPpm: { $min: '$ppm' },
          avgTemperature: { $avg: '$temperature' },
          maxTemperature: { $max: '$temperature' },
          minTemperature: { $min: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          motionCount: {
            $sum: { $cond: [{ $eq: ['$motion', true] }, 1, 0] }
          },
          totalReadings: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          avgPpm: { $round: ['$avgPpm', 1] },
          maxPpm: { $round: ['$maxPpm', 1] },
          minPpm: { $round: ['$minPpm', 1] },
          avgTemperature: { $round: ['$avgTemperature', 1] },
          maxTemperature: { $round: ['$maxTemperature', 1] },
          minTemperature: { $round: ['$minTemperature', 1] },
          avgHumidity: { $round: ['$avgHumidity', 1] },
          motionCount: 1,
          totalReadings: 1
        }
      }
    ]

    const dailyStats = await readings.aggregate(pipeline).toArray()

    const formattedStats = dailyStats.map(stat => ({
      ...stat,
      airQuality: getAirQualityStatus(stat.avgPpm),
      dateFormatted: new Date(stat.date).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }))

    return NextResponse.json({
      data: formattedStats,
      count: formattedStats.length,
      period: `${days} days`
    })
  } catch (error) {
    console.error('Error fetching daily stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily stats' },
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

export const dynamic = 'force-dynamic'
export const revalidate = 0
