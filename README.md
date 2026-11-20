# Website thiệp cưới Tân & Trang

## Cấu trúc
- `index.html`: cấu trúc nội dung website.
- `style.css`: CSS tùy chỉnh.
- `script.js`: đồng hồ đếm ngược, lịch, album, nhạc và tương tác.
- `config.js`: nơi thay tên, ngày giờ, địa chỉ, ảnh, QR và nhạc.
- `assets/`: nơi đặt ảnh và file MP3 của hai bạn.
- `firebase.js/`: nơi cấu hình, chạy và lưu phần lời chúc.

## Cách thay thông tin
1. Mở `config.js` bằng VS Code.
2. Sửa tên, ngày, địa chỉ, thời gian sự kiện và đường dẫn ảnh/QR.
3. Lưu file. Khi website được push lên GitHub, bản online sẽ cập nhật sau khi GitHub Pages deploy xong.
4. Với ảnh, hãy chép file vào `assets/` rồi sửa đường dẫn, ví dụ `assets/anh-bia.jpg`.
5. Với nhạc, đặt MP3 tại `assets/music.mp3`. Khách cần nhấn nút nốt nhạc để phát do trình duyệt chặn tự phát.
