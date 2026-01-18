'use client'

import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [hours, setHours] = useState(24)

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/history?hours=${hours}&limit=200`)
      const result = await response.json()

      if (result.data) {
        setHistory(result.data)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [hours])

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
    labels: history.map(item => {
      const date = new Date(item.timestamp)
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }),
    datasets: [
      {
        label: 'PPM',
        data: history.map(item => item.ppm),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 6
      },
      {
        label: 'Suhu (°C)',
        data: history.map(item => item.temperature),
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 6,
        yAxisID: 'y1'
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Riwayat ${hours} Jam Terakhir`
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'PPM'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Suhu (°C)'
        },
        grid: {
          drawOnChartArea: false
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
          <p className="text-gray-600 mt-4 font-medium">Memuat riwayat...</p>
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
              Riwayat Pembacaan
            </h1>
            <p className="text-gray-500 mt-1">
              Data pembacaan sensor secara detail
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Tampilkan:</span>
            <select
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={6}>6 Jam Terakhir</option>
              <option value={12}>12 Jam Terakhir</option>
              <option value={24}>24 Jam Terakhir</option>
              <option value={48}>48 Jam Terakhir</option>
              <option value={72}>72 Jam Terakhir</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
        <div className="h-96">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Detail Pembacaan</h3>
          <span className="text-sm text-gray-500">{history.length} data</span>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Belum ada data untuk periode ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Waktu</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">PPM</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Suhu</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kelembaban</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Gerakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.slice().reverse().map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">
                          {new Date(item.timestamp).toLocaleTimeString('id-ID')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getAirQualityColor(item.airQuality)}`}>
                        {item.airQuality}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800">{item.ppm}</span>
                      <span className="text-gray-500 text-sm ml-1">PPM</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.temperature ? `${item.temperature}°C` : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.humidity ? `${item.humidity}%` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {item.motion ? (
                        <span className="flex items-center gap-2 text-blue-600">
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                          Ya
                        </span>
                      ) : (
                        <span className="text-gray-400">Tidak</span>
                      )}
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
