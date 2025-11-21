import axios, { AxiosInstance, AxiosError } from 'axios'
import type {
  User,
  LoginRequest,
  RegisterRequest,
  Book,
  BookFormData,
  CartItem,
  AddToCartRequest,
  Order,
  CreateOrderRequest,
  Statistics,
  PaginatedResponse,
  Banner,
  BannerFormData,
} from '../types'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Error handler
const handleError = (error: AxiosError) => {
  if (error.response) {
    // Handle different response data types
    const data = error.response.data
    let message = 'An error occurred'
    
    if (typeof data === 'string') {
      message = data
    } else if (data && typeof data === 'object') {
      // Backend returns {error: "message"} or {message: "message"}
      message = (data as any).error || (data as any).message || message
    }
    
    throw new Error(message)
  } else if (error.request) {
    throw new Error('No response from server')
  } else {
    throw new Error(error.message)
  }
}

// Auth Service
export const authService = {
  async login(data: LoginRequest): Promise<User> {
    try {
      const response = await api.post('/login', data)
      return response.data.user
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  async register(data: RegisterRequest): Promise<User> {
    try {
      const response = await api.post('/register', data)
      return response.data.user
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/logout')
    } catch (error) {
      handleError(error as AxiosError)
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/me')
      return response.data.user
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  async updateProfile(data: { full_name?: string; email?: string }): Promise<User> {
    try {
      const response = await api.put('/profile', data)
      return response.data.user
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },
}

// Books Service
export const booksService = {
  async getBooks(params?: {
    page?: number
    per_page?: number
    search?: string
    category?: string
    author?: string
  }): Promise<PaginatedResponse<Book>> {
    try {
      const response = await api.get('/books', { params })
      return response.data
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  async getBook(id: number): Promise<Book> {
    try {
      const response = await api.get(`/books/${id}`)
      return response.data.book
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  async createBook(data: BookFormData): Promise<Book> {
    try {
      const response = await api.post('/books', data)
      return response.data.book
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  async updateBook(id: number, data: Partial<BookFormData>): Promise<Book> {
    try {
      const response = await api.put(`/books/${id}`, data)
      return response.data.book
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  async deleteBook(id: number): Promise<void> {
    try {
      await api.delete(`/books/${id}`)
    } catch (error) {
      handleError(error as AxiosError)
    }
  },
}

// Cart Service
export const cartService = {
  async getCart(): Promise<CartItem[]> {
    try {
      const response = await api.get('/cart')
      return response.data.cart
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  async addToCart(data: AddToCartRequest): Promise<CartItem> {
    try {
      const response = await api.post('/cart', data)
      return response.data.cart_item
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    try {
      const response = await api.put(`/cart/${id}`, { quantity })
      return response.data.cart_item
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  async removeFromCart(id: number): Promise<void> {
    try {
      await api.delete(`/cart/${id}`)
    } catch (error) {
      handleError(error as AxiosError)
    }
  },
}

// Orders Service
export const ordersService = {
  async getOrders(): Promise<Order[]> {
    try {
      const response = await api.get('/orders')
      return response.data.orders
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  async getOrder(id: number): Promise<Order> {
    try {
      const response = await api.get(`/orders/${id}`)
      return response.data.order
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  async createOrder(data: CreateOrderRequest): Promise<Order> {
    try {
      const response = await api.post('/orders', data)
      return response.data.order
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },
}

// Admin Service
export const adminService = {
  async getUsers(): Promise<User[]> {
    try {
      const response = await api.get('/admin/users')
      return response.data.users
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  async updateUserStatus(id: number, is_active: boolean): Promise<User> {
    try {
      const response = await api.put(`/admin/users/${id}/status`, { is_active })
      return response.data.user
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  async getAllOrders(): Promise<Order[]> {
    try {
      const response = await api.get('/admin/orders')
      return response.data.orders
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  async updateOrderStatus(
    id: number,
    data: { status?: string; payment_status?: string }
  ): Promise<Order> {
    try {
      const response = await api.put(`/admin/orders/${id}/status`, data)
      return response.data.order
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  async getStatistics(): Promise<Statistics> {
    try {
      const response = await api.get('/admin/statistics')
      return response.data
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },
}

// Banners Service
export const bannersService = {
  // Public: Get active banners
  async getBanners(position?: 'main' | 'side_top' | 'side_bottom' | 'all'): Promise<{ banners: Banner[] }> {
    try {
      const params = position && position !== 'all' ? { position } : {}
      const response = await api.get('/banners', { params })
      return response.data
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  // Admin: Get all banners
  async getAllBanners(params?: {
    page?: number
    per_page?: number
  }): Promise<{
    banners: Banner[]
    total: number
    page: number
    per_page: number
    pages: number
  }> {
    try {
      const response = await api.get('/admin/banners', { params })
      return response.data
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  // Admin: Get single banner
  async getBanner(id: number): Promise<Banner> {
    try {
      const response = await api.get(`/admin/banners/${id}`)
      return response.data.banner
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  // Admin: Create banner
  async createBanner(data: BannerFormData): Promise<Banner> {
    try {
      const response = await api.post('/admin/banners', data)
      return response.data.banner
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  // Admin: Update banner
  async updateBanner(id: number, data: Partial<BannerFormData>): Promise<Banner> {
    try {
      const response = await api.put(`/admin/banners/${id}`, data)
      return response.data.banner
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  // Admin: Delete banner
  async deleteBanner(id: number): Promise<void> {
    try {
      await api.delete(`/admin/banners/${id}`)
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },

  // Admin: Toggle banner status
  async toggleBannerStatus(id: number): Promise<Banner> {
    try {
      const response = await api.put(`/admin/banners/${id}/toggle`)
      return response.data.banner
    } catch (error) {
      handleError(error as AxiosError)
      throw error
    }
  },
}

export default api

