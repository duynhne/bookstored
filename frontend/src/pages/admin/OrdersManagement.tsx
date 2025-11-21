import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Table, ActionMenu, ActionMenuItem } from '../../components/ui/Table'
import { adminService } from '../../services/api'
import { useToast } from '../../components/ui/Toast'
import { Edit } from 'lucide-react'
import type { Order } from '../../types'

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [formData, setFormData] = useState({
    status: 'pending',
    payment_status: 'pending'
  })
  const toast = useToast()

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllOrders()
      setOrders(data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleEdit = (order: Order) => {
    setEditingOrder(order)
    setFormData({
      status: order.status,
      payment_status: order.payment_status
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingOrder(null)
    setFormData({
      status: 'pending',
      payment_status: 'pending'
    })
  }

  const handleSubmit = async () => {
    if (!editingOrder) return

    try {
      setLoading(true)
      await adminService.updateOrderStatus(editingOrder.id, formData)
      toast.success('Đã cập nhật trạng thái đơn hàng')
      await fetchOrders()
      handleCloseModal()
    } catch (error) {
      console.error('Failed to update order status:', error)
      toast.error('Lỗi khi cập nhật trạng thái')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status === 'pending' ? 'Chờ xác nhận' : 
         status === 'confirmed' ? 'Đã xác nhận' :
         status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
      </span>
    )
  }

  const columns = [
    { key: 'id', label: 'Mã Hóa Đơn' },
    { key: 'user_id', label: 'Số Hóa Đơn' },
    {
      key: 'total_amount',
      label: 'Tổng Tiền',
      render: (order: Order) => `${order.total_amount.toLocaleString('vi-VN')} đ`,
    },
    {
      key: 'created_at',
      label: 'Ngày Lập',
      render: (order: Order) => new Date(order.created_at).toLocaleDateString('vi-VN'),
    },
    {
      key: 'status',
      label: 'Tình Trạng',
      render: (order: Order) => getStatusBadge(order.status),
    },
  ]

  return (
    <AdminLayout title="Quản Lý Hóa Đơn">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Danh Sách Hóa Đơn</h2>

        <div className="bg-white rounded-lg shadow">
          <Table
            data={orders}
            columns={columns}
            loading={loading}
            keyExtractor={(order) => order.id}
            actions={(order) => (
              <ActionMenu>
                <ActionMenuItem
                  onClick={() => handleEdit(order)}
                  icon={<Edit className="h-4 w-4" />}
                >
                  Sửa Trạng Thái
                </ActionMenuItem>
              </ActionMenu>
            )}
          />
        </div>
      </div>

      {/* Edit Status Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Cập Nhật Trạng Thái Đơn Hàng"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng Thái Đơn Hàng
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng Thái Thanh Toán
            </label>
            <select
              value={formData.payment_status}
              onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="pending">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              loading={loading}
            >
              Cập Nhật
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}

export default OrdersManagement

