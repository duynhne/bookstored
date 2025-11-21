# 05 - Kiến Trúc Backend Chi Tiết

## 📦 Tổng Quan

Backend được xây dựng với Flask framework, theo kiến trúc 3 lớp (3-Layer Architecture) để tách biệt responsibilities và dễ bảo trì.

**📊 Xem Class Diagram:** [`diagrams/backend-class-diagram.mmd`](diagrams/backend-class-diagram.mmd)

## 🏗 Cấu Trúc Backend

```
backend/
├── app.py                    # Flask application chính
├── config.py                 # Configuration management
├── models.py                 # SQLAlchemy ORM models
├── seed_data.py              # Database seeding script
├── requirements.txt          # Python dependencies
│
├── routes/                   # 🔷 PRESENTATION LAYER
│   ├── auth.py              # Authentication endpoints
│   ├── books.py             # Books CRUD endpoints
│   ├── cart.py              # Shopping cart endpoints
│   ├── orders.py            # Orders management
│   ├── admin.py             # Admin operations
│   ├── banners.py           # Banner management
│   ├── chatbot.py           # Chatbot endpoint
│   └── upload.py            # File upload handling
│
├── business/                 # 🔷 BUSINESS LOGIC LAYER
│   ├── dto/                 # Data Transfer Objects
│   │   ├── user_dto.py
│   │   ├── book_dto.py
│   │   ├── cart_dto.py
│   │   └── order_dto.py
│   │
│   ├── services/            # Business services
│   │   ├── auth_service.py
│   │   ├── book_service.py
│   │   ├── cart_service.py
│   │   ├── order_service.py
│   │   └── admin_service.py
│   │
│   ├── components/          # Business validators
│   │   ├── book_validator.py
│   │   ├── order_validator.py
│   │   └── cart_validator.py
│   │
│   └── workflows/           # Complex workflows
│       └── order_workflow.py
│
├── data/                     # 🔷 DATA ACCESS LAYER
│   ├── user_dao.py
│   ├── book_dao.py
│   ├── cart_dao.py
│   └── order_dao.py
│
└── utils/                    # Utilities & Helpers
    ├── helpers.py           # Helper functions (hash, decorators)
    └── storage.py           # MinIO storage utilities
```

## 📝 Python Docstrings Format

### Chuẩn Google Style Docstring

```python
def function_name(param1, param2):
    """
    Mô tả ngắn gọn chức năng (một dòng).
    
    Mô tả chi tiết hơn về function này làm gì, khi nào dùng, 
    và các lưu ý quan trọng (tùy chọn, nhiều dòng).
    
    Args:
        param1 (type): Mô tả param1
        param2 (type): Mô tả param2
    
    Returns:
        type: Mô tả giá trị trả về
        hoặc
        tuple: (result, error) với:
            - result (type|None): Kết quả nếu thành công, None nếu lỗi
            - error (str|None): Thông báo lỗi nếu có, None nếu thành công
    
    Raises:
        ValueError: Khi param1 không hợp lệ
        Exception: Khi có lỗi database
    
    Example:
        >>> result, error = function_name('value1', 'value2')
        >>> if not error:
        >>>     print(result)
    
    Note:
        - Lưu ý 1
        - Lưu ý 2
    """
    pass
```

## 🔑 1. Presentation Layer (Routes)

### backend/routes/auth.py

```python
"""
Authentication Routes - Xử lý đăng ký, đăng nhập, đăng xuất.

Module này cung cấp các endpoint REST API cho authentication:
- POST /api/register: Đăng ký tài khoản mới
- POST /api/login: Đăng nhập hệ thống
- POST /api/logout: Đăng xuất
- GET /api/me: Lấy thông tin user hiện tại
- PUT /api/profile: Cập nhật profile customer

Flow:
1. Frontend gửi request với credentials
2. Route validate và gọi AuthService
3. Service xử lý business logic
4. Route format response và gửi về frontend
"""

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Đăng ký tài khoản mới.
    
    Endpoint này nhận thông tin đăng ký từ frontend, validate và tạo 
    user mới trong database. Sau khi tạo thành công, tự động đăng nhập user.
    
    Request Body (JSON):
        {
            "username": str,  # Required, unique
            "email": str,     # Required, unique, valid email format
            "password": str,  # Required, min 6 characters
            "full_name": str  # Required
        }
    
    Returns:
        JSON Response:
            Success (201):
                {
                    "message": "Đăng ký thành công",
                    "user": {...}  # UserDTO
                }
            Error (400):
                {
                    "error": "Username đã tồn tại"
                }
            Error (500):
                {
                    "error": "Lỗi đăng ký: <details>"
                }
    
    Side Effects:
        - Tạo user mới trong database
        - Auto-generate customer_code (KH001, KH002, ...)
        - Tự động đăng nhập (set session['user_id'])
    
    Example:
        POST /api/register
        Body: {"username": "john", "email": "john@example.com", 
               "password": "pass123", "full_name": "John Doe"}
        Response: 201 Created
    """
    # Implementation...
```

### backend/routes/books.py

```python
@books_bp.route('', methods=['GET'])
def get_books():
    """
    Lấy danh sách sách với pagination, search, filter.
    
    Endpoint hỗ trợ query parameters để filter và pagination.
    Sử dụng BookService để lấy data từ database.
    
    Query Parameters:
        page (int, optional): Số trang, default=1
        per_page (int, optional): Số items/trang, default=12, max=100
        search (str, optional): Tìm kiếm theo title hoặc author
        category (str, optional): Lọc theo thể loại
        author (str, optional): Lọc theo tác giả
        sort_by (str, optional): Sắp xếp theo field (id, title, price)
        sort_order (str, optional): asc hoặc desc, default=asc
    
    Returns:
        JSON (200):
            {
                "books": [BookDTO, ...],
                "total": int,      # Tổng số books
                "page": int,       # Trang hiện tại
                "per_page": int,   # Items mỗi trang
                "pages": int       # Tổng số trang
            }
    
    Performance:
        - Query có index trên title, author, category
        - Pagination để tránh load quá nhiều data
        - Mỗi request < 100ms với database có index
    
    Example:
        GET /api/books?page=1&per_page=15&search=đắc%20nhân%20tâm
        Response: {"books": [...], "total": 1, "page": 1, ...}
    """
    # Implementation...
```

## 🧠 2. Business Logic Layer

### backend/business/services/auth_service.py

```python
"""
Authentication Service - Business logic cho authentication.

Service này xử lý tất cả logic liên quan đến authentication:
- Validate credentials
- Hash passwords với bcrypt
- Quản lý sessions
- Generate customer/staff codes

Design Pattern: Service Layer Pattern
責任: Tách biệt business logic khỏi presentation và data layers
"""

class AuthService:
    """
    Authentication Service class.
    
    Provides static methods cho authentication operations.
    Không maintain state (stateless service).
    """
    
    @staticmethod
    def register(username: str, email: str, password: str, 
                 full_name: str) -> Tuple[Optional[UserDTO], Optional[str]]:
        """
        Đăng ký user mới với validation đầy đủ.
        
        Flow:
        1. Validate input (username, email format, password length)
        2. Check uniqueness (username và email chưa tồn tại)
        3. Hash password với bcrypt (cost factor 12)
        4. Generate customer_code tự động (KH001, KH002, ...)
        5. Insert vào database via UserDAO
        6. Return UserDTO
        
        Args:
            username (str): Tên đăng nhập, 4-20 characters, alphanumeric + underscore
            email (str): Email hợp lệ, phải unique trong hệ thống
            password (str): Mật khẩu gốc (chưa hash), min 6 characters
            full_name (str): Họ tên đầy đủ, không rỗng
        
        Returns:
            tuple: (UserDTO, error_message)
                - (UserDTO, None): Nếu đăng ký thành công
                - (None, str): Nếu có lỗi, string mô tả lỗi
        
        Raises:
            Exception: Nếu có lỗi database không expected
        
        Business Rules:
            - Username: 4-20 chars, chỉ chữ cái/số/underscore, phải unique
            - Email: Format hợp lệ theo regex, phải unique
            - Password: Minimum 6 characters (hash với bcrypt cost=12)
            - customer_code: Tự động generate KH001, KH002, ... (sequential)
            - Role mặc định: 'customer'
            - is_active mặc định: True
        
        Example:
            >>> user_dto, error = AuthService.register(
            ...     'john_doe', 'john@example.com', 'pass123', 'John Doe'
            ... )
            >>> if not error:
            ...     print(f"User created: {user_dto.username}")
            >>> else:
            ...     print(f"Error: {error}")
        
        Note:
            - Password được hash với bcrypt, không lưu plain text
            - Transaction tự động rollback nếu có lỗi
            - Customer code có unique constraint trong database
        """
        # Implementation...
```

### backend/business/workflows/order_workflow.py

```python
"""
Order Workflow - Xử lý quy trình đặt hàng phức tạp.

Workflow này orchestrate nhiều operations:
1. Validate cart
2. Calculate total amount
3. Create order
4. Create order items
5. Update book stock
6. Clear cart

Design Pattern: Workflow Pattern (Saga Pattern simplified)
Transaction: Tất cả operations trong 1 database transaction
"""

class OrderWorkflow:
    """
    Order creation workflow.
    
    Handles complex multi-step process of creating an order
    with proper transaction management và error handling.
    """
    
    @staticmethod
    def create_order_with_items(user_id: int, shipping_address: str, 
                                phone: str) -> Tuple[Optional[Order], Optional[str]]:
        """
        Tạo order mới với tất cả order items trong một transaction.
        
        Đây là core workflow của việc checkout. Flow đầy đủ:
        1. BEGIN TRANSACTION
        2. Lấy cart items của user (JOIN với books table)
        3. Validate cart không rỗng
        4. Validate tất cả books còn đủ stock
        5. Calculate total amount từ cart
        6. Create Order record
        7. Tạo OrderItem cho mỗi cart item
        8. Update book stock (giảm số lượng đã bán)
        9. Clear cart của user
        10. COMMIT TRANSACTION
        11. Return Order object
        
        Args:
            user_id (int): ID của user đang đặt hàng
            shipping_address (str): Địa chỉ giao hàng, không rỗng
            phone (str): Số điện thoại liên hệ, format 10-11 digits
        
        Returns:
            tuple: (Order, error)
                - (Order, None): Order object nếu thành công
                - (None, str): Error message nếu thất bại
        
        Raises:
            Exception: Nếu có lỗi database critical
            (Transaction tự động rollback)
        
        Validation Rules:
            - Cart phải có ít nhất 1 item
            - Mỗi book phải còn đủ stock >= quantity ordered
            - Total amount > 0
            - shipping_address không rỗng
            - phone match regex ^\d{10,11}$
        
        Transaction Safety:
            - Tất cả operations trong 1 transaction
            - Auto rollback nếu bất kỳ step nào fail
            - Database constraints đảm bảo consistency
        
        Performance:
            - 1 transaction với ~10 queries
            - Execution time: ~100-200ms
            - Index trên cart.user_id, books.id
        
        Example:
            >>> order, error = OrderWorkflow.create_order_with_items(
            ...     user_id=1,
            ...     shipping_address="123 Main St",
            ...     phone="0123456789"
            ... )
            >>> if order:
            ...     print(f"Order #{order.id} created, total: {order.total_amount}")
            >>> else:
            ...     print(f"Error: {error}")
        
        Side Effects:
            - Creates 1 Order record
            - Creates N OrderItem records (N = số items trong cart)
            - Updates N Book records (giảm stock)
            - Deletes N Cart records
        
        Note:
            - Đây là operation quan trọng nhất của hệ thống
            - Phải đảm bảo atomic (tất cả thành công hoặc tất cả rollback)
            - Không được để race condition (sử dụng database locks nếu cần)
        """
        # Implementation với full transaction handling...
```

## 💾 3. Data Access Layer (DAOs)

### backend/data/book_dao.py

```python
"""
Book Data Access Object - Database operations cho Books.

DAO này encapsulate tất cả database queries related to books:
- CRUD operations
- Search và filtering
- Pagination
- Sorting

Design Pattern: DAO Pattern
Responsibility: Database access only, không có business logic
"""

class BookDAO:
    """
    Data Access Object cho Book entity.
    
    Provides static methods cho database operations.
    Sử dụng SQLAlchemy ORM để query và update data.
    """
    
    @staticmethod
    def search(page: int = 1, per_page: int = 12, search: str = '',
               category: str = '', author: str = '', 
               sort_by: str = 'id', sort_order: str = 'asc') 
               -> Tuple[List[Book], int, int]:
        """
        Search và filter books với pagination.
        
        Thực hiện complex query với multiple filters và pagination.
        Sử dụng SQLAlchemy để build dynamic query.
        
        Args:
            page (int): Trang hiện tại, >= 1
            per_page (int): Số items mỗi trang, 1-100
            search (str): Keyword tìm kiếm trong title hoặc author
            category (str): Filter theo category (exact match)
            author (str): Filter theo author (exact match)
            sort_by (str): Field để sort ('id', 'title', 'price', 'created_at')
            sort_order (str): 'asc' hoặc 'desc'
        
        Returns:
            tuple: (books, total, pages)
                - books (List[Book]): List các Book models cho trang hiện tại
                - total (int): Tổng số books match filter
                - pages (int): Tổng số trang
        
        SQL Query:
            Base: SELECT * FROM books
            Filters: WHERE title LIKE %search% OR author LIKE %search%
                     AND category = ? (if provided)
                     AND author = ? (if provided)
            Sort: ORDER BY <sort_by> <sort_order>
            Pagination: LIMIT <per_page> OFFSET <(page-1)*per_page>
        
        Performance:
            - Indexes: books(title), books(author), books(category)
            - Query time: ~50-100ms với 10,000 records
            - Sử dụng .paginate() của SQLAlchemy (efficient)
        
        Example:
            >>> books, total, pages = BookDAO.search(
            ...     page=1, per_page=15, search='đắc nhân tâm'
            ... )
            >>> print(f"Found {total} books across {pages} pages")
            >>> for book in books:
            ...     print(book.title)
        
        Note:
            - Search không case-sensitive (sử dụng ILIKE trên Postgres)
            - Empty string cho search/category/author = không filter
            - Invalid sort_by fallback to 'id'
        """
        # Implementation với SQLAlchemy query...
```

## 🎯 4. Models Layer

### backend/models.py

```python
"""
SQLAlchemy ORM Models - Database table definitions.

File này định nghĩa tất cả database models:
- User: Thông tin người dùng (customers, staff, admin)
- Book: Thông tin sách
- Cart: Giỏ hàng
- Order: Đơn hàng
- OrderItem: Chi tiết đơn hàng
- Banner: Banner quảng cáo

Relationships:
- User 1-N Cart (user có nhiều cart items)
- User 1-N Order (user có nhiều orders)
- Book 1-N Cart (book có thể trong nhiều carts)
- Book 1-N OrderItem (book có thể trong nhiều orders)
- Order 1-N OrderItem (order chứa nhiều items)
"""

class User(db.Model):
    """
    User model - Lưu thông tin người dùng.
    
    Table: users
    Roles: admin, staff, customer
    
    Attributes:
        id (int): Primary key, auto increment
        username (str): Tên đăng nhập, unique, max 80 chars
        email (str): Email, unique, max 120 chars
        password_hash (str): Bcrypt hashed password, 255 chars
        full_name (str): Họ tên đầy đủ, max 100 chars
        role (str): 'admin', 'staff', hoặc 'customer', max 20 chars
        is_active (bool): Trạng thái active, default True
        customer_code (str): Mã KH (KH001, KH002, ...), unique, only for customers
        staff_code (str): Mã NV (NV001, NV002, ...), unique, only for staff
        created_at (datetime): Timestamp tạo account, auto set
        
    Relationships:
        cart_items (List[Cart]): Danh sách items trong giỏ hàng
        orders (List[Order]): Danh sách đơn hàng đã đặt
    
    Indexes:
        - username (unique)
        - email (unique)
        - customer_code (unique, nullable)
        - staff_code (unique, nullable)
    
    Business Rules:
        - Username: 4-80 chars, unique
        - Email: Valid format, unique
        - Role: Chỉ được 'admin', 'staff', 'customer'
        - customer_code: Chỉ cho role=customer, auto-generate
        - staff_code: Chỉ cho role=staff/admin, auto-generate
    """
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=True)
    role = db.Column(db.String(20), default='customer', nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    customer_code = db.Column(db.String(20), unique=True, nullable=True, index=True)
    staff_code = db.Column(db.String(20), unique=True, nullable=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    cart_items = db.relationship('Cart', backref='user', lazy=True, cascade='all, delete-orphan')
    orders = db.relationship('Order', backref='user', lazy=True)
    
    def to_dict(self):
        """
        Convert User model thành dictionary.
        
        Returns:
            dict: User data without password_hash
        """
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'is_active': self.is_active,
            'customer_code': self.customer_code,
            'staff_code': self.staff_code,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @staticmethod
    def generate_customer_code():
        """
        Generate mã khách hàng tự động (KH001, KH002, ...).
        
        Logic:
        1. Tìm customer_code lớn nhất hiện tại
        2. Parse số từ code (KH001 -> 1)
        3. Increment và format lại (2 -> KH002)
        
        Returns:
            str: Customer code mới (format: KHxxx)
        
        Example:
            >>> code = User.generate_customer_code()
            >>> print(code)  # "KH003" nếu đã có KH001, KH002
        """
        last_customer = User.query.filter(
            User.customer_code.isnot(None)
        ).order_by(User.id.desc()).first()
        
        if last_customer and last_customer.customer_code:
            last_number = int(last_customer.customer_code[2:])  # KH001 -> 001 -> 1
            new_number = last_number + 1
            return f"KH{new_number:03d}"  # 2 -> KH002
        return "KH001"  # First customer
```

## 🔧 5. Utilities & Helpers

### backend/utils/helpers.py

```python
"""
Helper Functions - Utility functions dùng chung.

Module này chứa các helper functions:
- Password hashing với bcrypt
- Login required decorator
- Validation helpers
"""

def hash_password(password: str) -> str:
    """
    Hash password với bcrypt.
    
    Sử dụng bcrypt với cost factor 12 (secure và reasonable performance).
    
    Args:
        password (str): Plain text password
    
    Returns:
        str: Bcrypt hashed password (UTF-8 decoded)
    
    Example:
        >>> hashed = hash_password('mypassword123')
        >>> print(len(hashed))  # ~60 characters
    
    Security:
        - Cost factor: 12 (2^12 iterations)
        - Salt tự động generate (unique mỗi password)
        - Resistant to rainbow table attacks
    """
    return bcrypt.hashpw(
        password.encode('utf-8'), 
        bcrypt.gensalt(rounds=12)
    ).decode('utf-8')


def check_password(hashed_password: str, plain_password: str) -> bool:
    """
    Verify password against hash.
    
    Args:
        hashed_password (str): Bcrypt hash từ database
        plain_password (str): Password user nhập vào
    
    Returns:
        bool: True nếu password match, False otherwise
    
    Example:
        >>> hashed = hash_password('pass123')
        >>> check_password(hashed, 'pass123')  # True
        >>> check_password(hashed, 'wrong')    # False
    """
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )


def login_required(f):
    """
    Decorator để protect routes yêu cầu authentication.
    
    Kiểm tra session['user_id']. Nếu không có, return 401 Unauthorized.
    
    Usage:
        @app.route('/protected')
        @login_required
        def protected_route():
            user_id = session['user_id']  # Guaranteed to exist
            ...
    
    Args:
        f: Function to wrap
    
    Returns:
        Wrapped function với authentication check
    
    Example:
        @auth_bp.route('/profile')
        @login_required
        def get_profile():
            return {"user_id": session['user_id']}
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Yêu cầu đăng nhập'}), 401
        return f(*args, **kwargs)
    return decorated_function


def admin_required(f):
    """
    Decorator để protect admin-only routes.
    
    Kiểm tra cả authentication và role='admin' hoặc 'staff'.
    
    Usage:
        @admin_bp.route('/users')
        @admin_required
        def manage_users():
            ...  # Only admin/staff can access
    
    Returns:
        401 nếu not logged in
        403 nếu not admin/staff
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Yêu cầu đăng nhập'}), 401
        
        user = User.query.get(session['user_id'])
        if not user or user.role not in ['admin', 'staff']:
            return jsonify({'error': 'Không có quyền truy cập'}), 403
        
        return f(*args, **kwargs)
    return decorated_function
```

---

## 📊 Summary

### Code Documentation Standards

1. **Module-level docstring**: Mô tả module và các components chính
2. **Class docstring**: Mô tả class purpose và attributes
3. **Method/Function docstring**: Full docstring với Args/Returns/Raises/Examples
4. **Inline comments**: Giải thích logic phức tạp

### Key Patterns

- **Service Layer**: Business logic separation
- **DAO Pattern**: Database access encapsulation
- **DTO Pattern**: Data transfer between layers
- **Decorator Pattern**: Authentication và authorization
- **Workflow Pattern**: Complex multi-step operations

### Best Practices Applied

✅ Clear separation of concerns (3 layers)  
✅ Comprehensive error handling  
✅ Transaction management  
✅ Input validation  
✅ Security (password hashing, session management)  
✅ Performance (pagination, indexes)  
✅ Testability (pure functions, dependency injection)

---

**📌 Note**: Tất cả backend code đều follow patterns và docstring format được demonstrate trong document này. Developers có thể tham khảo và replicate cho code mới.

