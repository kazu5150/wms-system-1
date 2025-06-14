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
import { Search, Plus, ArrowUpDown, Image as ImageIcon } from 'lucide-react'
import { ImageLightbox } from '@/components/ui/image-lightbox'

type InventoryItem = {
  id: string
  quantity: number
  lot_number: string | null
  expiry_date: string | null
  product: {
    sku: string
    name: string
    category: string | null
    unit: string
    min_stock: number
    max_stock: number
    main_image_url: string | null
    additional_image_1_url: string | null
    additional_image_2_url: string | null
    additional_image_3_url: string | null
  }
  location: {
    code: string
    zone: string | null
    aisle: string | null
    rack: string | null
  }
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<Array<{url: string, title: string, isMain?: boolean}>>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    fetchInventory()
  }, [])

  async function fetchInventory() {
    setLoading(true)
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:products!inner(
          sku,
          name,
          category,
          unit,
          min_stock,
          max_stock,
          main_image_url,
          additional_image_1_url,
          additional_image_2_url,
          additional_image_3_url
        ),
        location:locations!inner(
          code,
          zone,
          aisle,
          rack
        )
      `)
      .order('product(name)')

    if (error) {
      console.error('Error fetching inventory:', error)
    } else {
      setInventory(data || [])
    }
    setLoading(false)
  }

  const getStockStatus = (item: InventoryItem) => {
    const percentage = (item.quantity / item.product.max_stock) * 100
    
    if (item.quantity <= item.product.min_stock) {
      return <Badge variant="destructive">在庫不足</Badge>
    } else if (percentage > 90) {
      return <Badge variant="warning">在庫過多</Badge>
    } else if (item.quantity <= item.product.min_stock * 1.5) {
      return <Badge variant="warning">在庫少</Badge>
    }
    return <Badge variant="success">正常</Badge>
  }

  const filteredInventory = inventory.filter(item =>
    item.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function openImageLightbox(item: InventoryItem, startIndex: number = 0) {
    const images = []
    
    // Add main image first
    if (item.product.main_image_url) {
      images.push({
        url: item.product.main_image_url,
        title: `${item.product.name} - メイン画像`,
        isMain: true
      })
    }
    
    // Add additional images
    if (item.product.additional_image_1_url) {
      images.push({
        url: item.product.additional_image_1_url,
        title: `${item.product.name} - 追加画像 1`
      })
    }
    
    if (item.product.additional_image_2_url) {
      images.push({
        url: item.product.additional_image_2_url,
        title: `${item.product.name} - 追加画像 2`
      })
    }
    
    if (item.product.additional_image_3_url) {
      images.push({
        url: item.product.additional_image_3_url,
        title: `${item.product.name} - 追加画像 3`
      })
    }
    
    if (images.length > 0) {
      setLightboxImages(images)
      setLightboxIndex(startIndex)
      setLightboxOpen(true)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">在庫管理</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          在庫調整
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>在庫検索</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="SKU、商品名、ロケーションで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              フィルター
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>画像</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>商品名</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>ロケーション</TableHead>
                <TableHead className="text-right">数量</TableHead>
                <TableHead>単位</TableHead>
                <TableHead>ロット番号</TableHead>
                <TableHead>有効期限</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center">
                    読み込み中...
                  </TableCell>
                </TableRow>
              ) : filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center">
                    在庫データがありません
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.product.main_image_url ? (
                        <img
                          src={item.product.main_image_url}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ objectFit: 'cover' }}
                          onClick={() => openImageLightbox(item, 0)}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-md border flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.product.sku}</TableCell>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell>{item.product.category || '-'}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.location.code}</div>
                        <div className="text-xs text-muted-foreground">
                          {[item.location.zone, item.location.aisle, item.location.rack]
                            .filter(Boolean)
                            .join('-')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell>{item.product.unit}</TableCell>
                    <TableCell>{item.lot_number || '-'}</TableCell>
                    <TableCell>
                      {item.expiry_date
                        ? new Date(item.expiry_date).toLocaleDateString('ja-JP')
                        : '-'}
                    </TableCell>
                    <TableCell>{getStockStatus(item)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        詳細
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
      />
    </div>
  )
}