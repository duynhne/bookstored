-- Script khởi tạo database (THAM KHẢO)
-- 
-- LƯU Ý: File này chỉ để tham khảo cấu trúc database
-- SQLAlchemy ORM sẽ tự động tạo tất cả các bảng từ models.py
-- KHÔNG CẦN chạy SQL thủ công!
--
-- Khi app Flask khởi động, nó sẽ tự động gọi db.create_all()
-- để tạo các bảng dựa trên models trong backend/models.py
--
-- Các bảng sẽ được tạo tự động:
--   - users
--   - books
--   - cart
--   - orders
--   - order_items

-- Tạo database (thường đã được tạo bởi POSTGRES_DB trong docker-compose)
-- CREATE DATABASE bookstore;

-- Nếu muốn xem cấu trúc, tham khảo backend/models.py
-- hoặc xem DOCUMENTATION.md để xem ERD diagram

