import { useState, useEffect, useCallback } from 'react'

export function useEvents() {
  const [events, setEvents] = useState({})

  // Load events from localStorage on initial mount
  useEffect(() => {
    const storedEvents = localStorage.getItem('calendarEvents')
    if (storedEvents) {
      try {
        setEvents(JSON.parse(storedEvents))
      } catch (error) {
        console.error('Error loading events:', error)
        localStorage.removeItem('calendarEvents') // Clear invalid data
      }
    }
  }, [])

  // Save events to localStorage and update state
  const saveEvents = useCallback((newEvents) => {
    try {
      localStorage.setItem('calendarEvents', JSON.stringify(newEvents))
      setEvents(newEvents)
    } catch (error) {
      console.error('Error saving events:', error)
    }
  }, [])

  const addEvent = useCallback((event) => {
    if (!event.date) return // Validate required date
    
    setEvents(prevEvents => {
      const dateStr = event.date
      const updatedEvents = {
        ...prevEvents,
        [dateStr]: [...(prevEvents[dateStr] || []), event]
      }
      
      // Sort events by start time
      updatedEvents[dateStr].sort((a, b) => {
        const timeA = a.startTime.split(':').map(Number)
        const timeB = b.startTime.split(':').map(Number)
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1])
      })

      localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents))
      return updatedEvents
    })
  }, [])

  const updateEvent = useCallback((updatedEvent) => {
    setEvents(prevEvents => {
      const newEvents = { ...prevEvents }
      
      // Get the old date from the current event
      const oldDate = Object.entries(prevEvents).find(([_, events]) => 
        events.find(e => e.id === updatedEvent.id)
      )?.[0]
      
      // Remove event from old date
      if (oldDate) {
        newEvents[oldDate] = prevEvents[oldDate].filter(
          e => e.id !== updatedEvent.id
        )
        
        // Clean up if date has no events
        if (newEvents[oldDate].length === 0) {
          delete newEvents[oldDate]
        }
      }
      
      // Add event to new date
      if (!newEvents[updatedEvent.date]) {
        newEvents[updatedEvent.date] = []
      }
      newEvents[updatedEvent.date] = [
        ...newEvents[updatedEvent.date],
        updatedEvent
      ]
      
      // Sort events by start time
      newEvents[updatedEvent.date].sort((a, b) => {
        const timeA = a.startTime.split(':').map(Number)
        const timeB = b.startTime.split(':').map(Number)
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1])
      })
      
      // Save to localStorage
      localStorage.setItem('calendarEvents', JSON.stringify(newEvents))
      
      return newEvents
    })
  }, [])

  const deleteEvent = useCallback((eventId) => {
    setEvents(prevEvents => {
      const updatedEvents = {}
      let hasChanges = false

      // Remove the event and clean up empty dates
      Object.entries(prevEvents).forEach(([date, dateEvents]) => {
        const filteredEvents = dateEvents.filter(event => event.id !== eventId)
        if (filteredEvents.length > 0) {
          updatedEvents[date] = filteredEvents
        }
        if (filteredEvents.length !== dateEvents.length) {
          hasChanges = true
        }
      })

      if (hasChanges) {
        localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents))
        return updatedEvents
      }
      return prevEvents
    })
  }, [])

  // Helper function to get events for a specific date
  const getEventsForDate = useCallback((date) => {
    const dateStr = typeof date === 'string' ? date : formatDate(date)
    return events[dateStr] || []
  }, [events])

  return { 
    events, 
    addEvent, 
    updateEvent, 
    deleteEvent,
    getEventsForDate
  }
}

// Helper function to format date consistently
function formatDate(date) {
  if (!date) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
} 