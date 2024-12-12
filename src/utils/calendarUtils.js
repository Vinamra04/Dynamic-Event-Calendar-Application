export function getMonthData(date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const days = []
  
  // Add empty slots for days before the first day of the month
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null)
  }
  
  // Add all days of the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }
  
  // Add empty slots to complete the grid if necessary
  while (days.length % 7 !== 0) {
    days.push(null)
  }
  
  return days
}

export function formatDate(date) {
  if (!date) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
} 