'use client'

export default function StatusCard({ title, value, unit, status, icon, gradient }) {
  const getStatusColor = () => {
    switch (status) {
      case 'Excellent':
        return 'bg-green-500'
      case 'Good':
        return 'bg-green-400'
      case 'Moderate':
        return 'bg-yellow-500'
      case 'Poor':
        return 'bg-orange-500'
      case 'Dangerous':
        return 'bg-red-500'
      case 'Active':
        return 'bg-blue-500'
      case 'Inactive':
        return 'bg-gray-400'
      case 'Hot':
        return 'bg-red-500'
      case 'Cold':
        return 'bg-blue-500'
      case 'Normal':
        return 'bg-green-500'
      case 'High':
        return 'bg-orange-500'
      case 'Low':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'Hot': return 'Panas'
      case 'Cold': return 'Dingin'
      case 'Normal': return 'Normal'
      case 'High': return 'Tinggi'
      case 'Low': return 'Rendah'
      case 'Active': return 'Aktif'
      case 'Inactive': return 'Tidak Aktif'
      default: return status
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">
          {title}
        </h3>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient || 'from-gray-500 to-gray-400'} flex items-center justify-center shadow-md`}>
          <span className="text-lg">{icon}</span>
        </div>
      </div>

      <div className="flex items-end gap-2 mb-3">
        <span className="text-3xl font-bold text-gray-800">
          {value !== null && value !== undefined ? value : '--'}
        </span>
        {unit && (
          <span className="text-gray-500 text-lg mb-1">{unit}</span>
        )}
      </div>

      {status && (
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor()} ${status === 'Active' ? 'animate-pulse' : ''}`}></span>
          <span className="text-sm text-gray-600 font-medium">{getStatusText()}</span>
        </div>
      )}
    </div>
  )
}
