import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Calendar from './components/Calendar'
import EventSidebar from './components/EventSidebar'
import SearchPanel from './components/SearchPanel'
import UpcomingEvents from './components/UpcomingEvents'
import Menu from './components/animations/Menu'
import Profile from './components/Profile'
import PageHeader from './components/PageHeader'
import './App.css'
import { MenuProvider } from './context/MenuContext'
import VideoBackground from './components/VideoBackground'
import CustomizeCalendar from './components/CustomizeCalendar'
import { FiEdit3 } from 'react-icons/fi'
import { adjustColor } from './utils/colorUtils'

function MainCalendar() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [showSidebar, setShowSidebar] = useState(false)

  const handleDateSelect = (date) => {
    if (selectedDate && date.getTime() === selectedDate.getTime()) {
      setShowSidebar(false)
      setSelectedDate(null)
    } else {
      setSelectedDate(date)
      setShowSidebar(true)
    }
  }

  const handleEventSelect = (event) => {
    const date = new Date(event.date)
    setSelectedDate(date)
    setShowSidebar(true)
  }

  const handleEventAdded = () => {
    console.log('Event added')
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="header-content">
          <h1>Event Calendar</h1>
          <UpcomingEvents />
        </div>
      </div>
      <div className="main-layout">
        <div className="calendar-section">
          <Calendar
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        </div>
        <div className="side-section">
          <SearchPanel onEventSelect={handleEventSelect} />
          {showSidebar && (
            <EventSidebar
              selectedDate={selectedDate}
              onEventAdded={handleEventAdded}
              onClose={() => setShowSidebar(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [showCustomize, setShowCustomize] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('themeColor');
    if (savedTheme) {
      document.documentElement.style.setProperty('--primary', savedTheme);
      document.documentElement.style.setProperty('--primary-hover', adjustColor(savedTheme, -20));
      document.documentElement.style.setProperty('--hover', `${savedTheme}33`);
    }
  }, []);

  return (
    <MenuProvider>
      <VideoBackground />
      <Menu />
      <PageHeader />
      <Routes>
        <Route path="/" element={<MainCalendar />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      
      <div className="customize-button-container">
        <button 
          className="customize-button"
          onClick={() => setShowCustomize(true)}
          title="Customize Calendar"
        >
          <FiEdit3 className="edit-icon" />
          <span className="customize-text">Customize Calendar</span>
        </button>
      </div>

      {showCustomize && (
        <CustomizeCalendar onClose={() => setShowCustomize(false)} />
      )}
    </MenuProvider>
  )
}

export default App
