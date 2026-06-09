'use client'

import { useState, useEffect } from 'react'
import { Clock, Plus, Trash2, Check, X } from 'lucide-react'

interface TimeRange {
  id: string
  openTime: string
  closeTime: string
}

interface DaySchedule {
  day: string
  isOpen: boolean
  is24Hours: boolean
  timeRanges: TimeRange[]
}

interface BusinessHoursEditorProps {
  businessHours?: DaySchedule[]
  onUpdate: (hours: DaySchedule[]) => void
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
]

const DEFAULT_TIME_RANGES: TimeRange[] = [
  { id: '1', openTime: '09:00', closeTime: '17:00' }
]

const DEFAULT_SCHEDULE: DaySchedule[] = DAYS_OF_WEEK.map(day => ({
  day: day.key,
  isOpen: day.key !== 'sunday',
  is24Hours: false,
  timeRanges: [...DEFAULT_TIME_RANGES]
}))

export default function BusinessHoursTableEditor({ businessHours, onUpdate }: BusinessHoursEditorProps) {
  const [schedule, setSchedule] = useState<DaySchedule[]>(businessHours || DEFAULT_SCHEDULE)
  const [is24_7, setIs24_7] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (businessHours) {
      setSchedule(businessHours)
    }
  }, [businessHours])

  const handleAddTimeRange = (dayIndex: number) => {
    const newSchedule = [...schedule]
    const newTimeRange: TimeRange = {
      id: Date.now().toString(),
      openTime: '09:00',
      closeTime: '17:00'
    }
    newSchedule[dayIndex].timeRanges.push(newTimeRange)
    setSchedule(newSchedule)
    setHasChanges(true)
  }

  const handleRemoveTimeRange = (dayIndex: number, timeRangeIndex: number) => {
    const newSchedule = [...schedule]
    if (newSchedule[dayIndex].timeRanges.length > 1) {
      newSchedule[dayIndex].timeRanges.splice(timeRangeIndex, 1)
      setSchedule(newSchedule)
      setHasChanges(true)
    }
  }

  const handleTimeChange = (dayIndex: number, timeRangeIndex: number, field: 'openTime' | 'closeTime', value: string) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].timeRanges[timeRangeIndex][field] = value
    setSchedule(newSchedule)
    setHasChanges(true)
  }

  const handleDayToggle = (dayIndex: number) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].isOpen = !newSchedule[dayIndex].isOpen
    setSchedule(newSchedule)
    setHasChanges(true)
  }

  const handle24_7Toggle = () => {
    const newValue = !is24_7
    setIs24_7(newValue)
    
    if (newValue) {
      // Enable all days and set to 24 hours
      const newSchedule = schedule.map(day => ({
        ...day,
        isOpen: true,
        is24Hours: true
      }))
      setSchedule(newSchedule)
    }
    setHasChanges(true)
  }

  const handleUpdate = () => {
    onUpdate(schedule)
    setHasChanges(false)
  }

  const handleCancel = () => {
    setSchedule(businessHours || DEFAULT_SCHEDULE)
    setHasChanges(false)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
        </div>
        
        {/* 24/7 Toggle */}
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={is24_7}
              onChange={handle24_7Toggle}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">24/7 Open</span>
          </label>
        </div>
      </div>

      {/* Business Hours Table */}
      {!is24_7 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Weekday</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Open Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Close Time</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schedule.map((daySchedule, dayIndex) => (
                <tr key={daySchedule.day} className={!daySchedule.isOpen ? 'bg-gray-50' : ''}>
                  {/* Weekday */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={daySchedule.isOpen}
                        onChange={() => handleDayToggle(dayIndex)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className={`text-sm font-medium ${daySchedule.isOpen ? 'text-gray-900' : 'text-gray-500'}`}>
                        {DAYS_OF_WEEK.find(d => d.key === daySchedule.day)?.label}
                      </span>
                    </div>
                  </td>

                  {/* Time Ranges */}
                  <td colSpan={3} className="py-3 px-4">
                    {daySchedule.isOpen && (
                      <div className="space-y-2">
                        {daySchedule.timeRanges.map((timeRange, timeIndex) => (
                          <div key={timeRange.id} className="flex items-center space-x-3">
                            {/* Open Time */}
                            <div className="flex items-center space-x-1">
                              <input
                                type="time"
                                value={timeRange.openTime}
                                onChange={(e) => handleTimeChange(dayIndex, timeIndex, 'openTime', e.target.value)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            <span className="text-gray-500">-</span>

                            {/* Close Time */}
                            <div className="flex items-center space-x-1">
                              <input
                                type="time"
                                value={timeRange.closeTime}
                                onChange={(e) => handleTimeChange(dayIndex, timeIndex, 'closeTime', e.target.value)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>

                            {/* Remove Button */}
                            {daySchedule.timeRanges.length > 1 && (
                              <button
                                onClick={() => handleRemoveTimeRange(dayIndex, timeIndex)}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                title="Remove time range"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Add Button (only on last row) */}
                            {timeIndex === daySchedule.timeRanges.length - 1 && (
                              <button
                                onClick={() => handleAddTimeRange(dayIndex)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors ml-2"
                                title="Add time range"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {!daySchedule.isOpen && (
                      <span className="text-sm text-gray-500 italic">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 24/7 Message */}
      {is24_7 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Business is open 24/7</span>
          </div>
          <p className="text-green-600 text-sm mt-1">
            Manual business hours are disabled when 24/7 mode is enabled.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {hasChanges && (
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Update</span>
          </button>
        </div>
      )}
    </div>
  )
}
