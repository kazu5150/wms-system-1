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
import { Search, Plus, Edit, Trash2, MapPin } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

type Location = {
  id: string
  warehouse_id: string
  code: string
  zone: string | null
  aisle: string | null
  rack: string | null
  level: string | null
  bin: string | null
  capacity: number
  is_active: boolean
  created_at: string
  warehouses?: {
    id: string
    name: string
    code: string
  }
}

type Warehouse = {
  id: string
  name: string
  code: string
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState({
    warehouse_id: '',
    code: '',
    zone: '',
    aisle: '',
    rack: '',
    level: '',
    bin: '',
    capacity: '100'
  })

  useEffect(() => {
    fetchLocations()
    fetchWarehouses()
  }, [])

  async function fetchWarehouses() {
    const { data, error } = await supabase
      .from('warehouses')
      .select('id, name, code')
      .order('name')

    if (error) {
      console.error('Error fetching warehouses:', error)
    } else {
      setWarehouses(data || [])
    }
  }

  async function fetchLocations() {
    setLoading(true)
    const { data, error } = await supabase
      .from('locations')
      .select(`
        *,
        warehouses:warehouse_id (
          id,
          name,
          code
        )
      `)
      .eq('is_active', true)
      .order('code')

    if (error) {
      console.error('Error fetching locations:', error)
    } else {
      setLocations(data || [])
    }
    setLoading(false)
  }

  const filteredLocations = locations.filter(location =>
    location.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (location.zone && location.zone.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (location.aisle && location.aisle.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (location.warehouses && location.warehouses.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  function openCreateDialog() {
    setEditingLocation(null)
    setFormData({
      warehouse_id: warehouses.length > 0 ? warehouses[0].id : '',
      code: '',
      zone: '',
      aisle: '',
      rack: '',
      level: '',
      bin: '',
      capacity: '100'
    })
    setShowDialog(true)
  }

  function openEditDialog(location: Location) {
    setEditingLocation(location)
    setFormData({
      warehouse_id: location.warehouse_id,
      code: location.code,
      zone: location.zone || '',
      aisle: location.aisle || '',
      rack: location.rack || '',
      level: location.level || '',
      bin: location.bin || '',
      capacity: location.capacity.toString()
    })
    setShowDialog(true)
  }

  async function handleSave() {
    if (!formData.warehouse_id || !formData.code) {
      alert('倉庫とロケーションコードは必須です')
      return
    }

    const locationData = {
      warehouse_id: formData.warehouse_id,
      code: formData.code,
      zone: formData.zone || null,
      aisle: formData.aisle || null,
      rack: formData.rack || null,
      level: formData.level || null,
      bin: formData.bin || null,
      capacity: parseInt(formData.capacity)
    }

    if (editingLocation) {
      const { error } = await supabase
        .from('locations')
        .update(locationData)
        .eq('id', editingLocation.id)

      if (error) {
        console.error('Error updating location:', error)
        alert('更新に失敗しました')
      } else {
        alert('ロケーションを更新しました')
        fetchLocations()
        setShowDialog(false)
      }
    } else {
      const { error } = await supabase
        .from('locations')
        .insert({ ...locationData, is_active: true })

      if (error) {
        console.error('Error creating location:', error)
        alert('作成に失敗しました')
      } else {
        alert('ロケーションを作成しました')
        fetchLocations()
        setShowDialog(false)
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('このロケーションを削除しますか？')) return

    const { error } = await supabase
      .from('locations')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deleting location:', error)
      alert('削除に失敗しました')
    } else {
      alert('ロケーションを削除しました')
      fetchLocations()
    }
  }

  function formatLocationPath(location: Location) {
    const parts = [
      location.zone,
      location.aisle,
      location.rack,
      location.level,
      location.bin
    ].filter(Boolean)
    
    return parts.length > 0 ? parts.join('-') : '-'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">ロケーション管理</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          新規ロケーション
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>ロケーション検索</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ロケーションコード、ゾーン、通路、倉庫名で検索..."
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
                <TableHead>コード</TableHead>
                <TableHead>倉庫</TableHead>
                <TableHead>ロケーション</TableHead>
                <TableHead>容量</TableHead>
                <TableHead>ステータス</TableHead>
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
              ) : filteredLocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    ロケーションデータがありません
                  </TableCell>
                </TableRow>
              ) : (
                filteredLocations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        {location.code}
                      </div>
                    </TableCell>
                    <TableCell>
                      {location.warehouses?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {formatLocationPath(location)}
                    </TableCell>
                    <TableCell>{location.capacity}</TableCell>
                    <TableCell>
                      <Badge variant={location.is_active ? "default" : "secondary"}>
                        {location.is_active ? "有効" : "無効"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(location)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(location.id)}
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'ロケーション編集' : '新規ロケーション登録'}
            </DialogTitle>
            <DialogDescription>
              ロケーション情報を入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="warehouse_id">倉庫 *</Label>
                <select
                  id="warehouse_id"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.warehouse_id}
                  onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                >
                  <option value="">倉庫を選択</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="code">ロケーションコード *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="例: A01-01-01"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="zone">ゾーン</Label>
                <Input
                  id="zone"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  placeholder="例: A"
                />
              </div>
              <div>
                <Label htmlFor="aisle">通路</Label>
                <Input
                  id="aisle"
                  value={formData.aisle}
                  onChange={(e) => setFormData({ ...formData, aisle: e.target.value })}
                  placeholder="例: 01"
                />
              </div>
              <div>
                <Label htmlFor="rack">ラック</Label>
                <Input
                  id="rack"
                  value={formData.rack}
                  onChange={(e) => setFormData({ ...formData, rack: e.target.value })}
                  placeholder="例: 01"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="level">レベル</Label>
                <Input
                  id="level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="例: 01"
                />
              </div>
              <div>
                <Label htmlFor="bin">ビン</Label>
                <Input
                  id="bin"
                  value={formData.bin}
                  onChange={(e) => setFormData({ ...formData, bin: e.target.value })}
                  placeholder="例: A"
                />
              </div>
              <div>
                <Label htmlFor="capacity">容量</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSave}>
              {editingLocation ? '更新' : '作成'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}