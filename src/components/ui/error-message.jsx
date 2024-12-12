import { AlertCircle, ChevronRight } from 'lucide-react'
import { Button } from './button'

export function ErrorMessage({ message, actionText, onAction }) {
  if (!message) return null
  
  return (
    <div className="error-message">
      <div className="error-content">
        <AlertCircle className="h-4 w-4" />
        <span>{message}</span>
      </div>
      {actionText && onAction && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="error-action"
          onClick={onAction}
        >
          {actionText}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      )}
    </div>
  )
} 