import { useState, useEffect } from 'react'
import NewsFeed from '../NewsFeed'
import './menu.scss'
import { useNavigate, Link } from 'react-router-dom'
import { useMenu } from '../../context/MenuContext'

function Menu() {
  const { isMenuOpen, setIsMenuOpen } = useMenu()
  const navigate = useNavigate()

  useEffect(() => {
    const elements = [
      '.upcoming-events-container',
      '.month-year-picker',
      '.event-dots',
      '.page-header'
    ]

    elements.forEach(selector => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(el => {
        if (isMenuOpen) {
          el.style.opacity = '0'
          el.style.visibility = 'hidden'
          el.style.transition = 'opacity 0.3s, visibility 0.3s'
        } else {
          el.style.opacity = '1'
          el.style.visibility = 'visible'
        }
      })
    })
  }, [isMenuOpen])

  const handleHomeClick = () => {
    setIsMenuOpen(false)
    navigate('/')
  }

  const handleProfileClick = () => {
    setIsMenuOpen(false)
    navigate('/profile')
  }

  return (
    <>
      <input 
        type="checkbox" 
        id="burger-toggle" 
        checked={isMenuOpen}
        onChange={(e) => setIsMenuOpen(e.target.checked)}
      />
      <label htmlFor="burger-toggle" className="burger-menu">
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </label>
      <div className="menu">
        <div className="menu-inner">
          <nav className="menu-nav">
            <div className="menu-nav-item">
              <Link to="/" className="menu-nav-link" onClick={handleHomeClick}>
                <span><div>Home</div></span>
              </Link>
            </div>
            <div className="menu-nav-item">
              <Link to="/profile" className="menu-nav-link" onClick={handleProfileClick}>
                <span><div>Profile</div></span>
              </Link>
            </div>
          </nav>
          <div className="gallery">
            <div className="title">
              <p>News Feed</p>
            </div>
            <NewsFeed />
          </div>
        </div>
      </div>
    </>
  )
}

export default Menu 