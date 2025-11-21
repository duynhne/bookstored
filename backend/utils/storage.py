"""
Storage utility để upload ảnh lên MinIO
"""
import os
from minio import Minio
from minio.error import S3Error
from werkzeug.utils import secure_filename
import uuid
from datetime import timedelta

class StorageService:
    """Service để quản lý upload ảnh lên MinIO"""
    
    def __init__(self):
        """Khởi tạo MinIO client"""
        self.endpoint = os.getenv('MINIO_ENDPOINT', 'minio:9000')
        self.access_key = os.getenv('MINIO_ACCESS_KEY', 'minioadmin')
        self.secret_key = os.getenv('MINIO_SECRET_KEY', 'minioadmin')
        self.bucket_name = os.getenv('MINIO_BUCKET', 'bookstore-images')
        
        # Tạo MinIO client
        self.client = Minio(
            self.endpoint,
            access_key=self.access_key,
            secret_key=self.secret_key,
            secure=False  # HTTP cho local, HTTPS cho production
        )
        
        # Tạo bucket nếu chưa có
        self._ensure_bucket_exists()
    
    def _ensure_bucket_exists(self):
        """Đảm bảo bucket tồn tại"""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                print(f'✅ Đã tạo bucket: {self.bucket_name}')
        except S3Error as e:
            print(f'❌ Lỗi khi tạo bucket: {e}')
    
    def upload_file(self, file, folder='books'):
        """
        Upload file lên MinIO
        
        Args:
            file: File object từ request
            folder: Thư mục trong bucket (default: 'books')
        
        Returns:
            str: Public URL của file
        """
        try:
            # Validate file
            if not file or not file.filename:
                raise ValueError('Không có file được upload')
            
            # Lấy extension
            filename = secure_filename(file.filename)
            ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
            
            # Validate extension
            allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
            if ext not in allowed_extensions:
                raise ValueError(f'Định dạng file không được hỗ trợ. Chỉ chấp nhận: {", ".join(allowed_extensions)}')
            
            # Tạo tên file unique
            unique_filename = f"{uuid.uuid4()}.{ext}"
            object_name = f"{folder}/{unique_filename}" if folder else unique_filename
            
            # Upload file
            file.seek(0)  # Reset file pointer
            self.client.put_object(
                self.bucket_name,
                object_name,
                file,
                length=-1,  # Auto-detect length
                content_type=f'image/{ext}'
            )
            
            # Tạo public URL (presigned URL hoặc public URL)
            # Với MinIO, cần set bucket policy để public hoặc dùng presigned URL
            # Ở đây dùng presigned URL với thời hạn dài (1 năm)
            url = self.client.presigned_get_object(
                self.bucket_name,
                object_name,
                expires=timedelta(days=365)
            )
            
            # Hoặc nếu bucket public, có thể dùng URL trực tiếp:
            # url = f"http://{self.endpoint}/{self.bucket_name}/{object_name}"
            
            return url
            
        except S3Error as e:
            raise Exception(f'Lỗi khi upload lên MinIO: {str(e)}')
        except Exception as e:
            raise Exception(f'Lỗi khi upload file: {str(e)}')
    
    def delete_file(self, object_name):
        """
        Xóa file khỏi MinIO
        
        Args:
            object_name: Tên object trong bucket (ví dụ: 'books/filename.jpg')
        """
        try:
            self.client.remove_object(self.bucket_name, object_name)
        except S3Error as e:
            raise Exception(f'Lỗi khi xóa file: {str(e)}')

# Singleton instance
storage_service = StorageService()

