'use client'

import { useState, useEffect } from 'react'
import { SiteBusinessHours, BusinessHours } from '@/app/lib/types'

const DEFAULT_BUSINESS_HOURS: SiteBusinessHours = {
  isEnabled: false,
  is24_7: false, // Added missing required property
  timezone: 'America/New_York',
  displayFormat: '12h',
  hours: [
    { day: 'monday', isOpen: true, is24Hours: false, timeRanges: [{ openTime: '09:00', closeTime: '17:00' }] },
    { day: 'tuesday', isOpen: true, is24Hours: false, timeRanges: [{ openTime: '09:00', closeTime: '17:00' }] },
    { day: 'wednesday', isOpen: true, is24Hours: false, timeRanges: [{ openTime: '09:00', closeTime: '17:00' }] },
    { day: 'thursday', isOpen: true, is24Hours: false, timeRanges: [{ openTime: '09:00', closeTime: '17:00' }] },
    { day: 'friday', isOpen: true, is24Hours: false, timeRanges: [{ openTime: '09:00', closeTime: '17:00' }] },
    { day: 'saturday', isOpen: false, is24Hours: false, timeRanges: [] },
    { day: 'sunday', isOpen: false, is24Hours: false, timeRanges: [] },
  ],
}

export function useBusinessHours(initialHours?: SiteBusinessHours) {
  const [businessHours, setBusinessHours] = useState<SiteBusinessHours>(
    initialHours || DEFAULT_BUSINESS_HOURS
  )

  const updateBusinessHours = (updates: Partial<SiteBusinessHours>) => {
    setBusinessHours(prev => ({ ...prev, ...updates }))
  }

  const updateDayHours = (day: BusinessHours['day'], updates: Partial<BusinessHours>) => {
    setBusinessHours(prev => ({
      ...prev,
      hours: prev.hours.map(h => 
        h.day === day ? { ...h, ...updates } : h
      )
    }))
  }

  const setWeekdayHours = (openTime: string, closeTime: string) => {
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const
    const updatedHours = businessHours.hours.map(h => {
      if (weekdays.includes(h.day as any)) {
        return { ...h, isOpen: true, openTime, closeTime, is24Hours: false }
      }
      return h
    })
    setBusinessHours(prev => ({ ...prev, hours: updatedHours }))
  }

  const setWeekendHours = (openTime: string, closeTime: string) => {
    const weekends = ['saturday', 'sunday'] as const
    const updatedHours = businessHours.hours.map(h => {
      if (weekends.includes(h.day as any)) {
        return { ...h, isOpen: true, openTime, closeTime, is24Hours: false }
      }
      return h
    })
    setBusinessHours(prev => ({ ...prev, hours: updatedHours }))
  }

  const setAllDays24Hours = () => {
    const updatedHours = businessHours.hours.map(h => ({
      ...h,
      isOpen: true,
      is24Hours: true,
      openTime: '00:00',
      closeTime: '23:59'
    }))
    setBusinessHours(prev => ({ ...prev, hours: updatedHours }))
  }

  const closeAllDays = () => {
    const updatedHours = businessHours.hours.map(h => ({
      ...h,
      isOpen: false,
      is24Hours: false
    }))
    setBusinessHours(prev => ({ ...prev, hours: updatedHours }))
  }

  const isCurrentlyOpen = (date: Date = new Date()) => {
    if (!businessHours.isEnabled) return false

    const currentDay = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as BusinessHours['day']
    const currentTimeStr = date.toTimeString().slice(0, 5)

    const todayHours = businessHours.hours.find(h => h.day === currentDay)
    
    if (!todayHours || !todayHours.isOpen) return false
    
    if (todayHours.is24Hours) return true
    
    if (todayHours.timeRanges && todayHours.timeRanges.length > 0) {
      const firstRange = todayHours.timeRanges[0]
      return currentTimeStr >= firstRange.openTime && currentTimeStr <= firstRange.closeTime
    }
    
    return false
  }

  const getNextOpenTime = (date: Date = new Date()) => {
    if (!businessHours.isEnabled) return null

    const currentDay = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as BusinessHours['day']
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
    
    // Find next open day
    let dayIndex = days.indexOf(currentDay)
    let checkedDays = 0
    
    while (checkedDays < 7) {
      dayIndex = (dayIndex + 1) % 7
      const checkDay = days[dayIndex]
      const dayHours = businessHours.hours.find(h => h.day === checkDay)
      
      if (dayHours?.isOpen) {
        if (dayHours.is24Hours) {
          return { day: checkDay, time: '12:00 AM', isTomorrow: checkedDays > 0 }
        }
        if (dayHours.timeRanges && dayHours.timeRanges.length > 0) {
          return { 
            day: checkDay, 
            time: dayHours.timeRanges[0].openTime, 
            isTomorrow: checkedDays > 0 
          }
        }
      }
      checkedDays++
    }
    
    return null
  }

  const getTodayHours = (date: Date = new Date()) => {
    if (!businessHours.isEnabled) return null

    const currentDay = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as BusinessHours['day']
    return businessHours.hours.find(h => h.day === currentDay) || null
  }

  const formatTime = (time: string, format: '12h' | '24h' = businessHours.displayFormat) => {
    if (!time) return ''
    
    if (format === '12h') {
      const [hours, minutes] = time.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    }
    return time
  }

  const getDisplayText = (dayHours: BusinessHours) => {
    if (!dayHours.isOpen) return 'Closed'
    if (dayHours.is24Hours) return '24 Hours'
    if (dayHours.timeRanges && dayHours.timeRanges.length > 0) {
      const firstRange = dayHours.timeRanges[0]
      return `${formatTime(firstRange.openTime)} - ${formatTime(firstRange.closeTime)}`
    }
    return ''
  }

  return {
    businessHours,
    setBusinessHours,
    updateBusinessHours,
    updateDayHours,
    setWeekdayHours,
    setWeekendHours,
    setAllDays24Hours,
    closeAllDays,
    isCurrentlyOpen,
    getNextOpenTime,
    getTodayHours,
    formatTime,
    getDisplayText
  }
}

export default useBusinessHours
