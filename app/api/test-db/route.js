import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

export async function GET() {
  const uri = process.env.MONGODB_URI

  // Check if environment variable exists
  if (!uri) {
    return NextResponse.json({
      status: 'ERROR',
      message: 'MONGODB_URI environment variable is not set',
      hint: 'Add MONGODB_URI in Vercel Settings → Environment Variables'
    })
  }

  // Show partial URI for debugging (hide password)
  const safeUri = uri.replace(/:([^@]+)@/, ':****@')

  try {
    // Try to connect
    const client = new MongoClient(uri)
    await client.connect()

    // Try to access database
    const db = client.db('airquality')
    const collections = await db.listCollections().toArray()

    // Try to count documents in readings collection
    const readings = db.collection('readings')
    const count = await readings.countDocuments()

    await client.close()

    return NextResponse.json({
      status: 'SUCCESS',
      message: 'MongoDB connection successful!',
      uri: safeUri,
      database: 'airquality',
      collections: collections.map(c => c.name),
      readingsCount: count
    })
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      message: 'MongoDB connection failed',
      error: error.message,
      uri: safeUri,
      hint: 'Check: 1) Network Access in MongoDB Atlas (allow 0.0.0.0/0), 2) Username/password correct, 3) Cluster name correct'
    })
  }
}

export const dynamic = 'force-dynamic'
