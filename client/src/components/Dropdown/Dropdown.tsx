import { FC, MutableRefObject, ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./Dropdown.scss"

type DropdownProps = {
  anchor: MutableRefObject<null | HTMLDivElement>,
  visible: boolean,
  onClose: () => void,
  children: ReactNode
}

// Выпадающий список
export const Dropdown: FC<DropdownProps> = ({ anchor, visible, onClose, children }) => {

  // Ссылка на выпадающий список
  const dropdownRef = useRef<null | HTMLDivElement>(null)

  // Закрывает список, если нажатый элемент не входит в список
  const closeDropdown = ({ target }: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(target as Node)) {
      onClose()
    }
  }
  
  // Если элемент видимый, вешает обработчик клика на документ для закрытия
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        document.addEventListener('mousedown', closeDropdown)
        document.addEventListener('click', closeDropdown)
      })
    }
    return () => {
      document.removeEventListener('mousedown', closeDropdown);
      document.removeEventListener('click', closeDropdown);
    }
  }, [visible])

  if (!visible) return null

  // Портал в body документа
  return createPortal(
    <div 
      ref={dropdownRef}
      className="dropdown" 
      style={{ 
        left: anchor.current?.offsetLeft,
        top: anchor.current?.offsetTop && anchor.current?.clientWidth ? anchor.current?.offsetTop + anchor.current?.clientHeight + 5 : 0,
        minWidth: anchor.current?.clientWidth 
      }}
    >
      { children }
    </div>,
    document.body
  )
}