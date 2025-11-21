# Changelog - Bookstore Migration

## [2.5.0] - 2024-11-21

### CI/CD Setup

#### GitHub Actions Workflow
- **Created `.github/workflows/docker-build.yml`**: Automated Docker image build and push
  - Triggers on push to `main` branch
  - Builds both frontend and backend images
  - Pushes to GitHub Container Registry (ghcr.io)
  - Images: `ghcr.io/duynhne/bookstore-frontend:latest` và `ghcr.io/duynhne/bookstore-backend:latest`
  - Uses Docker Buildx for multi-platform support
  - Implements GitHub Actions cache for faster builds
  - Build time: ~3-5 minutes
  
#### Production Deployment Updates
- **Updated `docker-compose.prod.yml`**: Changed from build to use pre-built images
  - Backend: `image: ghcr.io/duynhne/bookstore-backend:latest`
  - Frontend: `image: ghcr.io/duynhne/bookstore-frontend:latest`
  - Eliminates need to build on production server
  - Faster deployment with `docker-compose pull`
  - Consistent images across environments
  
#### Documentation Updates
- **`docs/09-DEPLOYMENT.md`**: Added comprehensive CI/CD section
  - GitHub Actions workflow explanation
  - Setup instructions for GitHub Container Registry
  - Deploy with pre-built images guide
  - Troubleshooting CI/CD issues
  - Local build vs CI/CD comparison table
  
- **`.gitignore`**: Enhanced with additional exclusions
  - Node.js (node_modules, npm-debug.log)
  - Docker volumes (postgres_data_prod, minio_data_prod, pgadmin_data_prod)
  - Frontend build artifacts (dist, build)
  
### Benefits
- ✅ Automated builds on every push to main
- ✅ No manual Docker build required on production
- ✅ Consistent images across all environments
- ✅ Faster deployments with pre-built images
- ✅ GitHub Container Registry integration (free)
- ✅ Cached builds for speed improvement

## [2.4.0] - 2024-11-21

### Upgraded Versions

#### Python 3.11 → 3.12
- **Performance**: Up to 5% faster execution
- **Better error messages**: Improved debugging experience
- **New syntax features**: Enhanced language capabilities
- **Compatibility**: All dependencies tested and working

#### Node.js 18 → 22
- **Latest LTS**: Long-term support until April 2027
- **Performance improvements**: Faster build and runtime
- **Security updates**: Latest security patches
- **Better ES module support**: Enhanced import/export handling

### Files Updated
- `backend/Dockerfile`: FROM python:3.11-slim → python:3.12-slim
- `frontend/Dockerfile`: FROM node:18-alpine → node:22-alpine
- `frontend/Dockerfile.dev`: FROM node:18-alpine → node:22-alpine

### Testing
- ✅ Development environment: Built and tested successfully
  - Frontend: http://localhost:5173 (Vite dev server with Node 22)
  - Backend: http://localhost:5000 (Flask with Python 3.12)
  
- ✅ Production environment: Built and tested successfully  
  - Frontend: http://localhost (Nginx serving React build from Node 22)
  - Backend: http://localhost/api (Gunicorn with Python 3.12)

### Compatibility
- All Python packages compatible with 3.12
- All npm packages compatible with Node 22
- No breaking changes detected

---

## [2.3.0] - 2024-11-21

### New Features

#### Production Deployment Setup
- **Nginx Configuration**: Created `frontend/nginx.conf` for serving static frontend and proxying API requests
  - Gzip compression for performance
  - Cache headers for static assets
  - Reverse proxy for `/api` endpoints
  - Health check endpoint at `/health`
  
- **Gunicorn Configuration**: Created `backend/gunicorn.conf.py` for production WSGI server
  - Auto-scaled workers based on CPU count (cores * 2 + 1)
  - Timeout settings (120s)
  - Graceful shutdown (30s)
  - Preload app for better performance
  - Structured logging to stdout/stderr
  
- **Production Compose**: Created `docker-compose.prod.yml`
  - Multi-stage Docker build for frontend (build → nginx)
  - Gunicorn command for backend
  - Environment variable support via `.env.prod`
  - Restart policies for all services
  - Separate production volumes
  
- **Environment Example**: Created `.env.prod.example` for production secrets template

### Backend Changes
- **app.py**: Exposed app instance at module level for Gunicorn
  - Added `app = create_app()` before `if __name__ == '__main__'`
  - Moved seed_database() call to module level

- **requirements.txt**: Added `gunicorn==21.2.0`

### Frontend Changes  
- **CheckoutPage.tsx**: Removed unused `clearCart` import to fix production TypeScript build error

### Documentation Updates
- **docs/09-DEPLOYMENT.md**: 
  - Added comprehensive Production Deployment section
  - Documented production vs development differences
  - Added production management commands
  - Included HTTPS setup guide
  - Added security and monitoring considerations
  
- **README.md**: Updated with production deployment quick start (to be updated)

### Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Access
# Frontend: http://localhost (port 80)
# Backend API: http://localhost/api
```

### Production Features
- **Frontend**: Nginx serving optimized static build
- **Backend**: Gunicorn with 15 workers (auto-scaled)
- **Performance**: Gzip compression, asset caching, efficient worker management
- **Reliability**: Healthchecks, restart policies, graceful shutdowns
- **Security**: Environment variable support for secrets

---

## [2.2.0] - 2024-11-21

### Bug Fixes

#### Fixed Order Creation - Double Cart Clear Issue
- **Root Cause**: Backend automatically clears cart after order creation within transaction, then frontend also tried to clear cart, causing race condition with multiple error toasts
- **Fix**: Removed redundant `clearCart()` call from CheckoutPage.tsx
- **Why**: Backend already clears cart in `OrderWorkflow.create_order()` as part of atomic transaction (line 91: `CartDAO.delete_by_user_id(user_id)`)
- **Result**: Clean order creation with no errors, cart is properly cleared by backend transaction

#### Fixed Admin OrdersManagement - Implemented Order Status Editing
- **Problem**: Edit and Delete buttons in OrdersManagement had empty onClick handlers
- **Fix**: Implemented full order status edit modal with select dropdowns
- **Features**:
  - Modal for editing Order Status (pending → confirmed → completed / cancelled)
  - Modal for editing Payment Status (pending → paid)
  - Connected to existing backend API: `PUT /admin/orders/:id/status`
  - Removed Delete button (no backend delete API exists)
  - Added toast notifications for success/error feedback
- **Result**: Admin can now update order status and payment status through clean UI

### New Features

#### ConfirmDialog Component
- **Custom Confirmation Modal**: Replaced all native `confirm()` dialogs with custom ConfirmDialog component
- **Consistent UI/UX**: Themed confirmation dialogs across client and admin panels
- **Enhanced UX**: Keyboard support (Enter/Escape), backdrop click, animated transitions
- **Color Variants**: Danger (red) for delete actions, Primary (blue) for other confirmations
- **Better Accessibility**: Screen reader friendly, focus management, body scroll lock

### Implementation
- **Client Side (CartPage)**: 2 confirms replaced
  - Delete single item confirmation
  - Delete multiple selected items confirmation
- **Admin Side**: 4 confirms replaced
  - BannerManagement: Delete banner
  - BooksManagement: Delete book
  - StaffManagement: Deactivate staff
  - CustomerManagement: Activate/Deactivate customer

### Frontend Changes
- **New Component**: `ConfirmDialog.tsx` in `components/ui/`
- **Updated Pages**: CartPage, BannerManagement, BooksManagement, StaffManagement, CustomerManagement
- **Improved UX**: All destructive actions now have consistent, beautiful confirmation dialogs

### Notes
- Replaces browser native `confirm()` which had inconsistent styling
- Dialog state managed via local component state
- Auto-closes on confirm action
- Maintains user flow with proper keyboard navigation

#### Cart Item Selection System
- **Select Items**: Added checkbox for each cart item and "Chọn tất cả" checkbox
- **Selective Checkout**: Only selected items are calculated in total and can be checked out
- **Bulk Delete**: New "Xóa (X)" button to delete multiple selected items at once
- **Smart Default**: All items are auto-selected when cart page loads
- **Dynamic UI**: Checkout button shows selected count: "THANH TOÁN (X sản phẩm)"
- **UX Improvements**: Checkout button is disabled when no items are selected

### Frontend Changes
- **CartPage.tsx**: Added selection state management with `useState` and `useEffect`
  - `selectedItems` state to track selected item IDs
  - `handleSelectAll()` to toggle all items selection
  - `handleSelectItem()` to toggle individual item
  - `handleDeleteSelected()` to delete multiple items
  - `getSelectedTotal()` to calculate total for selected items only
- **UI Updates**: 
  - Added checkboxes (w-5 h-5) to each cart item row
  - Added "Xóa (X)" button (danger variant) that appears when items are selected
  - Updated checkout button to display selected count and disable state
  - Updated total amount display to reflect selected items only

### Documentation
- **08-ORDER_FLOW.md**: Added "2.1. Item Selection in Cart" section with:
  - Feature overview and user flow
  - Implementation details with code examples
  - Flowchart diagram showing selection logic
  - UI/UX notes for design reference
- **06-FRONTEND_ARCHITECTURE.md**: Updated CartPage.tsx section with:
  - Selection state management details
  - All handler functions with implementation
  - Updated feature list

### Notes
- Feature inspired by popular e-commerce platforms (Shopee/Lazada)
- Selection state is UI-only (local state), not persisted to backend
- Cart items are still fully loaded, selection only affects display/checkout
- All changes include proper error handling with toast notifications

## [2.1.0] - 2024-11-19

### New Features

#### Customer Profile Management
- **Profile Page**: Added dedicated profile page for customers at `/profile`
- **View Mode**: Display customer code (Mã KH), username, full name, and email (read-only)
- **Edit Mode**: Customers can edit full name and email with validation
- **Order History**: Integrated order history within the profile page
- **Navigation**: Added "Thông tin cá nhân" link in user menu dropdown (customer-only)

### Backend Changes
- **New Endpoint**: `PUT /api/profile` for updating customer profile
- **Validation**: Email uniqueness validation (excluding current user)
- **Business Logic**: Added `update_profile()` method in `AuthService`
- **Data Access**: Added `update_profile()` method in `UserDAO`

### Frontend Changes
- **New Page**: `ProfilePage.tsx` with view/edit modes and order history
- **API Integration**: Added `updateProfile()` to authService
- **Route**: Added `/profile` route with authentication check
- **Header Update**: Added profile menu item for customers

### Notes
- Password change is intentionally not included (simplified feature)
- Profile is restricted to customers only (role check)
- All changes include proper error handling and user feedback

## [2.0.0] - 2024-11-18

### Major Changes - Frontend Migration

#### Migrated from Vanilla JS to React + TypeScript + Tailwind CSS

**Old Tech Stack:**
- HTML, CSS, JavaScript (Vanilla JS)
- Separate HTML files for each page
- jQuery-like DOM manipulation
- Inline styles and separate CSS files

**New Tech Stack:**
- React 18 with TypeScript
- Vite as build tool and dev server
- Tailwind CSS for styling
- React Router v6 for routing
- Axios for API calls
- Context API for state management

### Breaking Changes

- Frontend now runs on port 5173 (Vite dev server) instead of being served by Flask
- All old HTML/CSS/JS files have been removed
- Frontend structure completely reorganized into React component architecture

### New Features

#### Admin Panel
- Modern, clean interface matching Figma designs
- Dark sidebar with improved navigation
- Statistics dashboard with 6 key metrics cards
- Books Management with full CRUD operations and modal forms
- Staff Management interface
- Customer Management interface  
- Orders Management with status badges

#### Customer-Facing Pages
- Redesigned homepage with hero carousel and best sellers
- Modern login/register pages with form validation
- Enhanced book detail page with rating system
- Improved cart page with quantity controls
- Streamlined checkout flow (COD payment)
- Order history page

#### Technical Improvements
- TypeScript for type safety
- Centralized API service layer
- Context-based state management (Auth, Cart)
- Reusable UI components (Button, Input, Modal, Table)
- Responsive design with mobile support
- Modern color palette and typography
- Smooth animations and transitions

### Files Added

#### Configuration
- `frontend/package.json` - Dependencies and scripts
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/vite.config.ts` - Vite configuration with proxy
- `frontend/tailwind.config.js` - Tailwind CSS configuration
- `frontend/postcss.config.js` - PostCSS configuration
- `frontend/Dockerfile` - Production Docker build
- `frontend/Dockerfile.dev` - Development Docker build
- `frontend/nginx.conf` - Nginx configuration for production

#### Source Code
- `frontend/src/types/index.ts` - TypeScript type definitions
- `frontend/src/services/api.ts` - API service layer
- `frontend/src/contexts/AuthContext.tsx` - Authentication context
- `frontend/src/contexts/CartContext.tsx` - Shopping cart context
- `frontend/src/components/ui/*` - Reusable UI components
- `frontend/src/components/layout/*` - Layout components
- `frontend/src/components/shared/*` - Shared components
- `frontend/src/pages/admin/*` - Admin pages
- `frontend/src/pages/public/*` - Customer pages
- `frontend/src/pages/auth/*` - Authentication pages

### Files Removed

- All HTML files (`index.html`, `login.html`, `register.html`, `book-detail.html`, `cart.html`, `checkout.html`, `orders.html`)
- All admin HTML files (`admin/dashboard.html`, `admin/books-management.html`, `admin/users-management.html`, `admin/orders-management.html`, `admin/statistics.html`)
- `frontend/css/` directory (replaced by Tailwind CSS)
- `frontend/js/` directory (replaced by React components)
- `frontend/assets/` directory (empty)

### Files Kept

- `frontend/images/` - Product images referenced in database

### Modified Files

- `backend/app.py` - Updated CORS configuration for Vite dev server
- `docker-compose.yml` - Added frontend service
- `README.md` - Updated tech stack and setup instructions
- `DOCUMENTATION.md` - Updated frontend architecture

### Development Workflow

**Before:**
```bash
docker-compose up -d
# Access at http://localhost:5000
```

**After:**
```bash
# Option 1: Docker (both frontend and backend)
docker-compose up -d
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000/api

# Option 2: Local development (recommended)
# Terminal 1 - Backend
docker-compose up -d db minio backend

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Migration Date
November 18, 2024

### Notes
- All functionality from the old version has been preserved
- UI/UX significantly improved with modern design
- Better code organization and maintainability
- Improved developer experience with TypeScript and hot reload
- Production build optimized with Vite


