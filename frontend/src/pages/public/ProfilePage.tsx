import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PublicHeader } from '../../components/layout/PublicHeader'
import { PublicFooter } from '../../components/layout/PublicFooter'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { authService, ordersService } from '../../services/api'
import type { Order } from '../../types'
import { Edit2, Save, X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  })

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login')
      return
    }

    // Redirect if not customer
    if (user.role !== 'customer') {
      toast.error('Trang này chỉ dành cho khách hàng')
      navigate('/')
      return
    }

    // Fetch orders
    const fetchOrders = async () => {
      try {
        const data = await ordersService.getOrders()
        setOrders(data)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setOrdersLoading(false)
      }
    }

    fetchOrders()
  }, [user, navigate, toast])

  const handleEdit = () => {
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
    })
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      toast.error('Vui lòng nhập họ tên')
      return
    }

    if (!formData.email.trim()) {
      toast.error('Vui lòng nhập email')
      return
    }

    try {
      setLoading(true)
      const updatedUser = await authService.updateProfile({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
      })
      
      setUser(updatedUser)
      setIsEditing(false)
      toast.success('Cập nhật thông tin thành công')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Cập nhật thất bại')
    } finally {
      setLoading(false)
    }
  }

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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>

        {/* Profile Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Thông tin tài khoản</h2>
            {!isEditing ? (
              <Button
                variant="outline"
                onClick={handleEdit}
                icon={<Edit2 className="h-4 w-4" />}
              >
                Chỉnh sửa
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  icon={<X className="h-4 w-4" />}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  icon={<Save className="h-4 w-4" />}
                >
                  Lưu
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <Input
                value={user.username}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <Input
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="Nhập họ và tên"
                />
              ) : (
                <Input value={user.full_name} disabled className="bg-gray-50" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Nhập email"
                />
              ) : (
                <Input value={user.email} disabled className="bg-gray-50" />
              )}
            </div>
          </div>
        </div>

        {/* Order History Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Lịch sử đơn hàng</h2>

          {ordersLoading ? (
            <div className="text-center py-12">Đang tải...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Bạn chưa có đơn hàng nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        Mã đơn hàng: #{order.id}
                      </p>
                      <p className="text-sm text-gray-600">
                        Ngày đặt:{' '}
                        {new Date(order.created_at).toLocaleDateString('vi-VN')}
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
                    {order.items &&
                      order.items.map((item) => (
                        <div key={item.id} className="flex gap-4 mb-3">
                          <img
                            src={item.book.image_url}
                            alt={item.book.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.book.title}</p>
                            <p className="text-sm text-gray-600">
                              Số lượng: {item.quantity}
                            </p>
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
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

export default ProfilePage

