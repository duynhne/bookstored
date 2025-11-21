import React, { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react'

interface Column<T> {
  key: string
  label: string
  width?: string
  render?: (item: T) => ReactNode
}

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
  actions?: (item: T) => ReactNode
  loading?: boolean
  keyExtractor?: (item: T) => number | string
}

export function Table<T extends { id?: number | string }>({
  data,
  columns,
  onRowClick,
  actions,
  loading = false,
  keyExtractor,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-gray-500">
                Đang tải...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-gray-500">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={keyExtractor ? keyExtractor(item) : item.id || index}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render
                      ? column.render(item)
                      : (item as any)[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {actions(item)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-t">
      <div className="text-sm text-gray-700">
        Trang {currentPage} / {totalPages}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

interface ActionMenuProps {
  children: ReactNode
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [dropUp, setDropUp] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  React.useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const menuHeight = 120 // Approximate menu height
      
      setDropUp(spaceBelow < menuHeight)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="p-1 rounded hover:bg-gray-100"
        type="button"
      >
        <MoreVertical className="h-5 w-5 text-gray-600" />
      </button>
      
      {isOpen && (
        <div 
          className={`absolute right-0 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 ${
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          <div onClick={() => setIsOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

interface ActionMenuItemProps {
  onClick: () => void
  icon?: ReactNode
  children: ReactNode
  variant?: 'default' | 'danger'
}

export const ActionMenuItem: React.FC<ActionMenuItemProps> = ({
  onClick,
  icon,
  children,
  variant = 'default',
}) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`
        w-full px-4 py-2.5 text-sm text-left flex items-center gap-2 transition-colors
        first:rounded-t-lg last:rounded-b-lg
        ${variant === 'danger' 
          ? 'text-red-600 hover:bg-red-50' 
          : 'text-gray-700 hover:bg-gray-100'}
      `}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}

