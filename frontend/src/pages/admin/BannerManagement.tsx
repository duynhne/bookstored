import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Table, ActionMenu, ActionMenuItem, Pagination } from '../../components/ui/Table'
import { bannersService } from '../../services/api'
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import type { Banner, BannerFormData } from '../../types'
import { useToast } from '../../components/ui/Toast'

const BannerManagement: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const toast = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })
  
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    description: '',
    image_url: '',
    link: '',
    bg_color: '#6366f1',
    text_color: '#ffffff',
    position: 'main',
    display_order: 0,
    is_active: true,
  })

  const fetchBanners = async (page: number = 1) => {
    try {
      setLoading(true)
      const data = await bannersService.getAllBanners({ page, per_page: 20 })
      setBanners(data.banners)
      setCurrentPage(data.page)
      setTotalPages(data.pages)
    } catch (error) {
      console.error('Failed to fetch banners:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const handleOpenModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner)
      setFormData({
        title: banner.title,
        description: banner.description || '',
        image_url: banner.image_url,
        link: banner.link || '',
        bg_color: banner.bg_color,
        text_color: banner.text_color,
        position: banner.position,
        display_order: banner.display_order,
        is_active: banner.is_active,
      })
    } else {
      setEditingBanner(null)
      setFormData({
        title: '',
        description: '',
        image_url: '',
        link: '',
        bg_color: '#6366f1',
        text_color: '#ffffff',
        position: 'main',
        display_order: 0,
        is_active: true,
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingBanner(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingBanner) {
        await bannersService.updateBanner(editingBanner.id, formData)
      } else {
        await bannersService.createBanner(formData)
      }
      handleCloseModal()
      fetchBanners(currentPage)
    } catch (error) {
      console.error('Failed to save banner:', error)
      toast.error(error instanceof Error ? error.message : 'Lỗi khi lưu banner')
    }
  }

  const handleDelete = async (id: number) => {
    setDialogState({
      isOpen: true,
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc muốn xóa banner này?',
      onConfirm: async () => {
        try {
          await bannersService.deleteBanner(id)
          toast.success('Đã xóa banner')
          fetchBanners(currentPage)
        } catch (error) {
          console.error('Failed to delete banner:', error)
          toast.error('Lỗi khi xóa banner')
        }
      }
    })
  }

  const handleToggleStatus = async (id: number) => {
    try {
      await bannersService.toggleBannerStatus(id)
      fetchBanners(currentPage)
    } catch (error) {
      console.error('Failed to toggle banner status:', error)
      toast.error('Lỗi khi thay đổi trạng thái banner')
    }
  }

  const columns = [
    {
      key: 'id',
      label: 'ID',
      width: '5%',
    },
    {
      key: 'image',
      label: 'Hình ảnh',
      width: '15%',
      render: (banner: Banner) => (
        <img 
          src={banner.image_url} 
          alt={banner.title}
          className="h-16 w-24 object-cover rounded"
        />
      ),
    },
    {
      key: 'title',
      label: 'Tiêu đề',
      width: '20%',
    },
    {
      key: 'position',
      label: 'Vị trí',
      width: '10%',
      render: (banner: Banner) => (
        <span className={`px-2 py-1 rounded text-xs ${
          banner.position === 'main' ? 'bg-blue-100 text-blue-700' :
          banner.position === 'side_top' ? 'bg-green-100 text-green-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {banner.position === 'main' ? 'Chính' : 
           banner.position === 'side_top' ? 'Phụ trên' : 'Phụ dưới'}
        </span>
      ),
    },
    {
      key: 'display_order',
      label: 'Thứ tự',
      width: '8%',
    },
    {
      key: 'is_active',
      label: 'Trạng thái',
      width: '10%',
      render: (banner: Banner) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {banner.is_active ? 'Hoạt động' : 'Tắt'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      width: '12%',
      render: (banner: Banner) => (
        <ActionMenu>
          <ActionMenuItem
            icon={<Edit className="h-4 w-4" />}
            onClick={() => handleOpenModal(banner)}
          >
            Sửa
          </ActionMenuItem>
          <ActionMenuItem
            icon={banner.is_active ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
            onClick={() => handleToggleStatus(banner.id)}
          >
            {banner.is_active ? 'Tắt' : 'Bật'}
          </ActionMenuItem>
          <ActionMenuItem
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => handleDelete(banner.id)}
            variant="danger"
          >
            Xóa
          </ActionMenuItem>
        </ActionMenu>
      ),
    },
  ]

  return (
    <AdminLayout title="Quản Lý Banner">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Banner</h1>
          <Button
            onClick={() => handleOpenModal()}
            icon={<Plus className="h-5 w-5" />}
          >
            Thêm Banner
          </Button>
        </div>

        <Table
          data={banners}
          columns={columns}
          loading={loading}
          keyExtractor={(banner) => banner.id}
        />

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => fetchBanners(page)}
          />
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBanner ? 'Sửa Banner' : 'Thêm Banner Mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tiêu đề"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="VD: Sale cuối năm"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Mô tả ngắn về banner"
            />
          </div>

          <Input
            label="URL Hình ảnh"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            required
            placeholder="https://example.com/banner.jpg"
          />

          <Input
            label="Link (khi click banner)"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="https://example.com/sale"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Màu nền
              </label>
              <input
                type="color"
                value={formData.bg_color}
                onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Màu chữ
              </label>
              <input
                type="color"
                value={formData.text_color}
                onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vị trí
            </label>
            <select
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value as 'main' | 'side_top' | 'side_bottom' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="main">Banner chính (Carousel)</option>
              <option value="side_top">Banner phụ trên</option>
              <option value="side_bottom">Banner phụ dưới</option>
            </select>
          </div>

          <Input
            label="Thứ tự hiển thị"
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
            min={0}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Kích hoạt ngay
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit">
              {editingBanner ? 'Cập nhật' : 'Tạo mới'}
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

export default BannerManagement

