'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Truck, BarChart3, MapPin, Home, Building2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'ダッシュボード', href: '/', icon: Home },
  { name: '在庫管理', href: '/inventory', icon: Package },
  { name: '商品マスタ', href: '/products', icon: Package },
  { name: '倉庫管理', href: '/warehouses', icon: Building2 },
  { name: 'ロケーション', href: '/locations', icon: MapPin },
  { name: '入庫管理', href: '/inbound', icon: Truck },
  { name: '出庫管理', href: '/outbound', icon: Truck },
  { name: 'レポート', href: '/reports', icon: BarChart3 },
]

interface SidebarProps {
  isOpen: boolean
  onToggle?: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn(
      "flex h-full flex-col bg-gray-900 transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4">
        {isOpen ? (
          <h2 className="text-lg font-semibold text-white">WMS System</h2>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-800">
            <Building2 className="h-5 w-5 text-white" />
          </div>
        )}
        
        {/* Toggle button in sidebar */}
        {onToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="ml-auto p-1 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200',
                !isOpen && 'justify-center'
              )}
              title={!isOpen ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  isActive
                    ? 'text-gray-300'
                    : 'text-gray-400 group-hover:text-gray-300',
                  'h-5 w-5 flex-shrink-0',
                  isOpen ? 'mr-3' : 'mr-0'
                )}
                aria-hidden="true"
              />
              {isOpen && (
                <span className="transition-opacity duration-200">
                  {item.name}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="border-t border-gray-700 p-4">
          <div className="text-xs text-gray-400 text-center">
            バージョン 1.0.0
          </div>
        </div>
      )}
    </div>
  )
}