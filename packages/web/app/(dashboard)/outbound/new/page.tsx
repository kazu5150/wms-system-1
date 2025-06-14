'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2 } from 'lucide-react'

type OutboundItem = {
  productId: string
  requestedQuantity: string
}

export default function NewOutboundPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [formData, setFormData] = useState({
    orderNumber: '',
    customerName: '',
    deliveryAddress: '',
    shipDate: '',
    priority: '3',
    notes: ''
  })
  const [items, setItems] = useState<OutboundItem[]>([])

  useEffect(() => {
    fetchProducts()
    generateOrderNumber()
  }, [])

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('id, sku, name, unit')
      .eq('is_active', true)
      .order('name')
    
    setProducts(data || [])
  }

  function generateOrderNumber() {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
    setFormData(prev => ({ ...prev, orderNumber: `OUT-${dateStr}-${timeStr}` }))
  }

  function addItem() {
    setItems([...items, { productId: '', requestedQuantity: '' }])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof OutboundItem, value: string) {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  async function handleSubmit() {
    if (!formData.orderNumber || !formData.customerName || items.length === 0) {
      alert('必須項目を入力してください')
      return
    }

    const invalidItems = items.filter(item => !item.productId || !item.requestedQuantity)
    if (invalidItems.length > 0) {
      alert('すべての商品の必須項目を入力してください')
      return
    }

    setLoading(true)

    try {
      // Create outbound order
      const { data: order, error: orderError } = await supabase
        .from('outbound_orders')
        .insert({
          order_number: formData.orderNumber,
          customer_name: formData.customerName,
          delivery_address: formData.deliveryAddress || null,
          ship_date: formData.shipDate || null,
          status: 'PENDING',
          priority: parseInt(formData.priority),
          notes: formData.notes || null
        })
        .select()
        .single()

      if (orderError) {
        throw orderError
      }

      // Create outbound order items
      const orderItems = items.map(item => ({
        outbound_order_id: order.id,
        product_id: item.productId,
        requested_quantity: parseInt(item.requestedQuantity),
        allocated_quantity: 0,
        picked_quantity: 0,
        shipped_quantity: 0
      }))

      const { error: itemsError } = await supabase
        .from('outbound_order_items')
        .insert(orderItems)

      if (itemsError) {
        throw itemsError
      }

      alert('出庫予定を作成しました')
      router.push('/outbound')
    } catch (error) {
      console.error('Error creating outbound order:', error)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">新規出庫予定作成</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>出庫予定の基本情報を入力してください</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orderNumber">注文番号 *</Label>
                <Input
                  id="orderNumber"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="customerName">顧客名 *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="顧客名を入力"
                />
              </div>
              <div>
                <Label htmlFor="shipDate">出荷予定日</Label>
                <Input
                  id="shipDate"
                  type="date"
                  value={formData.shipDate}
                  onChange={(e) => setFormData({ ...formData, shipDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="priority">優先度</Label>
                <select
                  id="priority"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="1">1 - 最高</option>
                  <option value="2">2 - 高</option>
                  <option value="3">3 - 標準</option>
                  <option value="4">4 - 低</option>
                  <option value="5">5 - 最低</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="deliveryAddress">配送先住所</Label>
                <Input
                  id="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  placeholder="配送先住所を入力"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">備考</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="備考を入力"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>出庫商品</CardTitle>
                <CardDescription>出庫予定の商品を追加してください</CardDescription>
              </div>
              <Button onClick={addItem} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                商品追加
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                商品を追加してください
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>商品 *</TableHead>
                    <TableHead>要求数量 *</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                          value={item.productId}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        >
                          <option value="">選択してください</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.sku} - {product.name}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.requestedQuantity}
                          onChange={(e) => updateItem(index, 'requestedQuantity', e.target.value)}
                          placeholder="数量"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '作成中...' : '出庫予定を作成'}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/outbound')}
          >
            キャンセル
          </Button>
        </div>
      </div>
    </div>
  )
}