# 🚀 Hướng dẫn Đơn Giản - Chạy Dự án với Tunnel

## ⚡ 3 Bước Đơn Giản

### Bước 1️⃣: Chạy Backend + Backend Tunnel
**Double-click:** `2-start-backend-tunnel.bat`

- Backend server sẽ tự động chạy trong cửa sổ mới
- Backend tunnel sẽ tạo URL công khai
- Bạn sẽ thấy URL như: `https://port-seo-rugs-jimmy.trycloudflare.com`
- **Copy URL này!** (chỉ phần domain, không có https:// và /api)
- **Giữ cửa sổ tunnel này mở**

### Bước 2️⃣: Cấu hình Frontend

**Double-click:** `update-frontend-env.bat`

- Khi được hỏi, nhập URL backend tunnel bạn đã copy
- Ví dụ: `port-seo-rugs-jimmy.trycloudflare.com`
- (Chỉ nhập domain, không có https:// và /api)
- Script sẽ tự động tạo file `frontend/.env`

### Bước 3️⃣: Chạy Frontend + Frontend Tunnel
**Double-click:** `4-start-frontend-tunnel.bat`

- Frontend server sẽ tự động chạy trong cửa sổ mới
- Frontend tunnel sẽ tạo URL công khai
- Bạn sẽ thấy URL như: `https://frontend-xyz.trycloudflare.com`
- **Copy URL này để gửi cho người test!**
- **Giữ cửa sổ tunnel này mở**

### Bước 4️⃣: Test & Chia sẻ
- Mở trình duyệt, truy cập URL Frontend Tunnel
- Đăng nhập: `admin` / `admin123`
- Gửi URL Frontend cho người khác để test

---

## ⚠️ Lưu ý quan trọng

1. **Giữ 2 cửa sổ mở:**
   - ✅ Cửa sổ Backend Tunnel
   - ✅ Cửa sổ Frontend Tunnel

2. **URL sẽ thay đổi** mỗi lần chạy lại tunnel

3. **Nếu URL Backend đổi:**
   - Chạy lại `update-frontend-env.bat` với URL mới
   - Restart frontend (đóng và chạy lại `4-start-frontend-tunnel.bat`)

4. **Nếu gặp "Network Error":**
   - Kiểm tra Backend Tunnel có đang chạy không
   - Kiểm tra file `frontend/.env` có đúng URL backend tunnel không
   - Mở Console (F12) để xem lỗi chi tiết

---

## 🔧 Troubleshooting

### Lỗi "Network Error"
1. **Kiểm tra Backend Tunnel:**
   - Đảm bảo `2-start-backend-tunnel.bat` đang chạy
   - Copy lại URL backend tunnel

2. **Kiểm tra file .env:**
   - Mở `frontend/.env`
   - Đảm bảo có dòng: `VITE_API_BASE_URL=https://[URL-BACKEND]/api`
   - (Thay `[URL-BACKEND]` bằng URL thực tế)

3. **Restart Frontend:**
   - Đóng cửa sổ Frontend Server và Frontend Tunnel
   - Chạy lại `4-start-frontend-tunnel.bat`

### Lỗi "Blocked request"
- Đã được sửa trong `vite.config.ts`
- Nếu vẫn gặp, restart frontend server

---

## 📋 Checklist

- [ ] Backend Tunnel đang chạy và có URL
- [ ] File `frontend/.env` đã được tạo với URL backend tunnel đúng
- [ ] Frontend Tunnel đang chạy và có URL
- [ ] Đã test đăng nhập thành công

---

## 🎯 Tóm tắt

```
1. Chạy 2-start-backend-tunnel.bat → Copy URL Backend
2. Chạy update-frontend-env.bat → Nhập URL Backend
3. Chạy 4-start-frontend-tunnel.bat → Copy URL Frontend
4. Gửi URL Frontend cho người test
5. Giữ 2 cửa sổ tunnel mở
```

Done! 🎉
