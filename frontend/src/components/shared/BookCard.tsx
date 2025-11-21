import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { Book } from '../../types'

interface BookCardProps {
  book: Book
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const navigate = useNavigate()
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  return (
    <div
      onClick={() => navigate(`/book/${book.id}`)}
      className="group cursor-pointer"
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={book.image_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900 text-center line-clamp-2 min-h-[3rem]">
            {book.title}
          </h3>
          <p className="text-primary font-semibold text-center mt-2">
            {formatPrice(book.price)}
          </p>
        </div>
      </div>
    </div>
  )
}

