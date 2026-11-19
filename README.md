# Website thiệp cưới Tân & Trang

## Cấu trúc
- `index.html`: cấu trúc nội dung website.
- `style.css`: CSS tùy chỉnh.
- `script.js`: đồng hồ đếm ngược, lịch, album, nhạc và tương tác.
- `config.js`: nơi thay tên, ngày giờ, địa chỉ, ảnh, QR và nhạc.
- `assets/`: nơi đặt ảnh và file MP3 của hai bạn.

## Cách thay thông tin
1. Mở `config.js` bằng VS Code hoặc Notepad.
2. Sửa tên, ngày, địa chỉ, thời gian sự kiện và đường dẫn ảnh/QR.
3. Lưu file. Khi website được push lên GitHub, bản online sẽ cập nhật sau khi GitHub Pages deploy xong.
4. Với ảnh, hãy chép file vào `assets/` rồi sửa đường dẫn, ví dụ `assets/anh-bia.jpg`.
5. Với nhạc, đặt MP3 tại `assets/music.mp3`. Khách cần nhấn nút nốt nhạc để phát do trình duyệt chặn tự phát.

## Chạy thử trên máy
Có thể mở `index.html` trực tiếp để xem giao diện. Tốt hơn, dùng VS Code cài extension Live Server rồi chọn **Open with Live Server**.

## Đưa lên GitHub Pages
1. Tạo repository mới trên GitHub, ví dụ `thiep-cuoi-tan-trang`.
2. Upload toàn bộ nội dung thư mục này (không upload file ZIP).
3. Vào **Settings → Pages**.
4. Trong **Build and deployment**, chọn **Deploy from a branch**.
5. Chọn branch `main`, folder `/ (root)`, nhấn **Save**.
6. Đợi vài phút, GitHub sẽ hiển thị link dạng `https://TEN-GITHUB.github.io/thiep-cuoi-tan-trang/`.

## Lưu ý quan trọng
- Thay ảnh mẫu bằng ảnh cưới thật của hai bạn trước khi chia sẻ.
- QR ngân hàng hiện để trống; chỉ thêm ảnh QR thật sau khi kiểm tra kỹ số tài khoản và tên chủ tài khoản.
- Form lời chúc trong bản hiện tại chỉ lưu trên trình duyệt của người gửi (localStorage), không tự đồng bộ cho mọi khách. Muốn mọi lời chúc cùng hiện cho tất cả người xem, cần kết nối Firebase hoặc backend.
- Tên, ngày, địa chỉ, ảnh và nhạc lấy từ `config.js`; sửa file rồi push commit mới để cập nhật website.
- Không đặt thông tin bí mật hoặc mật khẩu ngân hàng trong `config.js` vì mã nguồn GitHub Pages là công khai.
