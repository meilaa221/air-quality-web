'use client'

import { useEffect, useState } from 'react'
import StatusCard from './StatusCard'
import AirQualityChart from './AirQualityChart'
import AlertBanner from './AlertBanner'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [showAlert, setShowAlert] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState('default')

  const fetchData = async () => {
    try {
      // Coba ambil data realtime dulu
      const realtimeRes = await fetch('/api/realtime')
      const realtimeResult = await realtimeRes.json()

      if (realtimeResult.data && realtimeResult.data.ppm !== null) {
        setData(realtimeResult.data)
        setLastUpdate(new Date())

        if (realtimeResult.isAlert) {
          setShowAlert(true)
        }
      } else {
        // Fallback ke data database jika realtime kosong
        const response = await fetch('/api/data')
        const result = await response.json()

        if (result.data) {
          setData(result.data)
          setLastUpdate(new Date())

          if (result.data.isAlert) {
            setShowAlert(true)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
    }
  }

  useEffect(() => {
    fetchData()
    // Auto refresh setiap 2 detik untuk realtime
    const interval = setInterval(fetchData, 2000)

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }

    return () => clearInterval(interval)
  }, [])

  const getAirQualityColor = (quality) => {
    switch (quality) {
      case 'Good': return 'from-green-500 to-emerald-400'
      case 'Moderate': return 'from-yellow-500 to-amber-400'
      case 'Poor': return 'from-orange-500 to-orange-400'
      case 'Dangerous': return 'from-red-500 to-red-400'
      default: return 'from-gray-500 to-gray-400'
    }
  }

  const getAirQualityBg = (quality) => {
    switch (quality) {
      case 'Good': return 'bg-green-50 border-green-200'
      case 'Moderate': return 'bg-yellow-50 border-yellow-200'
      case 'Poor': return 'bg-orange-50 border-orange-200'
      case 'Dangerous': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="w-20 h-20 border-4 border-blue-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
          </div>
          <p className="text-gray-600 mt-4 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AlertBanner
        show={showAlert}
        ppm={data?.ppm}
        onClose={() => setShowAlert(false)}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Monitoring kualitas udara secara real-time
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live
            </div>

            {notificationPermission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
              >
                Aktifkan Notifikasi
              </button>
            )}
            {lastUpdate && (
              <div className="text-right">
                <p className="text-xs text-gray-400">Terakhir diperbarui</p>
                <p className="text-sm font-medium text-gray-600">
                  {lastUpdate.toLocaleTimeString('id-ID')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Status Card */}
      <div className={`rounded-2xl p-6 mb-8 border-2 ${getAirQualityBg(data?.airQuality)}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAirQualityColor(data?.airQuality)} flex items-center justify-center shadow-lg`}>
              <span className="text-3xl">
                {data?.airQuality === 'Good' ? '🌸' :
                 data?.airQuality === 'Moderate' ? '🌤️' :
                 data?.airQuality === 'Poor' ? '🌫️' : '👻'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Status Kualitas Udara</p>
              <h2 className="text-2xl font-bold text-gray-800">{data?.airQuality || '--'}</h2>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-800">{data?.ppm || '--'}</p>
              <p className="text-sm text-gray-500">PPM</p>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-800">{data?.temperature !== null ? data?.temperature : '--'}</p>
              <p className="text-sm text-gray-500">Suhu</p>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-800">{data?.humidity !== null ? data?.humidity : '--'}</p>
              <p className="text-sm text-gray-500">Kelembaban</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatusCard
          title="Level PPM"
          value={data?.ppm}
          unit="PPM"
          status={data?.airQuality}
          icon="💨"
          gradient="from-blue-500 to-cyan-400"
        />

        <StatusCard
          title="Kualitas Udara"
          value={data?.airQuality || '--'}
          status={data?.airQuality}
          icon="🌬️"
          gradient="from-emerald-500 to-green-400"
        />

        <StatusCard
          title="Suhu"
          value={data?.temperature !== null ? data?.temperature : '--'}
          unit="°C"
          status={data?.temperature > 35 ? 'Hot' : data?.temperature < 20 ? 'Cold' : 'Normal'}
          icon="🌡️"
          gradient="from-orange-500 to-amber-400"
        />

        <StatusCard
          title="Kelembaban"
          value={data?.humidity !== null ? data?.humidity : '--'}
          unit="%"
          status={data?.humidity > 70 ? 'High' : data?.humidity < 30 ? 'Low' : 'Normal'}
          icon="💧"
          gradient="from-sky-500 to-blue-400"
        />

        <StatusCard
          title="Gerakan (PIR)"
          value={data?.motion ? 'Terdeteksi' : 'Tidak Ada'}
          status={data?.motion ? 'Active' : 'Inactive'}
          icon="🚶"
          gradient="from-purple-500 to-violet-400"
        />
      </div>

      {/* Chart */}
      <div className="mb-8">
        <AirQualityChart />
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Referensi Indeks Kualitas Udara (Rata-rata 5 Menit)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 mx-auto mb-3 shadow-lg shadow-green-500/30"></div>
            <p className="text-sm font-semibold text-green-700">Good</p>
            <p className="text-xs text-gray-500 mt-1">&lt; 500 PPM</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-amber-400 mx-auto mb-3 shadow-lg shadow-yellow-500/30"></div>
            <p className="text-sm font-semibold text-yellow-700">Moderate</p>
            <p className="text-xs text-gray-500 mt-1">500 - 999 PPM</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-400 mx-auto mb-3 shadow-lg shadow-orange-500/30"></div>
            <p className="text-sm font-semibold text-orange-700">Poor</p>
            <p className="text-xs text-gray-500 mt-1">1000 - 1999 PPM</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-400 mx-auto mb-3 shadow-lg shadow-red-500/30"></div>
            <p className="text-sm font-semibold text-red-700">Dangerous</p>
            <p className="text-xs text-gray-500 mt-1">&gt;= 2000 PPM</p>
          </div>
        </div>
      </div>
    </div>
  )
}
