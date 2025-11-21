import React, { useEffect, useState } from 'react'
import { PublicHeader } from '../../components/layout/PublicHeader'
import { PublicFooter } from '../../components/layout/PublicFooter'
import { ordersService } from '../../services/api'
import type { Order } from '../../types'

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersService.getOrders()
        setOrders(data)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>

        {loading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">Bạn chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Mã đơn hàng: #{order.id}</p>
                    <p className="text-sm text-gray-600">
                      Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {/* Payment Method Badge */}
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      COD
                    </span>
                    {/* Order Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  {order.items && order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 mb-3">
                      <img
                        src={item.book.image_url}
                        alt={item.book.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.book.title}</p>
                        <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                        <p className="text-sm font-semibold text-primary">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Địa chỉ: {order.shipping_address}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    Tổng: {formatPrice(order.total_amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}

export default OrdersPage

