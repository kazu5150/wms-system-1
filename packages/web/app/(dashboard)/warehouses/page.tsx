'use client'

import { useState, useEffect } from 'react'
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
import { Search, Plus, Edit, Trash2, Building2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

type Warehouse = {
  id: string
  code: string
  name: string
  address: string | null
  created_at: string
  updated_at: string
  location_count?: number
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: ''
  })

  useEffect(() => {
    fetchWarehouses()
  }, [])

  async function fetchWarehouses() {
    setLoading(true)
    const { data, error } = await supabase
      .from('warehouses')
      .select(`
        *,
        locations!warehouse_id (
          id
        )
      `)
      .order('name')

    if (error) {
      console.error('Error fetching warehouses:', error)
    } else {
      const warehousesWithCounts = data?.map(warehouse => ({
        ...warehouse,
        location_count: warehouse.locations?.length || 0
      })) || []
      setWarehouses(warehousesWithCounts)
    }
    setLoading(false)
  }

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (warehouse.address && warehouse.address.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  function openCreateDialog() {
    setEditingWarehouse(null)
    setFormData({
      code: '',
      name: '',
      address: ''
    })
    setShowDialog(true)
  }

  function openEditDialog(warehouse: Warehouse) {
    setEditingWarehouse(warehouse)
    setFormData({
      code: warehouse.code,
      name: warehouse.name,
      address: warehouse.address || ''
    })
    setShowDialog(true)
  }

  async function handleSave() {
    if (!formData.code || !formData.name) {
      alert('倉庫コードと倉庫名は必須です')
      return
    }

    const warehouseData = {
      code: formData.code,
      name: formData.name,
      address: formData.address || null
    }

    if (editingWarehouse) {
      const { error } = await supabase
        .from('warehouses')
        .update(warehouseData)
        .eq('id', editingWarehouse.id)

      if (error) {
        console.error('Error updating warehouse:', error)
        alert('更新に失敗しました')
      } else {
        alert('倉庫を更新しました')
        fetchWarehouses()
        setShowDialog(false)
      }
    } else {
      const { error } = await supabase
        .from('warehouses')
        .insert(warehouseData)

      if (error) {
        console.error('Error creating warehouse:', error)
        alert('作成に失敗しました')
      } else {
        alert('倉庫を作成しました')
        fetchWarehouses()
        setShowDialog(false)
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('この倉庫を削除しますか？関連するロケーションも削除されます。')) return

    const { error } = await supabase
      .from('warehouses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting warehouse:', error)
      alert('削除に失敗しました')
    } else {
      alert('倉庫を削除しました')
      fetchWarehouses()
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">倉庫管理</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          新規倉庫
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>倉庫検索</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="倉庫コード、倉庫名、住所で検索..."
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
                <TableHead>倉庫コード</TableHead>
                <TableHead>倉庫名</TableHead>
                <TableHead>住所</TableHead>
                <TableHead>ロケーション数</TableHead>
                <TableHead>作成日</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    読み込み中...
                  </TableCell>
                </TableRow>
              ) : filteredWarehouses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    倉庫データがありません
                  </TableCell>
                </TableRow>
              ) : (
                filteredWarehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                        {warehouse.code}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{warehouse.name}</TableCell>
                    <TableCell>{warehouse.address || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {warehouse.location_count} 箇所
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(warehouse.created_at).toLocaleDateString('ja-JP')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(warehouse)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(warehouse.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingWarehouse ? '倉庫編集' : '新規倉庫登録'}
            </DialogTitle>
            <DialogDescription>
              倉庫情報を入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">倉庫コード *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="例: WH001"
                  disabled={!!editingWarehouse}
                />
              </div>
              <div>
                <Label htmlFor="name">倉庫名 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: 東京倉庫"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">住所</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="例: 東京都港区..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSave}>
              {editingWarehouse ? '更新' : '作成'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}