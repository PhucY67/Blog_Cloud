Blog - Cloud_computing

## Tài khoản mặc định
- Admin: đăng ký user bình thường, sau đó vào MongoDB set role="admin"
- Admin có thể tạo tài khoản mới cho user hay một admin khác
- Hoặc tạo bằng script
- Tài khoản admin: (tk:Admin123/mk:admin1234)
- Tài khoản user:  (tk:user123/mk:user123)

## Công nghệ sử dụng
- Backend: Express, MongoDB, Session, Bcrypt
- Frontend: Bootstrap, Quill, Fontawesome
- Bảo mật: Helmet, XSS filter, Sanitize HTML, Rate limit, NoSQL injection được ngăn chặn nhờ Mongoose

## Các tính năng có trong trang blog 
- Đăng ký / đăng nhập, session 3 ngày
- Quản lý bài viết (thêm/sửa/xóa)
- Rich text editor (Quill): định dạng văn bản, chèn ảnh, upload file
- Like, Dislike, Share, Comment, Report, Save
- Thông báo (like, comment, admin)
- Dark/Light
- Hồ sơ cá nhân (avatar, background, timeline)
- Admin kiểm duyệt bài viết vi phạm(ẩn, bỏ ẩn, xóa bài)
- Tìm kiếm cơ bản, lọc theo tags
