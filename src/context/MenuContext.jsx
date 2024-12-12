import { createContext, useContext, useState } from 'react'

const MenuContext = createContext()

export function MenuProvider({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <MenuContext.Provider value={{ isMenuOpen, setIsMenuOpen }}>
      {children}
    </MenuContext.Provider>
  )
}

export const useMenu = () => useContext(MenuContext) 