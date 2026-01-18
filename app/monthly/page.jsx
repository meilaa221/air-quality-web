'use client'

import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function MonthlyPage() {
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [months, setMonths] = useState(6)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/stats/monthly?months=${months}`)
      const result = await response.json()

      if (result.data) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Error fetching monthly stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [months])

  const getAirQualityColor = (quality) => {
    switch (quality) {
      case 'Good': return 'bg-green-100 text-green-700 border-green-200'
      case 'Moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Poor': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'Dangerous': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const chartData = {
    labels: stats.map(stat => stat.monthName),
    datasets: [
      {
        label: 'Rata-rata PPM',
        data: stats.map(stat => stat.avgPpm),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Max PPM',
        data: stats.map(stat => stat.maxPpm),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  }

  const tempHumData = {
    labels: stats.map(stat => stat.monthName),
    datasets: [
      {
        label: 'Suhu (°C)',
        data: stats.map(stat => stat.avgTemperature),
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Kelembaban (%)',
        data: stats.map(stat => stat.avgHumidity),
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
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
          <p className="text-gray-600 mt-4 font-medium">Memuat data bulanan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Rata-rata Bulanan
            </h1>
            <p className="text-gray-500 mt-1">
              Statistik kualitas udara per bulan
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Tampilkan:</span>
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={3}>3 Bulan Terakhir</option>
              <option value={6}>6 Bulan Terakhir</option>
              <option value={12}>12 Bulan Terakhir</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <span className="text-sm text-gray-500">Rata-rata PPM</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {(stats.reduce((acc, s) => acc + s.avgPpm, 0) / stats.length).toFixed(1)}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-400 flex items-center justify-center">
                <span className="text-lg">⚠️</span>
              </div>
              <span className="text-sm text-gray-500">Hari Berbahaya</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {stats.reduce((acc, s) => acc + s.dangerousDays, 0)}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center">
                <span className="text-lg">📈</span>
              </div>
              <span className="text-sm text-gray-500">Total Pembacaan</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {stats.reduce((acc, s) => acc + s.totalReadings, 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-400 flex items-center justify-center">
                <span className="text-lg">🚶</span>
              </div>
              <span className="text-sm text-gray-500">Total Gerakan</span>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {stats.reduce((acc, s) => acc + s.motionCount, 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">PPM Bulanan</h3>
          <div className="h-72">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Suhu & Kelembaban</h3>
          <div className="h-72">
            <Line data={tempHumData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Detail Bulanan</h3>
        </div>

        {stats.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Belum ada data untuk periode ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bulan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">PPM (Min/Avg/Max)</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Suhu</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kelembaban</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hari Bahaya</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pembacaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.map((stat, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{stat.dateFormatted}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getAirQualityColor(stat.airQuality)}`}>
                        {stat.airQuality}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-blue-600">{stat.minPpm}</span>
                        <span className="text-gray-400">/</span>
                        <span className="font-semibold text-gray-800">{stat.avgPpm}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-red-600">{stat.maxPpm}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {stat.avgTemperature ? `${stat.avgTemperature}°C` : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {stat.avgHumidity ? `${stat.avgHumidity}%` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${stat.dangerousDays > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {stat.dangerousDays}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {stat.totalReadings.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
