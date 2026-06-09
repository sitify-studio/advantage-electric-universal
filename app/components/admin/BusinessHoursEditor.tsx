'use client'

import { useState, useEffect } from 'react'
import { Clock, Plus, Trash2, Globe } from 'lucide-react'
import { BusinessHours, SiteBusinessHours } from '@/app/lib/types'

interface BusinessHoursEditorProps {
  businessHours?: SiteBusinessHours
  onChange: (businessHours: SiteBusinessHours) => void
}

const DAYS_OF_WEEK: BusinessHours['day'][] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
]

const DAY_LABELS: Record<BusinessHours['day'], string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
}

const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney'
]

export default function BusinessHoursEditor({ businessHours, onChange }: BusinessHoursEditorProps) {
  const [isEnabled, setIsEnabled] = useState(businessHours?.isEnabled || false)
  const [timezone, setTimezone] = useState(businessHours?.timezone || 'America/New_York')
  const [displayFormat, setDisplayFormat] = useState<'12h' | '24h'>(businessHours?.displayFormat || '12h')
  const [hours, setHours] = useState<BusinessHours[]>(businessHours?.hours || [])

  // Initialize default hours if none exist
  useEffect(() => {
    if (hours.length === 0) {
      const defaultHours: BusinessHours[] = DAYS_OF_WEEK.map(day => ({
        day,
        isOpen: day !== 'sunday', // Closed on Sunday by default
        is24Hours: false,
        timeRanges: day !== 'sunday' ? [{
          openTime: '09:00',
          closeTime: '17:00'
        }] : [] // Empty time ranges for closed days
      }))
      setHours(defaultHours)
    }
  }, [hours.length])

  const updateBusinessHours = (updates: Partial<SiteBusinessHours>) => {
    const newBusinessHours: SiteBusinessHours = {
      isEnabled,
      is24_7: false, // Explicitly set to false since it's required
      timezone,
      displayFormat,
      hours,
      ...updates
    }
    onChange(newBusinessHours)
  }

  const updateDayHours = (dayIndex: number, updates: Partial<BusinessHours>) => {
    const newHours = [...hours]
    newHours[dayIndex] = { ...newHours[dayIndex], ...updates }
    setHours(newHours)
    updateBusinessHours({ hours: newHours })
  }

  const toggle24Hours = (dayIndex: number) => {
    const newHours = [...hours]
    const currentDay = newHours[dayIndex]
    const isCurrently24Hours = currentDay.is24Hours
    
    newHours[dayIndex] = {
      ...currentDay,
      is24Hours: !isCurrently24Hours,
      timeRanges: !isCurrently24Hours ? [{
        openTime: '00:00',
        closeTime: '23:59'
      }] : [{
        openTime: '09:00',
        closeTime: '17:00'
      }]
    }
    setHours(newHours)
    updateBusinessHours({ hours: newHours })
  }

  const formatTimeDisplay = (time: string) => {
    if (displayFormat === '12h') {
      const [hours, minutes] = time.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    }
    return time
  }

  const generateDisplayText = (dayHours: BusinessHours) => {
    if (!dayHours.isOpen) return 'Closed'
    if (dayHours.is24Hours) return '24 Hours'
    if (dayHours.timeRanges && dayHours.timeRanges.length > 0) {
      const firstRange = dayHours.timeRanges[0]
      return `${formatTimeDisplay(firstRange.openTime)} - ${formatTimeDisplay(firstRange.closeTime)}`
    }
    return ''
  }

  if (!isEnabled) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Business Hours</h3>
              <p className="text-sm text-gray-500">Display your business operating hours</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsEnabled(true)
              updateBusinessHours({ isEnabled: true })
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enable Business Hours
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Business Hours</h3>
            <p className="text-sm text-gray-500">Set your business operating hours</p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsEnabled(false)
            updateBusinessHours({ isEnabled: false })
          }}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Disable
        </button>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-1" />
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => {
              setTimezone(e.target.value)
              updateBusinessHours({ timezone: e.target.value })
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {COMMON_TIMEZONES.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Format
          </label>
          <select
            value={displayFormat}
            onChange={(e) => {
              const format = e.target.value as '12h' | '24h'
              setDisplayFormat(format)
              updateBusinessHours({ displayFormat: format })
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="12h">12-hour (9:00 AM - 5:00 PM)</option>
            <option value="24h">24-hour (09:00 - 17:00)</option>
          </select>
        </div>
      </div>

      {/* Daily Hours */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-gray-900">Daily Hours</h4>
        <div className="space-y-2">
          {DAYS_OF_WEEK.map((day, index) => {
            const dayHours = hours[index]
            if (!dayHours) return null

            return (
              <div key={day} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-24">
                  <label className="text-sm font-medium text-gray-700">{DAY_LABELS[day]}</label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={dayHours.isOpen}
                    onChange={(e) => updateDayHours(index, { isOpen: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Open</span>
                </div>

                {dayHours.isOpen && (
                  <>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={dayHours.is24Hours}
                        onChange={() => toggle24Hours(index)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">24 Hours</span>
                    </div>

                    {!dayHours.is24Hours && (
                      <>
                        <div>
                          <label className="sr-only">Open Time</label>
                          <input
                            type="time"
                            value={dayHours.timeRanges?.[0]?.openTime || ''}
                            onChange={(e) => updateDayHours(index, { 
                              timeRanges: [{ 
                                openTime: e.target.value, 
                                closeTime: dayHours.timeRanges?.[0]?.closeTime || '17:00' 
                              }] 
                            })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <span className="text-gray-500">to</span>

                        <div>
                          <label className="sr-only">Close Time</label>
                          <input
                            type="time"
                            value={dayHours.timeRanges?.[0]?.closeTime || ''}
                            onChange={(e) => updateDayHours(index, { 
                              timeRanges: [{ 
                                openTime: dayHours.timeRanges?.[0]?.openTime || '09:00', 
                                closeTime: e.target.value 
                              }] 
                            })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                <div className="flex-1 text-right">
                  <span className="text-sm text-gray-600">
                    {generateDisplayText(dayHours)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            const weekdaysHours = DAYS_OF_WEEK.map(day => ({
              day,
              isOpen: ['saturday', 'sunday'].includes(day) ? false : true,
              is24Hours: false,
              timeRanges: ['saturday', 'sunday'].includes(day) ? [] : [{
                openTime: '09:00',
                closeTime: '17:00'
              }]
            }))
            setHours(weekdaysHours)
            updateBusinessHours({ hours: weekdaysHours })
          }}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          Set Weekday Hours (9-5)
        </button>

        <button
          onClick={() => {
            const allDayHours = DAYS_OF_WEEK.map(day => ({
              day,
              isOpen: true,
              is24Hours: true,
              timeRanges: [{
                openTime: '00:00',
                closeTime: '23:59'
              }]
            }))
            setHours(allDayHours)
            updateBusinessHours({ hours: allDayHours })
          }}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          Set All Days 24/7
        </button>

        <button
          onClick={() => {
            const closedHours = DAYS_OF_WEEK.map(day => ({
              day,
              isOpen: false,
              is24Hours: false,
              timeRanges: [] // Empty time ranges for closed days
            }))
            setHours(closedHours)
            updateBusinessHours({ hours: closedHours })
          }}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
        >
          Close All Days
        </button>
      </div>
    </div>
  )
}
