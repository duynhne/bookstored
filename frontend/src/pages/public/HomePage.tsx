import React, { useEffect, useState } from 'react'
import { PublicHeader } from '../../components/layout/PublicHeader'
import { PublicFooter } from '../../components/layout/PublicFooter'
import { BookCard } from '../../components/shared/BookCard'
import { booksService, bannersService } from '../../services/api'
import type { Book, Banner } from '../../types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const HomePage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const perPage = 15

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch books and banners in parallel
        const [booksData, bannersData] = await Promise.all([
          booksService.getBooks({ page: 1, per_page: perPage }),
          bannersService.getBanners('all')
        ])
        
        setBooks(booksData.books)
        setBanners(bannersData.banners)
        setHasMore(booksData.page < booksData.pages)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Separate banners by position
  const mainBanners = banners.filter(b => b.position === 'main')
  const sideBanners = banners.filter(b => b.position === 'side_top' || b.position === 'side_bottom')

  useEffect(() => {
    if (mainBanners.length === 0) return
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mainBanners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [mainBanners.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mainBanners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + mainBanners.length) % mainBanners.length)
  }

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    
    try {
      setLoadingMore(true)
      const nextPage = currentPage + 1
      const data = await booksService.getBooks({ page: nextPage, per_page: perPage })
      setBooks((prev) => [...prev, ...data.books])
      setCurrentPage(nextPage)
      setHasMore(data.page < data.pages)
    } catch (error) {
      console.error('Failed to load more books:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Carousel Section */}
        <div className="flex gap-6 mb-12">
          {/* Main Carousel */}
          <div className="flex-1 relative">
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              {mainBanners.length > 0 ? (
                <>
                  {mainBanners.map((banner, index) => (
                    <div
                      key={banner.id}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        backgroundColor: banner.bg_color,
                        color: banner.text_color,
                      }}
                    >
                      {banner.image_url ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={banner.image_url} 
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="text-center">
                              <h2 className="text-5xl font-bold text-white mb-2">{banner.title}</h2>
                              {banner.description && (
                                <p className="text-xl text-white/90">{banner.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <h2 className="text-5xl font-bold mb-2">{banner.title}</h2>
                            {banner.description && (
                              <p className="text-xl opacity-90">{banner.description}</p>
                            )}
                          </div>
                        </div>
                      )}
                      {banner.link && (
                        <a 
                          href={banner.link} 
                          className="absolute inset-0 cursor-pointer"
                          aria-label={banner.title}
                        />
                      )}
                    </div>
                  ))}
                  
                  {/* Arrow Buttons - Only show if more than 1 banner */}
                  {mainBanners.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg z-10"
                      >
                        <ChevronLeft className="h-6 w-6 text-gray-800" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg z-10"
                      >
                        <ChevronRight className="h-6 w-6 text-gray-800" />
                      </button>
                      
                      {/* Dot Indicators */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {mainBanners.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                              index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-3xl font-bold">
                  Chưa có banner
                </div>
              )}
            </div>
          </div>

          {/* Side Banners */}
          <div className="flex flex-col gap-4">
            {sideBanners.slice(0, 2).map((banner) => (
              <div 
                key={banner.id}
                className="w-96 h-[192px] rounded-lg overflow-hidden relative cursor-pointer"
                style={{
                  backgroundColor: banner.bg_color,
                  color: banner.text_color,
                }}
                onClick={() => banner.link && window.open(banner.link, '_blank')}
              >
                {banner.image_url ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={banner.image_url} 
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <h3 className="text-2xl font-bold text-white">{banner.title}</h3>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <h3 className="text-2xl font-bold">{banner.title}</h3>
                  </div>
                )}
              </div>
            ))}
            {sideBanners.length === 0 && (
              <>
                <div className="w-96 h-[192px] rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                  SALE EXAMPLE
                </div>
                <div className="w-96 h-[192px] rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                  SALE EXAMPLE
                </div>
              </>
            )}
          </div>
        </div>

        {/* Best Sellers Section */}
        <div className="mb-12">
          <div className="bg-primary h-15 flex items-center px-6 mb-6 rounded-t-lg">
            <h2 className="text-white text-xl font-semibold uppercase">
              SẢN PHẨM BÁN CHẠY
            </h2>
          </div>
          
          {loading ? (
            <div className="text-center py-12">Đang tải...</div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
              
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {loadingMore ? 'Đang tải...' : 'Xem Thêm'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

export default HomePage

