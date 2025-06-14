'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

export default function InventoryTransferPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [formData, setFormData] = useState({
    productId: '',
    fromLocationId: '',
    toLocationId: '',
    quantity: '',
    reason: ''
  })

  useEffect(() => {
    fetchProducts()
    fetchLocations()
  }, [])

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('id, sku, name')
      .eq('is_active', true)
      .order('name')
    
    setProducts(data || [])
  }

  async function fetchLocations() {
    const { data } = await supabase
      .from('locations')
      .select('id, code, warehouse_id')
      .eq('is_active', true)
      .order('code')
    
    setLocations(data || [])
  }

  async function handleTransfer() {
    if (!formData.productId || !formData.fromLocationId || !formData.toLocationId || !formData.quantity) {
      alert('すべての必須項目を入力してください')
      return
    }

    if (formData.fromLocationId === formData.toLocationId) {
      alert('移動元と移動先が同じです')
      return
    }

    setLoading(true)

    try {
      // Check source inventory
      const { data: sourceInventory } = await supabase
        .from('inventory')
        .select('*')
        .eq('product_id', formData.productId)
        .eq('location_id', formData.fromLocationId)
        .single()

      if (!sourceInventory || sourceInventory.quantity < parseInt(formData.quantity)) {
        alert('在庫が不足しています')
        setLoading(false)
        return
      }

      // Update source inventory
      const newSourceQuantity = sourceInventory.quantity - parseInt(formData.quantity)
      if (newSourceQuantity === 0) {
        await supabase
          .from('inventory')
          .delete()
          .eq('id', sourceInventory.id)
      } else {
        await supabase
          .from('inventory')
          .update({ quantity: newSourceQuantity })
          .eq('id', sourceInventory.id)
      }

      // Update or create destination inventory
      const { data: destInventory } = await supabase
        .from('inventory')
        .select('*')
        .eq('product_id', formData.productId)
        .eq('location_id', formData.toLocationId)
        .single()

      if (destInventory) {
        await supabase
          .from('inventory')
          .update({ quantity: destInventory.quantity + parseInt(formData.quantity) })
          .eq('id', destInventory.id)
      } else {
        await supabase
          .from('inventory')
          .insert({
            product_id: formData.productId,
            location_id: formData.toLocationId,
            quantity: parseInt(formData.quantity),
            lot_number: sourceInventory.lot_number,
            expiry_date: sourceInventory.expiry_date
          })
      }

      // Record movement
      await supabase
        .from('inventory_movements')
        .insert({
          product_id: formData.productId,
          from_location_id: formData.fromLocationId,
          to_location_id: formData.toLocationId,
          quantity: parseInt(formData.quantity),
          movement_type: 'TRANSFER',
          reason: formData.reason || '手動移動',
          performed_by: 'User'
        })

      alert('在庫移動が完了しました')
      router.push('/inventory')
    } catch (error) {
      console.error('Transfer error:', error)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">在庫移動</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>在庫移動フォーム</CardTitle>
          <CardDescription>
            在庫をロケーション間で移動します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="product">商品</Label>
              <select
                id="product"
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              >
                <option value="">選択してください</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.sku} - {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <Label htmlFor="from">移動元ロケーション</Label>
                <select
                  id="from"
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                  value={formData.fromLocationId}
                  onChange={(e) => setFormData({ ...formData, fromLocationId: e.target.value })}
                >
                  <option value="">選択してください</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>

              <div>
                <Label htmlFor="to">移動先ロケーション</Label>
                <select
                  id="to"
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                  value={formData.toLocationId}
                  onChange={(e) => setFormData({ ...formData, toLocationId: e.target.value })}
                >
                  <option value="">選択してください</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="quantity">数量</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="移動する数量を入力"
              />
            </div>

            <div>
              <Label htmlFor="reason">理由（任意）</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="移動理由を入力"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Button
              onClick={handleTransfer}
              disabled={loading}
            >
              {loading ? '処理中...' : '在庫移動を実行'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/inventory')}
            >
              キャンセル
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}