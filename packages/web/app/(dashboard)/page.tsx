import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Truck, AlertCircle, CheckCircle } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">ダッシュボード</h1>
      
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総在庫数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,345</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本日の入庫</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">
              5件の入庫予定
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本日の出庫</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">189</div>
            <p className="text-xs text-muted-foreground">
              12件の出庫予定
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アラート</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              要対応
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近の活動</CardTitle>
            <CardDescription>直近の在庫移動履歴</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">商品SKU-{i}を移動</p>
                    <p className="text-xs text-muted-foreground">A-1-1から B-2-3へ 100個</p>
                  </div>
                  <p className="text-xs text-muted-foreground">5分前</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>在庫アラート</CardTitle>
            <CardDescription>注意が必要な在庫</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">商品ABC-123</p>
                  <p className="text-xs text-muted-foreground">在庫残少（残り: 5個）</p>
                </div>
              </div>
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">商品XYZ-789</p>
                  <p className="text-xs text-muted-foreground">有効期限接近（3日後）</p>
                </div>
              </div>
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">商品DEF-456</p>
                  <p className="text-xs text-muted-foreground">最大在庫超過（120%）</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}