import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Table, ActionMenu, ActionMenuItem, Pagination } from '../../components/ui/Table'
import { adminService, authService } from '../../services/api'
import { UserPlus, Edit, Trash2 } from 'lucide-react'
import type { User } from '../../types'
import { useToast } from '../../components/ui/Toast'

interface StaffFormData {
  username: string
  password: string
  email: string
  full_name: string
}

const StaffManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 20
  const [formData, setFormData] = useState<StaffFormData>({
    username: '',
    password: '',
    email: '',
    full_name: '',
  })
  const toast = useToast()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await adminService.getUsers()
      const staffUsers = data.filter(u => u.role === 'admin')
      setUsers(staffUsers)
      setTotalPages(Math.ceil(staffUsers.length / itemsPerPage))
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const paginatedUsers = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        username: user.username,
        password: '', // Don't show password
        email: user.email,
        full_name: user.full_name || '',
      })
    } else {
      setEditingUser(null)
      setFormData({
        username: '',
        password: '',
        email: '',
        full_name: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      if (editingUser) {
        // Update logic - would need API endpoint
        toast.warning('Chức năng cập nhật chưa được implement')
      } else {
        // Create new staff (register as admin)
        await authService.register({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          full_name: formData.full_name,
        })
        // Note: New user will be 'user' role, need to update to 'admin'
        toast.success('Nhân viên mới đã được tạo. Cần update role thành staff trong DB.')
      }
      
      handleCloseModal()
      await fetchUsers()
    } catch (error) {
      console.error('Failed to save staff:', error)
      toast.error(error instanceof Error ? error.message : 'Lỗi khi lưu nhân viên')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: number) => {
    setDialogState({
      isOpen: true,
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc muốn xóa nhân viên này?',
      onConfirm: async () => {
        try {
          setLoading(true)
          await adminService.updateUserStatus(userId, false) // Deactivate instead of delete
          await fetchUsers()
          toast.success('Đã vô hiệu hóa nhân viên')
        } catch (error) {
          console.error('Failed to delete staff:', error)
          toast.error('Lỗi khi xóa nhân viên')
        } finally {
          setLoading(false)
        }
      }
    })
  }

  const columns = [
    { key: 'id', label: 'Mã NV', width: '10%' },
    { key: 'username', label: 'Username', width: '20%' },
    { key: 'email', label: 'Email', width: '25%' },
    { key: 'full_name', label: 'Họ Tên', width: '25%' },
    {
      key: 'is_active',
      label: 'Trạng thái',
      width: '15%',
      render: (user: User) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {user.is_active ? 'Hoạt động' : 'Vô hiệu'}
        </span>
      ),
    },
  ]

  return (
    <AdminLayout title="Quản Lý Nhân Viên">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Danh Sách Nhân Viên</h2>
          <Button
            onClick={() => handleOpenModal()}
            icon={<UserPlus className="h-5 w-5" />}
          >
            Thêm Nhân Viên
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table
            data={paginatedUsers}
            columns={columns}
            loading={loading}
            keyExtractor={(user) => user.id}
            actions={(user) => (
              <ActionMenu>
                <ActionMenuItem
                  onClick={() => handleOpenModal(user)}
                  icon={<Edit className="h-4 w-4" />}
                >
                  Sửa
                </ActionMenuItem>
                <ActionMenuItem
                  onClick={() => handleDelete(user.id)}
                  icon={<Trash2 className="h-4 w-4" />}
                  variant="danger"
                >
                  Xóa
                </ActionMenuItem>
              </ActionMenu>
            )}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Sửa Nhân Viên' : 'Thêm Nhân Viên'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            disabled={!!editingUser}
            placeholder="username"
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="email@example.com"
          />
          
          <Input
            label="Họ tên"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
            placeholder="Nguyễn Văn A"
          />
          
          {!editingUser && (
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Mật khẩu"
            />
          )}
          
          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {editingUser ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </form>
      </Modal>
      
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        onConfirm={dialogState.onConfirm}
        onCancel={() => setDialogState({ ...dialogState, isOpen: false })}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
      />
    </AdminLayout>
  )
}

export default StaffManagement

