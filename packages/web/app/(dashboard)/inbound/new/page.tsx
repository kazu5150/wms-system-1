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

type InboundItem = {
  productId: string
  expectedQuantity: string
  lotNumber: string
  expiryDate: string
}

export default function NewInboundPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [formData, setFormData] = useState({
    orderNumber: '',
    supplierName: '',
    expectedDate: '',
    notes: ''
  })
  const [items, setItems] = useState<InboundItem[]>([])

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
    setFormData(prev => ({ ...prev, orderNumber: `IN-${dateStr}-${timeStr}` }))
  }

  function addItem() {
    setItems([...items, { productId: '', expectedQuantity: '', lotNumber: '', expiryDate: '' }])
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof InboundItem, value: string) {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  async function handleSubmit() {
    if (!formData.orderNumber || !formData.supplierName || items.length === 0) {
      alert('必須項目を入力してください')
      return
    }

    const invalidItems = items.filter(item => !item.productId || !item.expectedQuantity)
    if (invalidItems.length > 0) {
      alert('すべての商品の必須項目を入力してください')
      return
    }

    setLoading(true)

    try {
      // Create inbound order
      const { data: order, error: orderError } = await supabase
        .from('inbound_orders')
        .insert({
          order_number: formData.orderNumber,
          supplier_name: formData.supplierName,
          expected_date: formData.expectedDate || null,
          status: 'PENDING',
          notes: formData.notes || null
        })
        .select()
        .single()

      if (orderError) {
        throw orderError
      }

      // Create inbound order items
      const orderItems = items.map(item => ({
        inbound_order_id: order.id,
        product_id: item.productId,
        expected_quantity: parseInt(item.expectedQuantity),
        received_quantity: 0,
        lot_number: item.lotNumber || null,
        expiry_date: item.expiryDate || null
      }))

      const { error: itemsError } = await supabase
        .from('inbound_order_items')
        .insert(orderItems)

      if (itemsError) {
        throw itemsError
      }

      alert('入庫予定を作成しました')
      router.push('/inbound')
    } catch (error) {
      console.error('Error creating inbound order:', error)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">新規入庫予定作成</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>入庫予定の基本情報を入力してください</CardDescription>
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
                <Label htmlFor="supplierName">仕入先 *</Label>
                <Input
                  id="supplierName"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  placeholder="仕入先名を入力"
                />
              </div>
              <div>
                <Label htmlFor="expectedDate">予定日</Label>
                <Input
                  id="expectedDate"
                  type="date"
                  value={formData.expectedDate}
                  onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                />
              </div>
              <div>
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
                <CardTitle>入庫商品</CardTitle>
                <CardDescription>入庫予定の商品を追加してください</CardDescription>
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
                    <TableHead>予定数量 *</TableHead>
                    <TableHead>ロット番号</TableHead>
                    <TableHead>有効期限</TableHead>
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
                          value={item.expectedQuantity}
                          onChange={(e) => updateItem(index, 'expectedQuantity', e.target.value)}
                          placeholder="数量"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.lotNumber}
                          onChange={(e) => updateItem(index, 'lotNumber', e.target.value)}
                          placeholder="ロット番号"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => updateItem(index, 'expiryDate', e.target.value)}
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
            {loading ? '作成中...' : '入庫予定を作成'}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/inbound')}
          >
            キャンセル
          </Button>
        </div>
      </div>
    </div>
  )
}