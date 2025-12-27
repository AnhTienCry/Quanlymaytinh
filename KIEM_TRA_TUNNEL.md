# 🔍 Kiểm tra và Sửa lỗi Tunnel

## ❌ Lỗi: "This site can't be reached" / ERR_CONNECTION_TIMED_OUT

Lỗi này xảy ra khi Cloudflare Tunnel không thể kết nối đến Backend server.

---

## ✅ Các bước kiểm tra

### Bước 1: Kiểm tra Backend Server có đang chạy không

**Mở terminal, kiểm tra:**
```powershell
# Kiểm tra port 3000 có đang chạy không
netstat -an | findstr ":3000"
```

Nếu **KHÔNG** thấy kết quả → Backend chưa chạy!

**Giải pháp:**
1. Mở terminal mới
2. Chạy Backend:
```bash
cd backend
npm run dev
```

Đảm bảo thấy dòng:
```
🚀 Server đang chạy tại http://localhost:3000
```

---

### Bước 2: Kiểm tra Backend Tunnel có đang chạy không

Kiểm tra cửa sổ Backend Tunnel (từ `2-start-backend-tunnel.bat`):

**Nếu cửa sổ đóng hoặc báo lỗi:**
- Đóng cửa sổ cũ (nếu có)
- Chạy lại: `2-start-backend-tunnel.bat`
- Đợi tunnel khởi động (có thể mất 10-30 giây)
- Copy URL mới (URL thay đổi mỗi lần chạy lại!)

---

### Bước 3: Kiểm tra URL Tunnel có đúng không

**Lưu ý quan trọng:**
- URL Tunnel **thay đổi** mỗi lần chạy lại tunnel
- URL cũ sẽ **KHÔNG hoạt động** nếu tunnel đã dừng
- Phải dùng URL **mới nhất** từ cửa sổ tunnel

**Kiểm tra:**
1. Xem cửa sổ Backend Tunnel
2. Copy URL mới (ví dụ: `https://new-url.trycloudflare.com`)
3. Thử truy cập URL này trong trình duyệt

---

### Bước 4: Kiểm tra Firewall/Antivirus

**Firewall có thể chặn kết nối:**

1. **Windows Firewall:**
   - Mở Windows Security
   - Vào Firewall & network protection
   - Cho phép Node.js qua firewall

2. **Antivirus:**
   - Tạm thời tắt antivirus để test
   - Hoặc thêm exception cho Node.js

---

## 🔄 Cách khởi động lại đúng thứ tự

### Thứ tự đúng:

1. **Bước 1: Chạy Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Đợi thấy: `🚀 Server đang chạy tại http://localhost:3000`

2. **Bước 2: Chạy Backend Tunnel**
   - Double-click: `2-start-backend-tunnel.bat`
   - Đợi tunnel khởi động (10-30 giây)
   - Copy URL mới (ví dụ: `https://abc-xyz.trycloudflare.com`)

3. **Bước 3: Cập nhật Frontend .env**
   - Chạy: `update-frontend-env.bat`
   - Nhập URL Backend Tunnel mới
   - (Chỉ phần domain, không có https:// và /api)

4. **Bước 4: Chạy Frontend**
   - Chạy: `4-start-frontend-tunnel.bat`
   - Copy URL Frontend Tunnel

5. **Bước 5: Test**
   - Truy cập URL Frontend Tunnel trong trình duyệt
   - Đăng nhập và test

---

## 🚨 Lỗi thường gặp

### Lỗi 1: "Cannot determine default origin certificate path"

**Đây là cảnh báo bình thường, không ảnh hưởng!** Bạn có thể bỏ qua.

### Lỗi 2: "Failed to initialize DNS local resolver"

**Đây cũng là cảnh báo bình thường, không ảnh hưởng!** Bạn có thể bỏ qua.

### Lỗi 3: "Request failed error: stream canceled by remote"

**Nguyên nhân:** Tunnel bị disconnect hoặc server quá tải

**Giải pháp:**
- Khởi động lại Backend Tunnel
- Kiểm tra Backend server có đang chạy không

---

## ✅ Checklist nhanh

Khi gặp lỗi, kiểm tra theo thứ tự:

- [ ] Backend Server đang chạy (port 3000)
- [ ] Backend Tunnel đang chạy (cửa sổ mở)
- [ ] URL Tunnel là URL mới nhất (từ cửa sổ tunnel)
- [ ] Frontend .env đã cập nhật với URL Backend Tunnel đúng
- [ ] Firewall không chặn Node.js
- [ ] Đã thử truy cập URL Backend Tunnel trực tiếp (không qua frontend)

---

## 💡 Tips

1. **Giữ 2 cửa sổ mở:**
   - Backend Server terminal
   - Backend Tunnel terminal

2. **Nếu tunnel bị đóng:**
   - Đóng cửa sổ
   - Chạy lại `2-start-backend-tunnel.bat`
   - Copy URL mới
   - Cập nhật `frontend/.env`

3. **Test Backend trực tiếp:**
   - Truy cập: `https://your-backend-tunnel-url.trycloudflare.com/health`
   - Nếu thấy `{"status":"ok"}` → Backend OK!
   - Nếu lỗi → Kiểm tra Backend Server

---

## 🎯 Giải pháp nhanh

**Nếu vẫn không được, thử:**

1. **Đóng TẤT CẢ cửa sổ:**
   - Backend Server
   - Backend Tunnel
   - Frontend Server
   - Frontend Tunnel

2. **Khởi động lại từ đầu:**
   - Chạy Backend Server
   - Chạy Backend Tunnel (copy URL mới)
   - Cập nhật frontend/.env
   - Chạy Frontend Tunnel

3. **Test Backend trước:**
   - Truy cập URL Backend Tunnel + `/health`
   - Nếu OK → Frontend có vấn đề
   - Nếu lỗi → Backend có vấn đề

---

Done! 🎉

