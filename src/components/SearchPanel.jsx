import { useState, useRef, useEffect } from 'react'
import { Input } from './ui/input'
import { Search } from 'lucide-react'
import { useEvents } from '../hooks/useEvents'
import { Tag } from 'lucide-react'
import { EVENT_CATEGORIES } from '../utils/constants'

function SearchPanel({ onEventSelect }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const { events } = useEvents()
  const dropdownRef = useRef(null)

  const searchResults = searchQuery ? Object.entries(events).flatMap(([date, dateEvents]) => 
    dateEvents.filter(event => 
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(event => ({
      ...event,
      date
    }))
  ) : []

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Function to highlight matching text
  const highlightMatch = (text, query) => {
    if (!query || !text) return text;

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <span key={index} className="search-highlight">{part}</span> : 
        part
    );
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleEventClick = (event) => {
    onEventSelect(event)
    setSearchQuery('')
    setShowDropdown(false)
  }

  return (
    <div className="search-panel">
      <div className="search-container" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search Events"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            className="pl-9"
          />
        </div>

        {showDropdown && searchQuery && (
          <div className="search-dropdown">
            {searchResults.map(event => (
              <div 
                key={event.id} 
                className="search-dropdown-item"
                onClick={() => handleEventClick(event)}
              >
                <div className="search-result-header">
                  <h4>{highlightMatch(event.name, searchQuery)}</h4>
                  <div className="event-category">
                    <Tag 
                      className="h-4 w-4" 
                      style={{ color: EVENT_CATEGORIES[event.category || 'OTHER'].color }} 
                    />
                    <span>{EVENT_CATEGORIES[event.category || 'OTHER'].label}</span>
                  </div>
                </div>
                <p className="date-time">
                  {formatDate(event.date)} at {event.startTime}
                </p>
                {event.description && (
                  <p className="description">
                    {highlightMatch(event.description, searchQuery)}
                  </p>
                )}
              </div>
            ))}
            {searchResults.length === 0 && (
              <div className="search-dropdown-item no-results">
                No events found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPanel 