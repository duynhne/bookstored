"""
Database seed script with sample data for Bookstore
Includes admin user, test customers, sample books, and banners
"""
from models import db, User, Book, Banner
from utils.helpers import hash_password
from datetime import datetime

def seed_database():
    """Seed the database with initial data (idempotent)"""
    print("🌱 Starting database seed...")
    
    # Check if data already exists
    if User.query.first() is not None:
        print("✅ Database already seeded, skipping...")
        return
    
    # Create Admin User
    admin = User(
        username='admin',
        password_hash=hash_password('admin123'),
        email='admin@bookstore.com',
        full_name='Administrator',
        role='admin',
        is_active=True
    )
    db.session.add(admin)
    print("✓ Created admin user (admin/admin123)")
    
    # Create Test Customers with customer codes
    user1 = User(
        username='user1',
        password_hash=hash_password('pass123'),
        email='user1@example.com',
        full_name='Nguyễn Văn A',
        role='customer',
        customer_code='KH001',  # First customer
        is_active=True
    )
    db.session.add(user1)
    
    user2 = User(
        username='user2',
        password_hash=hash_password('pass123'),
        email='user2@example.com',
        full_name='Trần Thị B',
        role='customer',
        customer_code='KH002',  # Second customer
        is_active=True
    )
    db.session.add(user2)
    print("✓ Created 2 test customers (user1/pass123, user2/pass123) with codes KH001, KH002")
    
    # Create Test Staff with staff codes
    staff1 = User(
        username='staff1',
        password_hash=hash_password('pass123'),
        email='staff1@bookstore.com',
        full_name='Lê Văn C',
        role='staff',
        staff_code='NV001',  # First staff
        is_active=True
    )
    db.session.add(staff1)
    
    staff2 = User(
        username='staff2',
        password_hash=hash_password('pass123'),
        email='staff2@bookstore.com',
        full_name='Phạm Thị D',
        role='staff',
        staff_code='NV002',  # Second staff
        is_active=True
    )
    db.session.add(staff2)
    print("✓ Created 2 test staff (staff1/pass123, staff2/pass123) with codes NV001, NV002")
    
    # Create Sample Books
    sample_books = [
        {
            'title': 'Đắc Nhân Tâm',
            'author': 'Dale Carnegie',
            'publisher': 'NXB Tổng Hợp TP.HCM',
            'publish_date': '2020-01-15',
            'price': 86000,
            'stock': 50,
            'description': 'Đắc Nhân Tâm của Dale Carnegie là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại. Tác phẩm đã được chuyển ngữ sang hầu hết các thứ tiếng trên thế giới và có mặt ở hàng trăm quốc gia.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/7e/14/b8/7d6ef0da42e30912c8a303f0fda391dc.jpg',
            'pages': 320,
            'category': 'Kỹ năng sống'
        },
        {
            'title': 'Nhà Giả Kim',
            'author': 'Paulo Coelho',
            'publisher': 'NXB Hội Nhà Văn',
            'publish_date': '2019-05-20',
            'price': 79000,
            'stock': 45,
            'description': 'Tất cả những trải nghiệm trong chuyến phiêu du theo đuổi vận mệnh của mình đã giúp Santiago thấu hiểu được ý nghĩa sâu xa nhất của hạnh phúc, hòa hợp với vũ trụ và con người.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/45/3b/fc/aa81d0a534b45706e3c56b5f7f2ef4e9.jpg',
            'pages': 227,
            'category': 'Tiểu thuyết'
        },
        {
            'title': 'Sapiens: Lược Sử Loài Người',
            'author': 'Yuval Noah Harari',
            'publisher': 'NXB Thế Giới',
            'publish_date': '2018-09-10',
            'price': 198000,
            'stock': 30,
            'description': 'Sapiens là một cuốn sách đột phá về lịch sử nhân loại, từ khi xuất hiện cho đến ngày nay. Harari đặt ra những câu hỏi lớn về bản chất con người và tương lai của chúng ta.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 543,
            'category': 'Lịch sử'
        },
        {
            'title': 'Tuổi Trẻ Đáng Giá Bao Nhiêu',
            'author': 'Rosie Nguyễn',
            'publisher': 'NXB Hội Nhà Văn',
            'publish_date': '2021-03-05',
            'price': 90000,
            'stock': 60,
            'description': '"Bạn hối tiếc vì không nỗ lực hết mình khi còn trẻ, bởi vì bạn không thể có được những gì mình muốn. Và bạn sẽ tiếc nuối khi về già mình không tận hưởng cuộc sống nhiều hơn."',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/bb/5d/c2/c96be2f7dac431e01acb1ebf30e8727c.jpg',
            'pages': 268,
            'category': 'Kỹ năng sống'
        },
        {
            'title': 'Cây Cam Ngọt Của Tôi',
            'author': 'José Mauro de Vasconcelos',
            'publisher': 'NXB Hội Nhà Văn',
            'publish_date': '2020-07-15',
            'price': 108000,
            'stock': 40,
            'description': 'Câu chuyện cảm động về cậu bé Zezé và cây cam ngọt nhỏ. Một tác phẩm kinh điển về tuổi thơ, về gia đình và về tình yêu thương.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 244,
            'category': 'Văn học'
        },
        {
            'title': 'Nghĩ Giàu & Làm Giàu',
            'author': 'Napoleon Hill',
            'publisher': 'NXB Lao Động',
            'publish_date': '2019-11-20',
            'price': 125000,
            'stock': 35,
            'description': 'Cuốn sách này đã giúp hàng triệu người trên thế giới đạt được thành công trong cuộc sống. 13 nguyên tắc vàng để đạt được sự giàu có và thành công.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 382,
            'category': 'Kinh tế'
        },
        {
            'title': 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
            'author': 'Nguyễn Nhật Ánh',
            'publisher': 'NXB Trẻ',
            'publish_date': '2018-05-10',
            'price': 95000,
            'stock': 55,
            'description': 'Những câu chuyện tuổi thơ dung dị nhưng đầy ắp kỷ niệm của hai anh em Thiều và Tường cùng với những người bạn trong xóm.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/26/36/6b/572ccba0fc33c001ab776e4b87f22ef8.jpg',
            'pages': 368,
            'category': 'Văn học'
        },
        {
            'title': 'Atomic Habits - Thói Quen Nguyên Tử',
            'author': 'James Clear',
            'publisher': 'NXB Thế Giới',
            'publish_date': '2020-10-01',
            'price': 179000,
            'stock': 42,
            'description': 'Cuốn sách cung cấp một framework thực tiễn để cải thiện mỗi ngày 1%. Dù bạn là một đội thể thao hay tổ chức kinh doanh, cuốn sách này đều có thể giúp bạn.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5b/57/0c/2d7e3e43272532e45ac8ffbfa83e7b29.jpg',
            'pages': 425,
            'category': 'Kỹ năng sống'
        },
        {
            'title': 'Càng Kỷ Luật, Càng Tự Do',
            'author': 'Jocko Willink',
            'publisher': 'NXB Thế Giới',
            'publish_date': '2021-08-15',
            'price': 135000,
            'stock': 38,
            'description': 'Kỷ luật là con đường dẫn đến tự do - tự do về thời gian, về tài chính và về tinh thần. Một cuốn sách truyền cảm hứng mạnh mẽ.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 256,
            'category': 'Kỹ năng sống'
        },
        {
            'title': 'Tâm Lý Học Tội Phạm',
            'author': 'Diệu Tiên',
            'publisher': 'NXB Phụ Nữ',
            'publish_date': '2021-02-20',
            'price': 112000,
            'stock': 33,
            'description': 'Phân tích tâm lý tội phạm qua các vụ án có thật. Giúp độc giả hiểu được động cơ và tâm lý của những kẻ phạm tội.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/c2/24/c6/c95fb6359b5d0902e9d683f35ab0d3bc.jpg',
            'pages': 298,
            'category': 'Tâm lý'
        },
        {
            'title': 'Khéo Ăn Nói Sẽ Có Được Thiên Hạ',
            'author': 'Trác Nhã',
            'publisher': 'NXB Lao Động',
            'publish_date': '2020-08-10',
            'price': 98000,
            'stock': 50,
            'description': 'Nghệ thuật ăn nói khéo léo giúp bạn giao tiếp hiệu quả và thành công trong cuộc sống.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 312,
            'category': 'Kỹ năng sống'
        },
        {
            'title': 'Không Diệt Không Sinh Đừng Sợ Hãi',
            'author': 'Thích Nhất Hạnh',
            'publisher': 'NXB Tôn Giáo',
            'publish_date': '2019-03-15',
            'price': 105000,
            'stock': 40,
            'description': 'Những lời dạy thiền về sự sống và cái chết của thiền sư Thích Nhất Hạnh.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 288,
            'category': 'Tâm linh'
        },
        {
            'title': 'Đọc Vị Bất Kỳ Ai',
            'author': 'David J. Lieberman',
            'publisher': 'NXB Thế Giới',
            'publish_date': '2020-11-05',
            'price': 128000,
            'stock': 35,
            'description': 'Phương pháp khoa học giúp bạn nhận biết suy nghĩ thực sự của người khác.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 246,
            'category': 'Tâm lý'
        },
        {
            'title': 'Chiến Binh Cầu Vồng',
            'author': 'Andrea Hirata',
            'publisher': 'NXB Hội Nhà Văn',
            'publish_date': '2018-06-20',
            'price': 115000,
            'stock': 28,
            'description': 'Câu chuyện cảm động về tình bạn và ước mơ của những đứa trẻ nghèo.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 352,
            'category': 'Văn học'
        },
        {
            'title': 'Bí Mật Tư Duy Triệu Phú',
            'author': 'T. Harv Eker',
            'publisher': 'NXB Tổng Hợp TP.HCM',
            'publish_date': '2019-09-12',
            'price': 142000,
            'stock': 45,
            'description': 'Những bí quyết tư duy và hành động để đạt được sự giàu có.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 298,
            'category': 'Kinh tế'
        },
        {
            'title': 'Sức Mạnh Của Thói Quen',
            'author': 'Charles Duhigg',
            'publisher': 'NXB Trẻ',
            'publish_date': '2020-04-18',
            'price': 156000,
            'stock': 38,
            'description': 'Khám phá sức mạnh của thói quen và cách thay đổi chúng để cải thiện cuộc sống.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 425,
            'category': 'Kỹ năng sống'
        },
        {
            'title': 'Mắt Biết Nói Dối, Lòng Biết Yêu Người',
            'author': 'Cố Mạn',
            'publisher': 'NXB Phụ Nữ',
            'publish_date': '2021-01-08',
            'price': 89000,
            'stock': 52,
            'description': 'Tiểu thuyết lãng mạn về tình yêu và những hiểu lầm trong cuộc sống.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 334,
            'category': 'Tiểu thuyết'
        },
        {
            'title': 'Thần Đồng Đất Việt',
            'author': 'Nhiều tác giả',
            'publisher': 'NXB Kim Đồng',
            'publish_date': '2020-05-25',
            'price': 72000,
            'stock': 60,
            'description': 'Tuyển tập truyện về những thần đồng nổi tiếng trong lịch sử Việt Nam.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 186,
            'category': 'Thiếu nhi'
        },
        {
            'title': 'Tuổi 20 Của Tôi',
            'author': 'Nguyễn Văn Tuấn',
            'publisher': 'NXB Thanh Niên',
            'publish_date': '2021-06-15',
            'price': 85000,
            'stock': 48,
            'description': 'Những suy ngẫm về tuổi trẻ và con đường tìm kiếm chính mình.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 252,
            'category': 'Kỹ năng sống'
        },
        {
            'title': 'Marketing 4.0',
            'author': 'Philip Kotler',
            'publisher': 'NXB Trẻ',
            'publish_date': '2019-07-20',
            'price': 168000,
            'stock': 32,
            'description': 'Chiến lược marketing trong thời đại chuyển đổi số.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 398,
            'category': 'Kinh tế'
        },
        {
            'title': 'Thám Tử Lừng Danh Conan - Tập 100',
            'author': 'Aoyama Gosho',
            'publisher': 'NXB Kim Đồng',
            'publish_date': '2021-10-10',
            'price': 25000,
            'stock': 120,
            'description': 'Tập truyện tranh trinh thám hấp dẫn của thám tử nhí Conan.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 192,
            'category': 'Truyện tranh'
        },
        {
            'title': 'Đắc Nhân Tâm Trong Thời Đại Số',
            'author': 'Nguyễn Phi Vân',
            'publisher': 'NXB Thế Giới',
            'publish_date': '2021-09-05',
            'price': 118000,
            'stock': 42,
            'description': 'Áp dụng nguyên tắc Đắc Nhân Tâm vào cuộc sống hiện đại.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 328,
            'category': 'Kỹ năng sống'
        },
        {
            'title': 'Harry Potter Và Hòn Đá Phù Thủy',
            'author': 'J.K. Rowling',
            'publisher': 'NXB Trẻ',
            'publish_date': '2018-12-01',
            'price': 145000,
            'stock': 68,
            'description': 'Cuộc phiêu lưu kỳ thú của cậu bé phù thủy Harry Potter.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 368,
            'category': 'Tiểu thuyết'
        },
        {
            'title': 'Lịch Sử Các Nền Văn Minh Thế Giới',
            'author': 'Will Durant',
            'publisher': 'NXB Tri Thức',
            'publish_date': '2019-04-22',
            'price': 285000,
            'stock': 18,
            'description': 'Tổng quan về lịch sử phát triển của các nền văn minh nhân loại.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 628,
            'category': 'Lịch sử'
        },
        {
            'title': 'Khi Hơi Thở Hóa Thinh Không',
            'author': 'Paul Kalanithi',
            'publisher': 'NXB Lao Động',
            'publish_date': '2020-02-14',
            'price': 132000,
            'stock': 36,
            'description': 'Hồi ký cảm động của một bác sĩ phẫu thuật thần kinh về cuộc đời và cái chết.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 296,
            'category': 'Văn học'
        },
        {
            'title': 'Sherlock Holmes Toàn Tập',
            'author': 'Arthur Conan Doyle',
            'publisher': 'NXB Văn Học',
            'publish_date': '2019-11-08',
            'price': 265000,
            'stock': 24,
            'description': 'Bộ truyện trinh thám kinh điển về thám tử Sherlock Holmes.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 856,
            'category': 'Tiểu thuyết'
        },
        {
            'title': 'Tiếng Anh Giao Tiếp Hàng Ngày',
            'author': 'Lê Văn Sự',
            'publisher': 'NXB Đại Học Quốc Gia',
            'publish_date': '2021-03-18',
            'price': 98000,
            'stock': 55,
            'description': 'Học tiếng Anh giao tiếp thực tế qua các tình huống hàng ngày.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 312,
            'category': 'Ngoại ngữ'
        },
        {
            'title': 'Doraemon - Tập Đặc Biệt 2022',
            'author': 'Fujiko F. Fujio',
            'publisher': 'NXB Kim Đồng',
            'publish_date': '2022-01-05',
            'price': 28000,
            'stock': 100,
            'description': 'Những câu chuyện vui nhộn của chú mèo máy Doraemon và nhóm bạn.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 196,
            'category': 'Truyện tranh'
        },
        {
            'title': 'Nhà Lãnh Đạo Không Chức Danh',
            'author': 'Robin Sharma',
            'publisher': 'NXB Tổng Hợp TP.HCM',
            'publish_date': '2020-09-28',
            'price': 138000,
            'stock': 41,
            'description': 'Bí quyết để trở thành người lãnh đạo xuất sắc mà không cần chức vụ.',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'pages': 358,
            'category': 'Kỹ năng sống'
        }
    ]
    
    for book_data in sample_books:
        book = Book(**book_data)
        db.session.add(book)
    
    print(f"✓ Created {len(sample_books)} sample books")
    
    # Create Sample Banners
    sample_banners = [
        {
            'title': 'GIẢM GIÁ 50% - ĐẮC NHÂN TÂM',
            'description': 'Ưu đãi đặc biệt cho sách bán chạy nhất',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/7e/14/b8/7d6ef0da42e30912c8a303f0fda391dc.jpg',
            'link': '/book/1',
            'bg_color': '#ef4444',
            'text_color': '#ffffff',
            'position': 'main',
            'display_order': 1,
            'is_active': True
        },
        {
            'title': 'NHÀ GIẢ KIM - GIẢM 30%',
            'description': 'Tác phẩm văn học kinh điển',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/45/3b/fc/aa81d0a534b45706e3c56b5f7f2ef4e9.jpg',
            'link': '/book/2',
            'bg_color': '#f59e0b',
            'text_color': '#ffffff',
            'position': 'main',
            'display_order': 2,
            'is_active': True
        },
        {
            'title': 'SAPIENS - SÁCH MỚI',
            'description': 'Lược sử loài người - Best seller',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg',
            'link': '/book/3',
            'bg_color': '#8b5cf6',
            'text_color': '#ffffff',
            'position': 'main',
            'display_order': 3,
            'is_active': True
        },
        {
            'title': 'FLASH SALE HÔM NAY',
            'description': 'Giảm đến 40% các đầu sách hot',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/b8/14/9d/7b14d6e6c8dd0e6a7a5c3c8b2c3e3b3f.jpg',
            'link': '/',
            'bg_color': '#10b981',
            'text_color': '#ffffff',
            'position': 'side_top',
            'display_order': 1,
            'is_active': True
        },
        {
            'title': 'SÁCH THIẾU NHI',
            'description': 'Bộ sưu tập cho bé yêu',
            'image_url': 'https://salt.tikicdn.com/cache/750x750/ts/product/d8/18/1e/9b4d8c7e8b3d4c7a9b8c7e8b3d4c7a9b.jpg',
            'link': '/',
            'bg_color': '#ec4899',
            'text_color': '#ffffff',
            'position': 'side_bottom',
            'display_order': 1,
            'is_active': True
        }
    ]
    
    for banner_data in sample_banners:
        banner = Banner(**banner_data)
        db.session.add(banner)
    
    print(f"✓ Created {len(sample_banners)} sample banners")
    
    # Commit all changes
    try:
        db.session.commit()
        print("✅ Database seeded successfully!")
        print("\n📝 Login Credentials:")
        print("   Admin:  admin / admin123")
        print("   User1:  user1 / pass123 (Customer KH001)")
        print("   User2:  user2 / pass123 (Customer KH002)")
        print("   Staff1: staff1 / pass123 (Staff NV001)")
        print("   Staff2: staff2 / pass123 (Staff NV002)")
        print("\n🎨 Banners: 3 main banners + 2 side banners")
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error seeding database: {e}")
        raise

if __name__ == '__main__':
    # For standalone testing
    from app import create_app
    app = create_app()
    with app.app_context():
        seed_database()

