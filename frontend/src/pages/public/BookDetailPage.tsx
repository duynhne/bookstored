import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PublicHeader } from '../../components/layout/PublicHeader'
import { PublicFooter } from '../../components/layout/PublicFooter'
import { Button } from '../../components/ui/Button'
import { booksService } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { useToast } from '../../components/ui/Toast'
import { Minus, Plus, ShoppingCart, CreditCard, Star } from 'lucide-react'
import type { Book } from '../../types'

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [book, setBook] = useState<Book | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { addToCart } = useCart()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return
      try {
        const data = await booksService.getBook(Number(id))
        setBook(data)
      } catch (error) {
        console.error('Failed to fetch book:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [id])

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!book) return

    try {
      await addToCart(book.id, quantity)
      toast.success('Đã thêm vào giỏ hàng!')
    } catch (error) {
      toast.error('Lỗi khi thêm vào giỏ hàng')
    }
  }

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    await handleAddToCart()
    navigate('/cart')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="container mx-auto px-4 py-8 text-center">Đang tải...</div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        <div className="container mx-auto px-4 py-8 text-center">Không tìm thấy sách</div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Book Image */}
            <div>
              <img
                src={book.image_url}
                alt={book.title}
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
            </div>

            {/* Book Info */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
              
              <div className="space-y-2 text-gray-600">
                <p>
                  <span className="font-medium">Nhà Xuất Bản:</span>{' '}
                  <span className="text-primary">{book.publisher || 'N/A'}</span>
                </p>
                <p>
                  <span className="font-medium">Tác Giả:</span>{' '}
                  <span className="text-primary">{book.author}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-gray-600">(24)</span>
              </div>

              <div className="text-4xl font-bold text-primary">
                {formatPrice(book.price)}
              </div>

              <div>
                {book.stock > 0 ? (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Còn hàng
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    Hết hàng
                  </span>
                )}
              </div>

              {user && book.stock > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 h-10 text-center border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleBuyNow} className="flex-1">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Mua Ngay
                    </Button>
                    <Button onClick={handleAddToCart} variant="outline" className="flex-1">
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Thêm Giỏ Hàng
                    </Button>
                  </div>
                </div>
              )}

              {!user && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Vui lòng <a href="/login" className="text-primary hover:underline font-medium">đăng nhập</a> để mua sản phẩm
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="mt-12 space-y-6">
            <div>
              <div className="bg-primary h-12 flex items-center px-6 rounded-t-lg">
                <h2 className="text-white text-lg font-semibold">THÔNG TIN CHI TIẾT</h2>
              </div>
              <div className="border border-gray-200 rounded-b-lg p-6 space-y-3">
                <p><span className="font-medium">Mã Sách:</span> {book.id}</p>
                <p><span className="font-medium">Nhà Xuất Bản:</span> {book.publisher || 'N/A'}</p>
                <p><span className="font-medium">Tác Giả:</span> {book.author}</p>
                <p><span className="font-medium">Năm Xuất Bản:</span> {book.publish_date || 'N/A'}</p>
                <p><span className="font-medium">Số Trang:</span> {book.pages || 'N/A'}</p>
              </div>
            </div>

            <div>
              <div className="bg-primary h-12 flex items-center px-6 rounded-t-lg">
                <h2 className="text-white text-lg font-semibold">GIỚI THIỆU SẢN PHẨM</h2>
              </div>
              <div className="border border-gray-200 rounded-b-lg p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{book.description}</p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

export default BookDetailPage

