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

export default function AirQualityChart() {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ppm')

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history?hours=24&limit=50')
      const result = await response.json()

      if (result.data && result.data.length > 0) {
        const labels = result.data.map(item => {
          const date = new Date(item.timestamp)
          return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          })
        })

        const ppmValues = result.data.map(item => item.ppm)
        const tempValues = result.data.map(item => item.temperature)
        const humValues = result.data.map(item => item.humidity)

        setChartData({
          labels,
          ppm: ppmValues,
          temperature: tempValues,
          humidity: humValues
        })
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
    const interval = setInterval(fetchHistory, 30000)
    return () => clearInterval(interval)
  }, [])

  const getChartConfig = () => {
    if (!chartData) return null

    const configs = {
      ppm: {
        label: 'PPM Level',
        data: chartData.ppm,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisTitle: 'PPM'
      },
      temperature: {
        label: 'Suhu (C)',
        data: chartData.temperature,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        yAxisTitle: 'Suhu (C)'
      },
      humidity: {
        label: 'Kelembaban (%)',
        data: chartData.humidity,
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        yAxisTitle: 'Kelembaban (%)'
      }
    }

    return configs[activeTab]
  }

  const config = getChartConfig()

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${config?.label || 'Value'}: ${context.parsed.y}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: config?.yAxisTitle || 'Value',
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6b7280'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Waktu',
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500'
          }
        },
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          maxTicksLimit: 10
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="h-80 flex items-center justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="w-12 h-12 border-4 border-blue-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!chartData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="h-80 flex flex-col items-center justify-center text-gray-500">
          <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>Belum ada data riwayat</p>
        </div>
      </div>
    )
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: config.label,
        data: config.data,
        borderColor: config.borderColor,
        backgroundColor: config.backgroundColor,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: config.borderColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  }

  const tabs = [
    { id: 'ppm', label: 'PPM', icon: '💨' },
    { id: 'temperature', label: 'Suhu', icon: '🌡️' },
    { id: 'humidity', label: 'Kelembaban', icon: '💧' }
  ]

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Riwayat 24 Jam Terakhir</h3>
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-80">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}
