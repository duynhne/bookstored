"""
Script tạo dữ liệu mẫu cho database
"""
from app import create_app
from models import db, User, Book
from utils.helpers import hash_password

def create_sample_data():
    """Tạo dữ liệu mẫu"""
    app = create_app()
    
    with app.app_context():
        # Xóa dữ liệu cũ (nếu có)
        db.drop_all()
        db.create_all()
        
        # Tạo admin user
        admin = User(
            username='admin',
            email='admin@bookstore.com',
            password_hash=hash_password('admin123'),
            full_name='Administrator',
            role='admin'
        )
        db.session.add(admin)
        
        # Tạo user thường
        user1 = User(
            username='user1',
            email='user1@example.com',
            password_hash=hash_password('user123'),
            full_name='Nguyễn Văn A',
            role='user'
        )
        db.session.add(user1)
        
        # Tạo sách mẫu
        books_data = [
            {
                'title': 'Rồng Đen Với Đỏ',
                'author': 'Tác giả A',
                'category': 'Tiểu thuyết',
                'description': 'Một cuốn tiểu thuyết hấp dẫn về rồng đen và màu đỏ.',
                'price': 150000,
                'stock': 50,
                'image_url': 'images/rong-den-voi-do.jpg',
                'publisher': 'NXB Tổng Hợp TPHCM',
                'publish_date': '30/09/2024',
                'distributor': 'Nhã Nam',
                'dimensions': '15.5 x 24.5 x 3.0',
                'pages': 316,
                'weight': 500
            },
            {
                'title': 'Lập trình Python',
                'author': 'Nguyễn Văn B',
                'category': 'Công nghệ',
                'description': 'Sách hướng dẫn lập trình Python từ cơ bản đến nâng cao. Cuốn sách phù hợp cho người mới bắt đầu cũng như những người đã có kinh nghiệm lập trình.',
                'price': 200000,
                'stock': 30,
                'image_url': '',
                'publisher': 'NXB Thông Tin và Truyền Thông',
                'publish_date': '15/06/2024',
                'distributor': 'Fahasa',
                'dimensions': '16.0 x 24.0 x 2.5',
                'pages': 450,
                'weight': 600
            },
            {
                'title': 'Lịch sử Việt Nam',
                'author': 'Trần Thị C',
                'category': 'Lịch sử',
                'description': 'Tổng hợp lịch sử Việt Nam qua các thời kỳ, từ thời dựng nước đến thời kỳ đổi mới.',
                'price': 180000,
                'stock': 25,
                'image_url': '',
                'publisher': 'NXB Giáo Dục Việt Nam',
                'publish_date': '20/08/2024',
                'distributor': 'Nhã Nam',
                'dimensions': '14.5 x 20.5 x 2.8',
                'pages': 380,
                'weight': 450
            },
            {
                'title': 'Nghệ thuật sống',
                'author': 'Lê Văn D',
                'category': 'Tự phát triển',
                'description': 'Những bài học về nghệ thuật sống hạnh phúc. Hướng dẫn cách sống tích cực và ý nghĩa.',
                'price': 120000,
                'stock': 40,
                'image_url': '',
                'publisher': 'NXB Văn Học',
                'publish_date': '10/05/2024',
                'distributor': 'Alpha Books',
                'dimensions': '13.0 x 20.0 x 1.5',
                'pages': 250,
                'weight': 300
            },
            {
                'title': 'Khoa học vũ trụ',
                'author': 'Phạm Thị E',
                'category': 'Khoa học',
                'description': 'Khám phá vũ trụ và các hành tinh. Cuốn sách đưa bạn đến những vùng đất xa xôi trong vũ trụ bao la.',
                'price': 250000,
                'stock': 20,
                'image_url': '',
                'publisher': 'NXB Khoa Học và Kỹ Thuật',
                'publish_date': '25/03/2024',
                'distributor': 'Phuong Nam',
                'dimensions': '17.0 x 24.0 x 3.5',
                'pages': 520,
                'weight': 750
            },
            {
                'title': 'Nấu ăn ngon',
                'author': 'Hoàng Văn F',
                'category': 'Ẩm thực',
                'description': 'Công thức nấu các món ăn ngon, dễ làm tại nhà. Bao gồm các món Việt và món Á.',
                'price': 100000,
                'stock': 35,
                'image_url': '',
                'publisher': 'NXB Phụ Nữ Việt Nam',
                'publish_date': '12/07/2024',
                'distributor': 'Fahasa',
                'dimensions': '15.0 x 21.0 x 2.0',
                'pages': 200,
                'weight': 350
            }
        ]
        
        for book_data in books_data:
            book = Book(**book_data)
            db.session.add(book)
        
        db.session.commit()
        print('✅ Đã tạo dữ liệu mẫu thành công!')
        print('\nTài khoản Admin:')
        print('  Username: admin')
        print('  Password: admin123')
        print('\nTài khoản User:')
        print('  Username: user1')
        print('  Password: user123')

if __name__ == '__main__':
    create_sample_data()

