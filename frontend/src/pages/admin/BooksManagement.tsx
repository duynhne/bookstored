import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/layout/AdminLayout'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Table, ActionMenu, ActionMenuItem, Pagination } from '../../components/ui/Table'
import { booksService } from '../../services/api'
import { DollarSign, Edit, Trash2 } from 'lucide-react'
import type { Book, BookFormData } from '../../types'
import { useToast } from '../../components/ui/Toast'

const BooksManagement: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const toast = useToast()
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  })
  
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    category: '',
    description: '',
    price: 0,
    stock: 0,
    image_url: '',
    publisher: '',
    publish_date: '',
    distributor: '',
    dimensions: '',
    pages: 0,
    weight: 0,
  })

  const fetchBooks = async (page: number = 1) => {
    try {
      setLoading(true)
      const data = await booksService.getBooks({ page, per_page: 20 })
      setBooks(data.books)  // Fixed: use 'books' not 'items'
      setCurrentPage(data.page)
      setTotalPages(data.pages)
    } catch (error) {
      console.error('Failed to fetch books:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  const handleOpenModal = (book?: Book) => {
    if (book) {
      setEditingBook(book)
      setFormData({
        title: book.title,
        author: book.author,
        category: book.category,
        description: book.description,
        price: book.price,
        stock: book.stock,
        image_url: book.image_url,
        publisher: book.publisher || '',
        publish_date: book.publish_date || '',
        distributor: book.distributor || '',
        dimensions: book.dimensions || '',
        pages: book.pages || 0,
        weight: book.weight || 0,
      })
    } else {
      setEditingBook(null)
      setFormData({
        title: '',
        author: '',
        category: '',
        description: '',
        price: 0,
        stock: 0,
        image_url: '',
        publisher: '',
        publish_date: '',
        distributor: '',
        dimensions: '',
        pages: 0,
        weight: 0,
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingBook(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (editingBook) {
        await booksService.updateBook(editingBook.id, formData)
      } else {
        await booksService.createBook(formData)
      }
      await fetchBooks(currentPage)
      handleCloseModal()
    } catch (error) {
      console.error('Failed to save book:', error)
      toast.error(error instanceof Error ? error.message : 'Lỗi khi lưu sách')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (bookId: number) => {
    setDialogState({
      isOpen: true,
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc muốn xóa sách này?',
      onConfirm: async () => {
        try {
          setLoading(true)
          await booksService.deleteBook(bookId)
          toast.success('Đã xóa sách')
          await fetchBooks(currentPage)
        } catch (error) {
          console.error('Failed to delete book:', error)
          toast.error('Lỗi khi xóa sách')
        } finally {
          setLoading(false)
        }
      }
    })
  }

  const columns = [
    { key: 'id', label: 'Mã Sách' },
    { key: 'title', label: 'Tên Sách' },
    { key: 'publisher', label: 'Nhà Xuất Bản' },
    { key: 'author', label: 'Tác Giả' },
    {
      key: 'price',
      label: 'Giá',
      render: (book: Book) => `${book.price.toLocaleString('vi-VN')} đ`,
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (book: Book) => (
        <div className="max-w-xs truncate">{book.description}</div>
      ),
    },
  ]

  return (
    <AdminLayout title="Quản Lý Sách">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Danh Sách Sách</h2>
          <Button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2"
          >
            <DollarSign className="h-5 w-5" />
            Thêm Sách
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table
            data={books}
            columns={columns}
            actions={(book) => (
              <ActionMenu>
                <ActionMenuItem
                  onClick={() => handleOpenModal(book)}
                  icon={<Edit className="h-4 w-4" />}
                >
                  Sửa
                </ActionMenuItem>
                <ActionMenuItem
                  onClick={() => handleDelete(book.id)}
                  icon={<Trash2 className="h-4 w-4" />}
                  variant="danger"
                >
                  Xóa
                </ActionMenuItem>
              </ActionMenu>
            )}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={fetchBooks}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBook ? 'Sửa Sách' : 'Thêm Sách Mới'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tên Sách *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              label="Tác Giả *"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
            <Input
              label="Thể Loại *"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
            <Input
              label="Giá *"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
            />
            <Input
              label="Số Lượng *"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              required
            />
            <Input
              label="URL Ảnh *"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              required
            />
            <Input
              label="Nhà Xuất Bản"
              value={formData.publisher}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
            />
            <Input
              label="Ngày Xuất Bản"
              value={formData.publish_date}
              onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
              placeholder="DD/MM/YYYY"
            />
            <Input
              label="Nhà Phát Hành"
              value={formData.distributor}
              onChange={(e) => setFormData({ ...formData, distributor: e.target.value })}
            />
            <Input
              label="Kích Thước (cm)"
              value={formData.dimensions}
              onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
              placeholder="15.5 x 24.5 x 3.0"
            />
            <Input
              label="Số Trang"
              type="number"
              value={formData.pages}
              onChange={(e) => setFormData({ ...formData, pages: Number(e.target.value) })}
            />
            <Input
              label="Trọng Lượng (g)"
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô Tả *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit" loading={loading}>
              {editingBook ? 'Cập Nhật' : 'Thêm Mới'}
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

export default BooksManagement

