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
import { Search, Plus, Eye, Truck } from 'lucide-react'

type InboundOrder = {
  id: string
  order_number: string
  supplier_name: string | null
  expected_date: string | null
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

const statusConfig = {
  PENDING: { label: '予定', variant: 'secondary' as const },
  RECEIVING: { label: '入庫中', variant: 'warning' as const },
  COMPLETED: { label: '完了', variant: 'success' as const },
  CANCELLED: { label: 'キャンセル', variant: 'destructive' as const }
}

export default function InboundPage() {
  const [orders, setOrders] = useState<InboundOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    const { data, error } = await supabase
      .from('inbound_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching inbound orders:', error)
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.supplier_name && order.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">入庫管理</h1>
        <Link href="/inbound/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新規入庫予定
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">入庫予定</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground rotate-180" />
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
            <CardTitle className="text-sm font-medium">入庫中</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'RECEIVING').length}
            </div>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'COMPLETED').length}
            </div>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本日予定</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => 
                o.expected_date && 
                new Date(o.expected_date).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">件</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>入庫予定検索</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="注文番号、仕入先で検索..."
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
                <TableHead>注文番号</TableHead>
                <TableHead>仕入先</TableHead>
                <TableHead>予定日</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>備考</TableHead>
                <TableHead>作成日</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    読み込み中...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    入庫予定がありません
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.supplier_name || '-'}</TableCell>
                    <TableCell>
                      {order.expected_date
                        ? new Date(order.expected_date).toLocaleDateString('ja-JP')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[order.status as keyof typeof statusConfig]?.variant}>
                        {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.notes || '-'}</TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString('ja-JP')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/inbound/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {order.status === 'PENDING' && (
                          <Link href={`/inbound/${order.id}/receive`}>
                            <Button variant="ghost" size="sm">
                              入庫処理
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