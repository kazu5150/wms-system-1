'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, Truck, BarChart3, MapPin, Home, Building2 } from 'lucide-react'
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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center px-4">
        <h2 className="text-lg font-semibold text-white">WMS System</h2>
      </div>
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
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
              )}
            >
              <item.icon
                className={cn(
                  isActive
                    ? 'text-gray-300'
                    : 'text-gray-400 group-hover:text-gray-300',
                  'mr-3 h-5 w-5 flex-shrink-0'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}