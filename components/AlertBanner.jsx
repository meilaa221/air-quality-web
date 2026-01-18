'use client'

import { useEffect } from 'react'

export default function AlertBanner({ show, ppm, onClose }) {
  useEffect(() => {
    if (show && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Air Quality Alert!', {
        body: `PPM level is ${ppm}. Air quality is poor!`,
        icon: '/alert-icon.png',
        tag: 'air-quality-alert'
      })
    }
  }, [show, ppm])

  if (!show) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-pulse">
      <div className="bg-red-600 text-white px-4 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="font-bold">Air Quality Alert!</p>
              <p className="text-sm">
                PPM level is {ppm}. Please ventilate the area immediately.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white hover:bg-red-700 rounded-full p-1 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
