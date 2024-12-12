import { useState, useEffect } from 'react'
import { FiUser } from 'react-icons/fi'
import '../styles/profile.css';

function Profile() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    address: '',
    city: '',
    country: '',
    notifications: 'none'
  })

  useEffect(() => {
    // Load saved data from localStorage
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      setFormData(JSON.parse(savedProfile))
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    localStorage.setItem('userProfile', JSON.stringify(formData))
    alert('Profile saved successfully!')
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <FiUser />
        <h2>Profile Settings</h2>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="birthday">Birthday</label>
            <input
              type="date"
              id="birthday"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Address Information</h3>
          <div className="form-group">
            <label htmlFor="address">Street Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Notification Preferences</h3>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="notifications"
                value="email"
                checked={formData.notifications === 'email'}
                onChange={handleChange}
              />
              Email Notifications
            </label>

            <label className="radio-label">
              <input
                type="radio"
                name="notifications"
                value="sms"
                checked={formData.notifications === 'sms'}
                onChange={handleChange}
              />
              SMS Notifications
            </label>

            <label className="radio-label">
              <input
                type="radio"
                name="notifications"
                value="none"
                checked={formData.notifications === 'none'}
                onChange={handleChange}
              />
              No Notifications
            </label>
          </div>
        </div>

        <div className="save-button-container">
          <button type="submit" className="save-button">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}

export default Profile 