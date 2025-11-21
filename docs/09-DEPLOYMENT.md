# 09 - Hướng Dẫn Triển Khai

## 💻 Yêu Cầu Hệ Thống

### Phần Mềm

| Software | Version | Purpose |
|----------|---------|---------|
| **Docker** | 20.10+ | Container runtime |
| **Docker Compose** | 2.0+ | Multi-container orchestration |
| **Git** | 2.30+ | Version control |
| **WSL2** (Windows) | Latest | Linux environment on Windows |

### Phần Cứng

**Minimum Requirements:**
- CPU: 2 cores
- RAM: 4 GB
- Disk: 10 GB free space
- Network: Internet connection

**Recommended:**
- CPU: 4 cores
- RAM: 8 GB
- Disk: 20 GB SSD
- Network: Stable broadband connection

## 🚀 Cài Đặt và Chạy Dự Án

### Bước 1: Clone Repository

```bash
git clone [repository-url]
cd bookstore
```

### Bước 2: Kiểm Tra Docker

```bash
docker --version
docker-compose --version
```

### Bước 3: Chạy Docker Compose

```bash
# Chạy tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Chỉ xem logs của một service
docker-compose logs -f backend
```

### Bước 4: Truy Cập Ứng Dụng

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **pgAdmin**: http://localhost:5050

### Bước 5: Đăng Nhập

**Tài khoản mặc định:**
- Admin: `admin` / `admin123`
- Customer 1: `user1` / `pass123` (Mã KH: KH001)
- Customer 2: `user2` / `pass123` (Mã KH: KH002)
- Staff 1: `staff1` / `pass123` (Mã NV: NV001)
- Staff 2: `staff2` / `pass123` (Mã NV: NV002)

## 🐳 Docker Compose Configuration

### Services

```yaml
services:
  # PostgreSQL Database
  db:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: bookstore_user
      POSTGRES_PASSWORD: bookstore_password
      POSTGRES_DB: bookstore_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bookstore_user -d bookstore_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Flask Backend
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://bookstore_user:bookstore_password@db:5432/bookstore_db
      FLASK_ENV: development
    volumes:
      - ./backend:/app
    depends_on:
      db:
        condition: service_healthy

  # React Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

  # MinIO Object Storage
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  # pgAdmin 4
  pgadmin:
    image: dpage/pgadmin4:latest
    ports:
      - "5050:80"
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@bookstore.com
      PGADMIN_DEFAULT_PASSWORD: admin
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    depends_on:
      db:
        condition: service_healthy
```

### Volumes

```yaml
volumes:
  postgres_data:      # PostgreSQL data persistence
  minio_data:         # MinIO storage
  pgadmin_data:       # pgAdmin config
```

### Networks

```yaml
networks:
  bookstore_network:
    driver: bridge
    name: bookstore_network
```

## 🔧 Các Lệnh Thường Dùng

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (reset database)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Rebuild Services

```bash
# Rebuild all
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

### Execute Commands in Container

```bash
# Enter backend container
docker-compose exec backend bash

# Enter database container
docker-compose exec db psql -U bookstore_user -d bookstore_db

# Run Python commands in backend
docker-compose exec backend python seed_data.py
```

### Check Service Status

```bash
# List running containers
docker-compose ps

# Check container health
docker-compose ps
docker inspect bookstore_db
```

## 🔄 Database Management

### Seed Data

Database được seed tự động khi backend khởi động lần đầu:
- 1 Admin account
- 2 Customer accounts
- 2 Staff accounts
- 30 Sample books
- 5 Sample banners

### Reset Database

```bash
# Stop containers and remove volumes
docker-compose down -v

# Start again (will recreate database with seed data)
docker-compose up -d
```

### Backup Database

```bash
# Backup
docker-compose exec db pg_dump -U bookstore_user bookstore_db > backup.sql

# Restore
docker-compose exec -T db psql -U bookstore_user bookstore_db < backup.sql
```

### Access Database với pgAdmin

1. Truy cập: http://localhost:5050
2. Login: `admin@bookstore.com` / `admin`
3. Add New Server:
   - Name: Bookstore DB
   - Host: `db` (container name)
   - Port: `5432`
   - Database: `bookstore_db`
   - Username: `bookstore_user`
   - Password: `bookstore_password`

## 🌍 Environment Variables

### Backend (.env file - optional)

```bash
DATABASE_URL=postgresql://bookstore_user:bookstore_password@db:5432/bookstore_db
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### Frontend (.env file - optional)

```bash
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using port 5173
lsof -i :5173  # Mac/Linux
netstat -ano | findstr :5173  # Windows

# Kill the process or change port in docker-compose.yml
```

### Database Connection Issues

```bash
# Check database health
docker-compose exec db pg_isready -U bookstore_user

# Restart database
docker-compose restart db

# View database logs
docker-compose logs db
```

### Frontend Not Loading

```bash
# Rebuild frontend
docker-compose stop frontend
docker-compose rm -f frontend
docker-compose up -d --build frontend

# Clear browser cache
# Hard reload: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```

### Backend API Not Responding

```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend

# Rebuild if needed
docker-compose up -d --build backend
```

### Volume Permission Issues

```bash
# Linux/WSL: Give permissions
sudo chown -R $USER:$USER ./frontend/node_modules
sudo chown -R $USER:$USER ./backend/__pycache__
```

## 📝 Development Tips

### Hot Module Replacement (HMR)

- Frontend: Vite HMR enabled, changes reflect immediately
- Backend: Flask auto-reload enabled, restart on code changes

### Debug Mode

```bash
# Enable Flask debug mode
FLASK_DEBUG=1 docker-compose up backend

# View verbose logs
docker-compose logs -f --tail=100 backend
```

### Database Migrations (Future)

```bash
# Using Flask-Migrate (when implemented)
docker-compose exec backend flask db init
docker-compose exec backend flask db migrate -m "message"
docker-compose exec backend flask db upgrade
```

## 🚢 Production Deployment

### Overview

Production deployment uses:
- **Frontend**: Nginx serving static build files
- **Backend**: Gunicorn WSGI server with multiple workers
- **Database**: PostgreSQL with persistent volumes
- **Storage**: MinIO for image storage
- **Networking**: Shared Docker network for service communication

### Files Created for Production

#### 1. `frontend/nginx.conf`
Nginx configuration for serving static frontend and proxying API requests:

```nginx
server {
    listen 80;
    server_name localhost;
    
    # Frontend static files
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API proxy
    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 2. `backend/gunicorn.conf.py`
Gunicorn production configuration with worker management, logging, and timeouts.

#### 3. `docker-compose.prod.yml`
Production Docker Compose file with:
- Optimized Dockerfile (multi-stage build for frontend)
- Gunicorn command for backend
- Environment variable support via `.env.prod`
- Restart policies for all services
- Healthchecks for reliability

### Production Deployment Steps

#### Step 1: Prepare Environment Variables (Optional)

Create `.env.prod` file for production secrets:

```bash
# Copy example file
cp .env.prod.example .env.prod

# Edit with your production values
nano .env.prod
```

Example `.env.prod`:
```bash
DB_PASSWORD=your_secure_password
SECRET_KEY=your_long_random_secret_key
MINIO_ACCESS_KEY=your_minio_key
MINIO_SECRET_KEY=your_minio_secret
PGADMIN_EMAIL=admin@yourdomain.com
PGADMIN_PASSWORD=secure_password
```

#### Step 2: Build Production Images

```bash
# Build all production images
docker-compose -f docker-compose.prod.yml build

# Or build specific service
docker-compose -f docker-compose.prod.yml build frontend
docker-compose -f docker-compose.prod.yml build backend
```

#### Step 3: Deploy Production Services

```bash
# Start all services in production mode
docker-compose -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### Step 4: Verify Deployment

```bash
# Test frontend
curl http://localhost/

# Test backend API
curl http://localhost/api/books

# Test health endpoint
curl http://localhost/health
```

## 🚀 CI/CD with GitHub Actions

### Overview

Dự án đã được cấu hình với GitHub Actions để tự động build và push Docker images lên GitHub Container Registry (ghcr.io) mỗi khi có code push lên branch `main`.

### Workflow Configuration

File: `.github/workflows/docker-build.yml`

**Trigger:** 
- Push lên branch `main`
- Manual trigger (workflow_dispatch)

**Actions thực hiện:**
1. Checkout code
2. Setup Docker Buildx
3. Login vào GitHub Container Registry
4. Build và push Backend image → `ghcr.io/duynhne/bookstore-backend:latest`
5. Build và push Frontend image → `ghcr.io/duynhne/bookstore-frontend:latest`
6. Cache Docker layers để build nhanh hơn

### Setup GitHub Repository

#### 1. Push code lên GitHub

```bash
# Initialize git (nếu chưa có)
git init

# Add remote
git remote add origin git@github.com:duynhne/bookstored.git

# Add all files
git add .

# Commit
git commit -m "feat: Initial commit with CI/CD setup"

# Push to main
git push -u origin main
```

#### 2. Enable GitHub Container Registry

Sau khi push, GitHub Actions sẽ tự động chạy. Không cần setup secrets vì workflow sử dụng `GITHUB_TOKEN` có sẵn.

#### 3. Make images public (Optional)

Mặc định, images ở chế độ private. Để public:
1. Truy cập https://github.com/duynhne?tab=packages
2. Click vào package (bookstore-backend hoặc bookstore-frontend)
3. **Package settings** → **Change visibility** → **Public**

### Deploy với Pre-built Images

Sau khi GitHub Actions build xong, bạn có thể deploy trực tiếp trên server mà không cần build:

```bash
# Pull docker-compose.prod.yml về server
git clone git@github.com:duynhne/bookstored.git
cd bookstored

# Pull latest images từ GHCR
docker-compose -f docker-compose.prod.yml pull

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Verify
docker-compose -f docker-compose.prod.yml ps
```

### Update Production với Images Mới

```bash
# Pull latest code
git pull origin main

# Pull new images (GitHub Actions đã build)
docker-compose -f docker-compose.prod.yml pull

# Restart services với images mới
docker-compose -f docker-compose.prod.yml up -d

# Verify
curl http://localhost/health
```

### Xem Build Status

- Truy cập: https://github.com/duynhne/bookstored/actions
- Click vào workflow run để xem chi tiết
- Build time: ~3-5 phút cho cả frontend và backend

### Local Build vs CI/CD Build

| Aspect | Local Build | CI/CD Build |
|--------|-------------|-------------|
| **Trigger** | Manual `docker-compose build` | Auto on push to main |
| **Build time** | Phụ thuộc máy local | ~3-5 phút trên GitHub |
| **Cache** | Local cache | GitHub cache |
| **Result** | Images local | Images on ghcr.io |
| **Deploy** | Direct deploy | Pull từ registry |

### Troubleshooting CI/CD

**Lỗi: "denied: permission_denied"**
- Kiểm tra repo settings → Actions → Workflow permissions
- Cần enable "Read and write permissions"

**Images không public**
- Vào GitHub Packages settings
- Change visibility thành Public

**Build fails**
- Xem logs tại Actions tab
- Kiểm tra Dockerfile syntax
- Verify file paths trong workflow

### Access Production Application

- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost/api
- **pgAdmin**: http://localhost:5050

### Production vs Development Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| **Frontend** | Vite dev server (port 5173) | Nginx serving static build (port 80) |
| **Backend** | Flask dev server | Gunicorn with multiple workers |
| **Code Reload** | Hot reload enabled | No auto-reload |
| **Docker Volumes** | Source code mounted | Code copied into image |
| **Build** | No build step | Multi-stage build |
| **Dockerfile** | `Dockerfile.dev` | `Dockerfile` |
| **Compose File** | `docker-compose.yml` | `docker-compose.prod.yml` |

### Gunicorn Configuration

Production backend uses Gunicorn with:
- **Workers**: `CPU cores * 2 + 1` (auto-calculated)
- **Timeout**: 120 seconds
- **Worker Class**: sync
- **Logging**: stdout/stderr for Docker logs
- **Graceful Timeout**: 30 seconds
- **Preload App**: Enabled for better performance

### Production Management Commands

```bash
# Stop production services
docker-compose -f docker-compose.prod.yml stop

# Restart a service
docker-compose -f docker-compose.prod.yml restart backend

# View logs for specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Scale backend workers (if needed)
docker-compose -f docker-compose.prod.yml up -d --scale backend=2

# Update code and redeploy
git pull
docker-compose -f docker-compose.prod.yml up -d --build

# Cleanup
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml down -v  # Remove volumes too
```

### Production Considerations

1. **Security**:
   - Change all default passwords
   - Use strong SECRET_KEY
   - Configure CORS properly
   - Add rate limiting (future)

2. **Performance**:
   - Gunicorn workers auto-scale based on CPU
   - Nginx caching for static assets
   - Database connection pooling (built-in)

3. **Monitoring**:
   - Check logs regularly: `docker-compose -f docker-compose.prod.yml logs`
   - Monitor container health: `docker-compose -f docker-compose.prod.yml ps`
   - Use pgAdmin for database monitoring

4. **Backups**:
   - Regular database backups (see Database Management section)
   - Backup MinIO data (`minio_data_prod` volume)

5. **Updates**:
   - Test in development first
   - Build new images
   - Deploy with minimal downtime
   - Keep rollback plan ready

### HTTPS Setup (External Reverse Proxy)

For HTTPS, use an external reverse proxy (e.g., Nginx, Traefik, Caddy) in front of the application:

```nginx
# External Nginx config example
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

**📌 Summary:**
- Docker Compose makes setup easy
- All services run in isolated containers
- Database persisted in volumes
- Auto-reload enabled for development
- Troubleshooting guide included

