import { useNavigate, useLocation } from 'react-router-dom'
import calendarIcon from './images/calendar.png'
import './styles/page-header.css'

function PageHeader() {
  const navigate = useNavigate()
  const location = useLocation()

  // Don't show on home page
  if (location.pathname === '/') {
    return null
  }

  const handleClick = () => {
    navigate('/')
  }

  return (
    <div className="page-header">
      <div className="header-logo" onClick={handleClick}>
        <img src={calendarIcon} alt="Calendar" className="header-icon" />
        <h1>Event Calendar</h1>
      </div>
    </div>
  )
}

export default PageHeader 