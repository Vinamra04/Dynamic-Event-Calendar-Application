import { useState, useMemo, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { ChevronDown, Tag } from 'lucide-react'
import { useEvents } from '../hooks/useEvents'
import { EVENT_CATEGORIES } from '../utils/constants'

function UpcomingEvents() {
  const [isOpen, setIsOpen] = useState(false)
  const { events } = useEvents()
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && 
          !containerRef.current.contains(event.target) && 
          !event.target.closest('.upcoming-events-dropdown')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const upcomingEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return Object.entries(events)
      .reduce((acc, [date, dateEvents]) => {
        const eventDate = new Date(date)
        if (eventDate >= today) {
          return [...acc, ...dateEvents.map(event => ({ ...event, date }))]
        }
        return acc
      }, [])
      .sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA - dateB
        }
        return a.startTime.localeCompare(b.startTime)
      })
      .slice(0, 5) // Show only next 5 events
  }, [events])

  return (
    <div 
      className="upcoming-events-container" 
      ref={containerRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={(e) => {
        if (!e.relatedTarget?.closest('.upcoming-events-dropdown')) {
          setIsOpen(false)
        }
      }}
    >
      <Button className="upcoming-events-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span>Upcoming Events</span>
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <div className={`upcoming-events-dropdown ${isOpen ? 'open' : ''}`}>
        {upcomingEvents.length > 0 ? (
          <div className="upcoming-events-list">
            {upcomingEvents.map(event => (
              <div key={event.id} className="upcoming-event-item">
                <div className="upcoming-event-header">
                  <h4>{event.name}</h4>
                  <div className="event-category">
                    <Tag 
                      className="h-4 w-4" 
                      style={{ color: EVENT_CATEGORIES[event.category || 'OTHER'].color }} 
                    />
                    <span>{EVENT_CATEGORIES[event.category || 'OTHER'].label}</span>
                  </div>
                </div>
                <p className="upcoming-event-date">
                  {new Date(event.date).toLocaleDateString()} at {event.startTime}
                </p>
                {event.description && (
                  <p className="upcoming-event-description">{event.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="upcoming-events-empty">
            No upcoming events
          </div>
        )}
      </div>
    </div>
  )
}

export default UpcomingEvents 