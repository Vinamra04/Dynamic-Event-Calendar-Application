import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { ErrorMessage } from './ui/error-message'
import { Tag, ChevronDown } from 'lucide-react'
import { useEvents } from '../hooks/useEvents'
import { formatDate } from '../utils/calendarUtils'
import { EVENT_CATEGORIES } from '../utils/constants'
import { FiEye } from 'react-icons/fi'

function CategorySelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="category-select">
      <Button
        type="button"
        variant="outline"
        className="category-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value ? (
          <>
            <Tag className="h-4 w-4 mr-2" style={{ color: EVENT_CATEGORIES[value].color }} />
            {EVENT_CATEGORIES[value].label}
          </>
        ) : (
          'Select Category'
        )}
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      {isOpen && (
        <div className="category-dropdown">
          {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              type="button"
              className={`category-option ${value === key ? 'selected' : ''}`}
              onClick={() => {
                onChange(key)
                setIsOpen(false)
              }}
            >
              <Tag className="h-4 w-4 mr-2" style={{ color: category.color }} />
              {category.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function EventSidebar({ selectedDate, onClose }) {
  const { events, addEvent, deleteEvent, updateEvent } = useEvents()
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [error, setError] = useState('')
  const [conflictingEvent, setConflictingEvent] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(editingEvent?.category || 'OTHER')
  
  const dateStr = formatDate(selectedDate)
  const dateEvents = events[dateStr] || []

  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }

  const validateTimes = (startTime, endTime, eventId = null) => {
    // Check if end time is after start time
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      setError('End time must be after start time')
      setConflictingEvent(null)
      return false
    }

    // Check for overlapping events
    const overlappingEvent = dateEvents.find(event => {
      if (eventId && event.id === eventId) return false
      
      const eventStart = timeToMinutes(event.startTime)
      const eventEnd = timeToMinutes(event.endTime)
      const newStart = timeToMinutes(startTime)
      const newEnd = timeToMinutes(endTime)

      return (newStart < eventEnd && newEnd > eventStart)
    })

    if (overlappingEvent) {
      setError('This time slot overlaps with an existing event')
      setConflictingEvent(overlappingEvent)
      return false
    }

    setError('')
    setConflictingEvent(null)
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const startTime = formData.get('startTime')
    const endTime = formData.get('endTime')

    if (!validateTimes(startTime, endTime, editingEvent?.id)) {
      return
    }

    const eventData = {
      id: editingEvent?.id || Date.now(),
      name: formData.get('name'),
      startTime,
      endTime,
      description: formData.get('description'),
      category: selectedCategory,
      date: dateStr
    }

    if (editingEvent) {
      updateEvent(eventData)
    } else {
      addEvent(eventData)
    }
    
    setShowForm(false)
    setEditingEvent(null)
    setError('')
    setConflictingEvent(null)
  }

  const handleShowConflictingEvent = () => {
    setEditingEvent(null)
    setShowForm(false)
    setError('')
    setConflictingEvent(null)
  }

  return (
    <div className="event-sidebar">
      <div className="sidebar-header">
        <h3>{selectedDate.toLocaleDateString()}</h3>
        <Button variant="ghost" onClick={onClose}>×</Button>
      </div>

      {!showForm ? (
        <>
          <Button onClick={() => setShowForm(true)} className="mt-4">Add Event</Button>
          <div className="events-list">
            {dateEvents.map(event => (
              <div key={event.id} className="event-item">
                <div className="event-header">
                  <h4>{event.name}</h4>
                  <div className="event-category">
                    <Tag 
                      className="h-4 w-4" 
                      style={{ color: EVENT_CATEGORIES[event.category || 'OTHER'].color }} 
                    />
                    <span>{EVENT_CATEGORIES[event.category || 'OTHER'].label}</span>
                  </div>
                </div>
                <p>{event.startTime} - {event.endTime}</p>
                <p>{event.description}</p>
                <div className="event-actions">
                  <Button variant="ghost" onClick={() => {
                    setEditingEvent(event)
                    setShowForm(true)
                    setError('')
                    setConflictingEvent(null)
                  }}>Edit</Button>
                  <Button variant="destructive" onClick={() => deleteEvent(event.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="event-form">
          <Input
            name="name"
            placeholder="Event name"
            defaultValue={editingEvent?.name}
            required
          />
          <CategorySelect 
            value={selectedCategory}
            onChange={setSelectedCategory}
          />
          <Input
            type="time"
            name="startTime"
            defaultValue={editingEvent?.startTime}
            required
          />
          <Input
            type="time"
            name="endTime"
            defaultValue={editingEvent?.endTime}
            required
          />
          <Textarea
            name="description"
            placeholder="Description"
            defaultValue={editingEvent?.description}
          />
          {error && (
            <ErrorMessage 
              message={error}
              actionText={conflictingEvent ? `View conflicting event: "${conflictingEvent.name}"` : null}
              onAction={conflictingEvent ? handleShowConflictingEvent : null}
            />
          )}
          <div className="form-actions">
            <Button type="submit">
              {editingEvent ? 'Update' : 'Add'} Event
            </Button>
            <Button type="button" variant="ghost" onClick={() => {
              setShowForm(false)
              setEditingEvent(null)
              setError('')
              setConflictingEvent(null)
            }}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default EventSidebar 