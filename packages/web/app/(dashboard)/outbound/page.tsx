'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Plus, Eye, Truck, AlertCircle } from 'lucide-react'

type OutboundOrder = {
  id: string
  order_number: string
  customer_name: string | null
  delivery_address: string | null
  ship_date: string | null
  status: string
  priority: number
  notes: string | null
  created_at: string
  updated_at: string
}

const statusConfig = {
  PENDING: { label: '予定', variant: 'secondary' as const },
  PICKING: { label: 'ピッキング中', variant: 'warning' as const },
  PACKING: { label: '梱包中', variant: 'warning' as const },
  SHIPPED: { label: '出荷済み', variant: 'success' as const },
  CANCELLED: { label: 'キャンセル', variant: 'destructive' as const }
}

const priorityConfig = {
  1: { label: '最高', color: 'text-red-600' },
  2: { label: '高', color: 'text-orange-600' },
  3: { label: '標準', color: 'text-gray-600' },
  4: { label: '低', color: 'text-blue-600' },
  5: { label: '最低', color: 'text-green-600' }
}

export default function OutboundPage() {
  const [orders, setOrders] = useState<OutboundOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    const { data, error } = await supabase
      .from('outbound_orders')
      .select('*')
      .order('priority')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching outbound orders:', error)
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">出庫管理</h1>
        <Link href="/outbound/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規出庫予定
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">出庫予定</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'PENDING').length}
            </div>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ピッキング中</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'PICKING').length}
            </div>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">梱包中</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'PACKING').length}
            </div>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">出荷済み</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'SHIPPED').length}
            </div>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">急ぎ</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.priority <= 2 && o.status !== 'SHIPPED').length}
            </div>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>出庫予定検索</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="注文番号、顧客名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>優先度</TableHead>
                <TableHead>注文番号</TableHead>
                <TableHead>顧客名</TableHead>
                <TableHead>出荷予定日</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>配送先</TableHead>
                <TableHead>備考</TableHead>
                <TableHead>作成日</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    読み込み中...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    出庫予定がありません
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <span className={priorityConfig[order.priority as keyof typeof priorityConfig]?.color}>
                        {priorityConfig[order.priority as keyof typeof priorityConfig]?.label}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.customer_name || '-'}</TableCell>
                    <TableCell>
                      {order.ship_date
                        ? new Date(order.ship_date).toLocaleDateString('ja-JP')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[order.status as keyof typeof statusConfig]?.variant}>
                        {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {order.delivery_address || '-'}
                    </TableCell>
                    <TableCell>{order.notes || '-'}</TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString('ja-JP')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/outbound/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {order.status === 'PENDING' && (
                          <Link href={`/outbound/${order.id}/pick`}>
                            <Button variant="ghost" size="sm">
                              ピッキング
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}