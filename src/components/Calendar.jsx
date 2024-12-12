import { useState, useEffect, useMemo, memo } from 'react'
import { 
  DndContext, 
  useDraggable,
  useDroppable,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor
} from '@dnd-kit/core'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight, ChevronDown, Download, Tag } from 'lucide-react'
import { getMonthData, formatDate } from '../utils/calendarUtils'
import { useEvents } from '../hooks/useEvents'
import { EVENT_CATEGORIES } from '../utils/constants'
import { ErrorModal } from './ui/error-modal'

const MonthYearPicker = ({ 
  currentDate, 
  onMonthChange, 
  onYearChange, 
  isOpen, 
  onToggle 
}) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  
  // Generate array of years (10 years before and after current year)
  const currentYear = currentDate.getFullYear()
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

  return (
    <div className="month-year-picker">
      <Button 
        variant="ghost" 
        className="month-year-button"
        onClick={onToggle}
      >
        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="picker-dropdown">
          <div className="picker-section">
            <h3>Month</h3>
            <div className="picker-options months">
              {months.map((month, index) => (
                <button
                  key={month}
                  className={`picker-option ${currentDate.getMonth() === index ? 'selected' : ''}`}
                  onClick={() => onMonthChange(index)}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
          <div className="picker-section">
            <h3>Year</h3>
            <div className="picker-options years">
              {years.map(year => (
                <button
                  key={year}
                  className={`picker-option ${currentDate.getFullYear() === year ? 'selected' : ''}`}
                  onClick={() => onYearChange(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const DraggableEventDot = ({ event, category, style }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: event.id,
    data: { event }
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="event-dot"
      data-tooltip={event.name}
      style={{
        ...style,
        backgroundColor: EVENT_CATEGORIES[category].color,
        opacity: isDragging ? 0.3 : 1,
        cursor: 'grab'
      }}
    />
  )
}

const CalendarDay = memo(({ date, isSelected, events, onDateSelect }) => {
  const dateStr = date ? formatDate(date) : ''
  
  // Make sure the droppable area is properly configured
  const { setNodeRef, isOver } = useDroppable({
    id: dateStr,
    disabled: !date,
    data: {
      date: dateStr,
      events: events[dateStr] || []
    }
  })
  
  const dateEvents = date && events[dateStr] || []
  const isToday = date && formatDate(new Date()) === dateStr
  const isWeekend = date && (date.getDay() === 0 || date.getDay() === 6)
  
  const categoryEvents = dateEvents.reduce((acc, event) => {
    const category = event.category || 'OTHER'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(event)
    return acc
  }, {})

  return (
    <div
      ref={setNodeRef}
      className={`calendar-day ${!date ? 'empty' : ''} 
                 ${isToday ? 'today' : ''} 
                 ${isSelected ? 'selected' : ''} 
                 ${isWeekend ? 'weekend' : ''}
                 ${isOver && date ? 'drop-target' : ''}`}
      onClick={() => date && onDateSelect(date)}
    >
      {date?.getDate()}
      {Object.keys(categoryEvents).length > 0 && (
        <div className="event-dots">
          {Object.entries(categoryEvents).map(([category, events], index) => 
            events.map((event) => (
              <DraggableEventDot
                key={event.id}
                event={event}
                category={category}
                style={{
                  transform: `translateX(${(index - (Object.keys(categoryEvents).length - 1) / 2) * 10}px)`
                }}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
})

CalendarDay.displayName = 'CalendarDay'

function Calendar({ onDateSelect, selectedDate }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [draggedEvent, setDraggedEvent] = useState(null)
  const { events, updateEvent } = useEvents()
  const [errorModal, setErrorModal] = useState({
    show: false,
    message: '',
    conflictingEvent: null
  })
  
  // Helper function to check for time conflicts
  const hasTimeConflict = (event, date, existingEvents) => {
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number)
      return hours * 60 + minutes
    }

    const eventStart = timeToMinutes(event.startTime)
    const eventEnd = timeToMinutes(event.endTime)
    
    return existingEvents.some(existing => {
      // Skip comparing with itself
      if (existing.id === event.id) return false
      
      const existingStart = timeToMinutes(existing.startTime)
      const existingEnd = timeToMinutes(existing.endTime)

      // Check for any overlap
      const hasOverlap = (
        (eventStart >= existingStart && eventStart < existingEnd) || // New event starts during existing event
        (eventEnd > existingStart && eventEnd <= existingEnd) || // New event ends during existing event
        (eventStart <= existingStart && eventEnd >= existingEnd) // New event completely encompasses existing event
      )

      return hasOverlap
    })
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event) => {
    const eventData = event.active.data.current?.event
    if (eventData) {
      setDraggedEvent(eventData)
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    
    if (active && over && over.id) {
      const eventData = active.data.current?.event
      const newDate = over.id
      const targetDateEvents = events[newDate] || []

      if (eventData && newDate !== eventData.date) {
        // Check for time conflicts
        const hasConflict = hasTimeConflict(eventData, newDate, targetDateEvents)

        if (hasConflict) {
          // Show error modal instead of alert
          setErrorModal({
            show: true,
            message: `Cannot move event "${eventData.name}" to ${new Date(newDate).toLocaleDateString()}: There is already an event scheduled between ${eventData.startTime} and ${eventData.endTime} on this date.`,
            conflictingEvent: eventData
          })
        } else {
          const updatedEvent = {
            ...eventData,
            date: newDate
          }
          updateEvent(updatedEvent)
        }
      }
    }
    
    setDraggedEvent(null)
  }

  const handleEditConflictingEvent = () => {
    // Handle editing the conflicting event
    if (errorModal.conflictingEvent) {
      onDateSelect(new Date(errorModal.conflictingEvent.date))
      // You might want to trigger the edit form here
    }
    setErrorModal({ show: false, message: '', conflictingEvent: null })
  }

  const monthData = useMemo(() => getMonthData(currentDate), [currentDate])

  const exportEvents = () => {
    const currentMonthEvents = Object.entries(events)
      .filter(([date]) => {
        const eventDate = new Date(date)
        return eventDate.getMonth() === currentDate.getMonth() &&
               eventDate.getFullYear() === currentDate.getFullYear()
      })
      .reduce((acc, [date, events]) => {
        return [...acc, ...events.map(event => ({ ...event, date }))]
      }, [])

    const jsonString = JSON.stringify(currentMonthEvents, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `events_${currentDate.getFullYear()}_${currentDate.getMonth() + 1}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleMonthChange = (monthIndex) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex))
    setIsPickerOpen(false)
  }

  const handleYearChange = (year) => {
    setCurrentDate(new Date(year, currentDate.getMonth()))
    setIsPickerOpen(false)
  }

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.month-year-picker')) {
        setIsPickerOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="calendar">
          <div className="calendar-header">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handlePrevMonth}>
                <ChevronLeft />
              </Button>
              <MonthYearPicker
                currentDate={currentDate}
                onMonthChange={handleMonthChange}
                onYearChange={handleYearChange}
                isOpen={isPickerOpen}
                onToggle={() => setIsPickerOpen(!isPickerOpen)}
              />
              <Button variant="ghost" onClick={handleNextMonth}>
                <ChevronRight />
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportEvents}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Events
            </Button>
          </div>
          
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}
            
            {monthData.map((date, index) => (
              <CalendarDay
                key={index}
                date={date}
                isSelected={selectedDate && formatDate(selectedDate) === formatDate(date)}
                events={events}
                onDateSelect={onDateSelect}
              />
            ))}
          </div>
        </div>
        <DragOverlay>
          {draggedEvent && (
            <div className="dragged-dot" style={{
              backgroundColor: EVENT_CATEGORIES[draggedEvent.category || 'OTHER'].color
            }}>
              <span className="dragged-dot-label">{draggedEvent.name}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {errorModal.show && (
        <ErrorModal
          message={errorModal.message}
          onEdit={handleEditConflictingEvent}
          onClose={() => setErrorModal({ show: false, message: '', conflictingEvent: null })}
        />
      )}
    </>
  )
}

export default memo(Calendar) 