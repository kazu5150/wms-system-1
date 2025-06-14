'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Building2, 
  Package, 
  MapPin, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend
} from 'recharts'

type DashboardStats = {
  totalWarehouses: number
  totalLocations: number
  totalProducts: number
  totalInventoryItems: number
  lowStockProducts: number
  outOfStockProducts: number
}

type InventorySummary = {
  product_id: string
  product_name: string
  product_sku: string
  total_quantity: number
  min_stock: number
  max_stock: number
  location_count: number
  status: 'normal' | 'low' | 'out_of_stock' | 'overstock'
}

type LocationUtilization = {
  warehouse_name: string
  total_locations: number
  occupied_locations: number
  utilization_rate: number
}

type ChartData = {
  name: string
  value: number
  color?: string
}

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']
const STATUS_COLORS = {
  normal: '#00C49F',
  low: '#FFBB28', 
  out_of_stock: '#FF8042',
  overstock: '#8884D8'
}

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalWarehouses: 0,
    totalLocations: 0,
    totalProducts: 0,
    totalInventoryItems: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0
  })
  const [inventorySummary, setInventorySummary] = useState<InventorySummary[]>([])
  const [locationUtilization, setLocationUtilization] = useState<LocationUtilization[]>([])
  const [loading, setLoading] = useState(true)

  // Chart data derived from state
  const stockStatusData: ChartData[] = [
    { name: '正常', value: inventorySummary.filter(item => item.status === 'normal').length, color: STATUS_COLORS.normal },
    { name: '少量', value: inventorySummary.filter(item => item.status === 'low').length, color: STATUS_COLORS.low },
    { name: '欠品', value: inventorySummary.filter(item => item.status === 'out_of_stock').length, color: STATUS_COLORS.out_of_stock },
    { name: '過剰', value: inventorySummary.filter(item => item.status === 'overstock').length, color: STATUS_COLORS.overstock }
  ].filter(item => item.value > 0)

  const inventoryChartData = inventorySummary.slice(0, 10).map(item => ({
    name: item.product_sku,
    current: item.total_quantity,
    min: item.min_stock,
    max: item.max_stock,
    status: item.status
  }))

  const utilizationChartData = locationUtilization.map(item => ({
    name: item.warehouse_name.length > 8 ? item.warehouse_name.substring(0, 8) + '...' : item.warehouse_name,
    utilization: Math.round(item.utilization_rate),
    occupied: item.occupied_locations,
    total: item.total_locations
  }))

  useEffect(() => {
    fetchReportData()
  }, [])

  async function fetchReportData() {
    setLoading(true)
    
    try {
      // Basic stats
      const [warehousesRes, locationsRes, productsRes, inventoryRes] = await Promise.all([
        supabase.from('warehouses').select('id'),
        supabase.from('locations').select('id').eq('is_active', true),
        supabase.from('products').select('id').eq('is_active', true),
        supabase.from('inventory').select('id')
      ])

      // Inventory summary with stock levels
      const inventoryStatsRes = await supabase
        .from('inventory')
        .select(`
          product_id,
          quantity,
          products!inner(
            id,
            name,
            sku,
            min_stock,
            max_stock,
            is_active
          )
        `)
        .eq('products.is_active', true)

      // Location utilization
      const locationUtilRes = await supabase
        .from('warehouses')
        .select(`
          name,
          locations!warehouse_id(
            id,
            is_active,
            inventory(id)
          )
        `)

      // Process basic stats
      const basicStats = {
        totalWarehouses: warehousesRes.data?.length || 0,
        totalLocations: locationsRes.data?.length || 0,
        totalProducts: productsRes.data?.length || 0,
        totalInventoryItems: inventoryRes.data?.length || 0,
        lowStockProducts: 0,
        outOfStockProducts: 0
      }

      // Process inventory summary
      const inventoryMap = new Map<string, {
        product: any,
        totalQuantity: number,
        locationCount: number
      }>()

      inventoryStatsRes.data?.forEach(item => {
        const key = item.product_id
        if (!inventoryMap.has(key)) {
          inventoryMap.set(key, {
            product: item.products,
            totalQuantity: 0,
            locationCount: 0
          })
        }
        const existing = inventoryMap.get(key)!
        existing.totalQuantity += item.quantity
        existing.locationCount += 1
      })

      const inventorySummaryData: InventorySummary[] = Array.from(inventoryMap.entries()).map(([productId, data]) => {
        const { product, totalQuantity, locationCount } = data
        let status: InventorySummary['status'] = 'normal'
        
        if (totalQuantity === 0) {
          status = 'out_of_stock'
          basicStats.outOfStockProducts++
        } else if (totalQuantity < product.min_stock) {
          status = 'low'
          basicStats.lowStockProducts++
        } else if (totalQuantity > product.max_stock) {
          status = 'overstock'
        }

        return {
          product_id: productId,
          product_name: product.name,
          product_sku: product.sku,
          total_quantity: totalQuantity,
          min_stock: product.min_stock,
          max_stock: product.max_stock,
          location_count: locationCount,
          status
        }
      })

      // Process location utilization
      const locationUtilData: LocationUtilization[] = locationUtilRes.data?.map(warehouse => {
        const totalLocations = warehouse.locations?.filter(loc => loc.is_active).length || 0
        const occupiedLocations = warehouse.locations?.filter(loc => 
          loc.is_active && loc.inventory && loc.inventory.length > 0
        ).length || 0
        
        return {
          warehouse_name: warehouse.name,
          total_locations: totalLocations,
          occupied_locations: occupiedLocations,
          utilization_rate: totalLocations > 0 ? (occupiedLocations / totalLocations) * 100 : 0
        }
      }) || []

      setStats(basicStats)
      setInventorySummary(inventorySummaryData.sort((a, b) => a.product_name.localeCompare(b.product_name)))
      setLocationUtilization(locationUtilData)
    } catch (error) {
      console.error('Error fetching report data:', error)
    }
    
    setLoading(false)
  }

  function getStatusBadge(status: InventorySummary['status']) {
    switch (status) {
      case 'out_of_stock':
        return <Badge variant="destructive">欠品</Badge>
      case 'low':
        return <Badge variant="secondary">少量</Badge>
      case 'overstock':
        return <Badge variant="outline">過剰</Badge>
      default:
        return <Badge variant="default">正常</Badge>
    }
  }

  function getUtilizationColor(rate: number) {
    if (rate >= 80) return 'text-red-600'
    if (rate >= 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">レポート・ダッシュボード</h1>
        <div className="text-sm text-gray-500">
          最終更新: {new Date().toLocaleString('ja-JP')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総倉庫数</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWarehouses}</div>
            <p className="text-xs text-muted-foreground">アクティブな倉庫</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総ロケーション数</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLocations}</div>
            <p className="text-xs text-muted-foreground">利用可能なロケーション</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">商品種類数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">登録済み商品</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在庫アイテム数</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInventoryItems}</div>
            <p className="text-xs text-muted-foreground">在庫管理中のアイテム</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在庫不足アラート</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">最小在庫を下回る商品</p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">欠品アラート</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStockProducts}</div>
            <p className="text-xs text-muted-foreground">在庫切れの商品</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Stock Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              在庫ステータス分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">読み込み中...</div>
            ) : stockStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}商品`, '商品数']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                データがありません
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Utilization Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              倉庫別ロケーション利用率
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">読み込み中...</div>
            ) : utilizationChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={utilizationChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'utilization') return [`${value}%`, '利用率']
                      return [value, name]
                    }}
                    labelFormatter={(label) => `倉庫: ${label}`}
                  />
                  <Bar dataKey="utilization" fill="#0088FE" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                データがありません
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Levels Area Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            在庫レベル分析（上位10商品）
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">読み込み中...</div>
          ) : inventoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={inventoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    const labels = {
                      current: '現在在庫',
                      min: '最小在庫',
                      max: '最大在庫'
                    }
                    return [value, labels[name as keyof typeof labels] || name]
                  }}
                  labelFormatter={(label) => `商品SKU: ${label}`}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="max" 
                  stackId="1" 
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  fillOpacity={0.3}
                  name="最大在庫"
                />
                <Area 
                  type="monotone" 
                  dataKey="current" 
                  stackId="2" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.7}
                  name="現在在庫"
                />
                <Line 
                  type="monotone" 
                  dataKey="min" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                  dot={{ fill: '#ff7300', strokeWidth: 2, r: 4 }}
                  name="最小在庫"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              データがありません
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              在庫サマリー（詳細）
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">読み込み中...</div>
            ) : (
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品</TableHead>
                      <TableHead>在庫数</TableHead>
                      <TableHead>ステータス</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventorySummary.slice(0, 10).map((item) => (
                      <TableRow key={item.product_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.product_name}</div>
                            <div className="text-sm text-muted-foreground">{item.product_sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{item.total_quantity}</div>
                            <div className="text-muted-foreground">
                              ({item.min_stock}-{item.max_stock})
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(item.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Utilization Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5" />
              倉庫利用状況詳細
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">読み込み中...</div>
            ) : (
              <div className="space-y-4">
                {locationUtilization.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                      <div className="font-medium">{item.warehouse_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.occupied_locations} / {item.total_locations} ロケーション使用中
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${getUtilizationColor(item.utilization_rate).includes('red') ? 'bg-red-500' : getUtilizationColor(item.utilization_rate).includes('yellow') ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${item.utilization_rate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className={`text-right ${getUtilizationColor(item.utilization_rate)}`}>
                      <div className="font-bold text-2xl">{item.utilization_rate.toFixed(1)}%</div>
                      <div className="text-xs">利用率</div>
                    </div>
                  </div>
                ))}
                {locationUtilization.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    データがありません
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}