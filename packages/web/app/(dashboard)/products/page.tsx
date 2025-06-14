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
import { Search, Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/ui/image-upload'
import { ImageLightbox } from '@/components/ui/image-lightbox'

type Product = {
  id: string
  sku: string
  name: string
  description: string | null
  category: string | null
  unit: string
  weight: number | null
  volume: number | null
  barcode: string | null
  min_stock: number
  max_stock: number
  main_image_url: string | null
  additional_image_1_url: string | null
  additional_image_2_url: string | null
  additional_image_3_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<Array<{url: string, title: string, isMain?: boolean}>>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    unit: 'PCS',
    weight: '',
    volume: '',
    barcode: '',
    min_stock: '0',
    max_stock: '999999',
    main_image_url: '',
    additional_image_1_url: '',
    additional_image_2_url: '',
    additional_image_3_url: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching products:', error)
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  const filteredProducts = products.filter(product =>
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  function openCreateDialog() {
    setEditingProduct(null)
    setFormData({
      sku: '',
      name: '',
      description: '',
      category: '',
      unit: 'PCS',
      weight: '',
      volume: '',
      barcode: '',
      min_stock: '0',
      max_stock: '999999',
      main_image_url: '',
      additional_image_1_url: '',
      additional_image_2_url: '',
      additional_image_3_url: ''
    })
    setShowDialog(true)
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product)
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      unit: product.unit,
      weight: product.weight?.toString() || '',
      volume: product.volume?.toString() || '',
      barcode: product.barcode || '',
      min_stock: product.min_stock.toString(),
      max_stock: product.max_stock.toString(),
      main_image_url: product.main_image_url || '',
      additional_image_1_url: product.additional_image_1_url || '',
      additional_image_2_url: product.additional_image_2_url || '',
      additional_image_3_url: product.additional_image_3_url || ''
    })
    setShowDialog(true)
  }

  async function handleSave() {
    if (!formData.sku || !formData.name) {
      alert('SKUと商品名は必須です')
      return
    }

    const productData = {
      sku: formData.sku,
      name: formData.name,
      description: formData.description || null,
      category: formData.category || null,
      unit: formData.unit,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      volume: formData.volume ? parseFloat(formData.volume) : null,
      barcode: formData.barcode || null,
      min_stock: parseInt(formData.min_stock),
      max_stock: parseInt(formData.max_stock),
      main_image_url: formData.main_image_url || null,
      additional_image_1_url: formData.additional_image_1_url || null,
      additional_image_2_url: formData.additional_image_2_url || null,
      additional_image_3_url: formData.additional_image_3_url || null
    }

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id)

      if (error) {
        console.error('Error updating product:', error)
        alert('更新に失敗しました')
      } else {
        alert('商品を更新しました')
        fetchProducts()
        setShowDialog(false)
      }
    } else {
      const { error } = await supabase
        .from('products')
        .insert({ ...productData, is_active: true })

      if (error) {
        console.error('Error creating product:', error)
        alert('作成に失敗しました')
      } else {
        alert('商品を作成しました')
        fetchProducts()
        setShowDialog(false)
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('この商品を削除しますか？')) return

    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      alert('削除に失敗しました')
    } else {
      alert('商品を削除しました')
      fetchProducts()
    }
  }

  function openImageLightbox(product: Product, startIndex: number = 0) {
    const images = []
    
    // Add main image first
    if (product.main_image_url) {
      images.push({
        url: product.main_image_url,
        title: `${product.name} - メイン画像`,
        isMain: true
      })
    }
    
    // Add additional images
    if (product.additional_image_1_url) {
      images.push({
        url: product.additional_image_1_url,
        title: `${product.name} - 追加画像 1`
      })
    }
    
    if (product.additional_image_2_url) {
      images.push({
        url: product.additional_image_2_url,
        title: `${product.name} - 追加画像 2`
      })
    }
    
    if (product.additional_image_3_url) {
      images.push({
        url: product.additional_image_3_url,
        title: `${product.name} - 追加画像 3`
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
        <h1 className="text-2xl font-semibold text-gray-900">商品マスタ</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          新規商品
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>商品検索</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="SKU、商品名、カテゴリで検索..."
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
                <TableHead>画像</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>商品名</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>単位</TableHead>
                <TableHead>重量(kg)</TableHead>
                <TableHead>体積(m³)</TableHead>
                <TableHead>最小在庫</TableHead>
                <TableHead>最大在庫</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">
                    読み込み中...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">
                    商品データがありません
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.main_image_url ? (
                        <img
                          src={product.main_image_url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openImageLightbox(product, 0)}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-md border flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.sku}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category || '-'}</TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>{product.weight || '-'}</TableCell>
                    <TableCell>{product.volume || '-'}</TableCell>
                    <TableCell>{product.min_stock}</TableCell>
                    <TableCell>{product.max_stock}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
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
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? '商品編集' : '新規商品登録'}
            </DialogTitle>
            <DialogDescription>
              商品情報を入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  disabled={!!editingProduct}
                />
              </div>
              <div>
                <Label htmlFor="name">商品名 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">説明</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">カテゴリ</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="unit">単位</Label>
                <select
                  id="unit"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="PCS">個</option>
                  <option value="BOX">箱</option>
                  <option value="CASE">ケース</option>
                  <option value="PALLET">パレット</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="weight">重量(kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.001"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="volume">体積(m³)</Label>
                <Input
                  id="volume"
                  type="number"
                  step="0.001"
                  value={formData.volume}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="barcode">バーコード</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_stock">最小在庫数</Label>
                <Input
                  id="min_stock"
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="max_stock">最大在庫数</Label>
                <Input
                  id="max_stock"
                  type="number"
                  value={formData.max_stock}
                  onChange={(e) => setFormData({ ...formData, max_stock: e.target.value })}
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-t pt-4">
                <ImageIcon className="h-5 w-5" />
                <Label className="text-lg font-medium">商品画像</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Main Image */}
                <div className="col-span-2 md:col-span-1">
                  <ImageUpload
                    value={formData.main_image_url}
                    onChange={(value) => setFormData({ ...formData, main_image_url: value })}
                    onRemove={() => setFormData({ ...formData, main_image_url: '' })}
                    onImageClick={() => {
                      if (formData.main_image_url) {
                        const formImages = []
                        if (formData.main_image_url) formImages.push({ url: formData.main_image_url, title: 'メイン画像', isMain: true })
                        if (formData.additional_image_1_url) formImages.push({ url: formData.additional_image_1_url, title: '追加画像 1' })
                        if (formData.additional_image_2_url) formImages.push({ url: formData.additional_image_2_url, title: '追加画像 2' })
                        if (formData.additional_image_3_url) formImages.push({ url: formData.additional_image_3_url, title: '追加画像 3' })
                        setLightboxImages(formImages)
                        setLightboxIndex(0)
                        setLightboxOpen(true)
                      }
                    }}
                    label="メイン画像"
                    isMain={true}
                  />
                </div>

                {/* Additional Image 1 */}
                <div className="col-span-2 md:col-span-1">
                  <ImageUpload
                    value={formData.additional_image_1_url}
                    onChange={(value) => setFormData({ ...formData, additional_image_1_url: value })}
                    onRemove={() => setFormData({ ...formData, additional_image_1_url: '' })}
                    onImageClick={() => {
                      if (formData.additional_image_1_url) {
                        const formImages = []
                        if (formData.main_image_url) formImages.push({ url: formData.main_image_url, title: 'メイン画像', isMain: true })
                        if (formData.additional_image_1_url) formImages.push({ url: formData.additional_image_1_url, title: '追加画像 1' })
                        if (formData.additional_image_2_url) formImages.push({ url: formData.additional_image_2_url, title: '追加画像 2' })
                        if (formData.additional_image_3_url) formImages.push({ url: formData.additional_image_3_url, title: '追加画像 3' })
                        setLightboxImages(formImages)
                        setLightboxIndex(formData.main_image_url ? 1 : 0)
                        setLightboxOpen(true)
                      }
                    }}
                    label="追加画像 1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Additional Image 2 */}
                <div>
                  <ImageUpload
                    value={formData.additional_image_2_url}
                    onChange={(value) => setFormData({ ...formData, additional_image_2_url: value })}
                    onRemove={() => setFormData({ ...formData, additional_image_2_url: '' })}
                    onImageClick={() => {
                      if (formData.additional_image_2_url) {
                        const formImages = []
                        if (formData.main_image_url) formImages.push({ url: formData.main_image_url, title: 'メイン画像', isMain: true })
                        if (formData.additional_image_1_url) formImages.push({ url: formData.additional_image_1_url, title: '追加画像 1' })
                        if (formData.additional_image_2_url) formImages.push({ url: formData.additional_image_2_url, title: '追加画像 2' })
                        if (formData.additional_image_3_url) formImages.push({ url: formData.additional_image_3_url, title: '追加画像 3' })
                        setLightboxImages(formImages)
                        const indexOffset = (formData.main_image_url ? 1 : 0) + (formData.additional_image_1_url ? 1 : 0)
                        setLightboxIndex(indexOffset)
                        setLightboxOpen(true)
                      }
                    }}
                    label="追加画像 2"
                  />
                </div>

                {/* Additional Image 3 */}
                <div>
                  <ImageUpload
                    value={formData.additional_image_3_url}
                    onChange={(value) => setFormData({ ...formData, additional_image_3_url: value })}
                    onRemove={() => setFormData({ ...formData, additional_image_3_url: '' })}
                    onImageClick={() => {
                      if (formData.additional_image_3_url) {
                        const formImages = []
                        if (formData.main_image_url) formImages.push({ url: formData.main_image_url, title: 'メイン画像', isMain: true })
                        if (formData.additional_image_1_url) formImages.push({ url: formData.additional_image_1_url, title: '追加画像 1' })
                        if (formData.additional_image_2_url) formImages.push({ url: formData.additional_image_2_url, title: '追加画像 2' })
                        if (formData.additional_image_3_url) formImages.push({ url: formData.additional_image_3_url, title: '追加画像 3' })
                        setLightboxImages(formImages)
                        const indexOffset = (formData.main_image_url ? 1 : 0) + (formData.additional_image_1_url ? 1 : 0) + (formData.additional_image_2_url ? 1 : 0)
                        setLightboxIndex(indexOffset)
                        setLightboxOpen(true)
                      }
                    }}
                    label="追加画像 3"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSave}>
              {editingProduct ? '更新' : '作成'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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