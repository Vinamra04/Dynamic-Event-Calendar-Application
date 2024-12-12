import { Button } from './button'

export function ErrorModal({ message, onEdit, onClose }) {
  return (
    <div className="error-modal-overlay">
      <div className="error-modal">
        <div className="error-modal-content">
          <h3 className="error-modal-title">Time Conflict</h3>
          <p className="error-modal-message">{message}</p>
          <div className="error-modal-actions">
            <Button onClick={onEdit}>Edit Event</Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  )
} 