# 🚀 Hướng dẫn Chạy Dự án với Cloudflare Tunnel

## ⚡ Cách nhanh nhất - Chạy 4 file .bat theo thứ tự

### Bước 1: Chạy Backend Server
**Double-click:** `1-start-backend.bat`
- Backend sẽ chạy trên http://localhost:3000
- **Giữ cửa sổ này mở**

### Bước 2: Chạy Backend Tunnel  
**Double-click:** `2-start-backend-tunnel.bat`
- Sẽ tạo URL công khai cho backend
- **Copy URL được tạo** (ví dụ: `https://abc-xyz.trycloudflare.com`)
- **Giữ cửa sổ này mở**

### Bước 3: Cấu hình Frontend

Mở file `frontend/.env` (tạo mới nếu chưa có) và thêm:

```env
VITE_API_BASE_URL=https://abc-xyz.trycloudflare.com/api
```

**Lưu ý:**
- Thay `abc-xyz` bằng URL thực tế bạn đã copy ở Bước 2
- Đảm bảo có `/api` ở cuối URL
- File `.env` phải nằm trong thư mục `frontend/`

### Bước 4: Chạy Frontend Server
**Double-click:** `3-start-frontend.bat`
- Frontend sẽ chạy trên http://localhost:5173
- **Giữ cửa sổ này mở**

### Bước 5: Chạy Frontend Tunnel
**Double-click:** `4-start-frontend-tunnel.bat`
- Sẽ tạo URL công khai cho frontend
- **Copy URL này để gửi cho người test** (ví dụ: `https://frontend-xyz.trycloudflare.com`)
- **Giữ cửa sổ này mở**

### Bước 6: Test & Chia sẻ
- Mở trình duyệt, truy cập URL Frontend Tunnel
- Test đăng nhập: `admin` / `admin123`
- Gửi URL Frontend Tunnel cho người khác để test

---

## 📋 Checklist

Khi có người test, bạn phải giữ **4 cửa sổ** đang mở:

- [ ] ✅ Cửa sổ 1: `1-start-backend.bat` - Backend Server
- [ ] ✅ Cửa sổ 2: `2-start-backend-tunnel.bat` - Backend Tunnel
- [ ] ✅ Cửa sổ 3: `3-start-frontend.bat` - Frontend Server  
- [ ] ✅ Cửa sổ 4: `4-start-frontend-tunnel.bat` - Frontend Tunnel

---

## ⚠️ Lưu ý quan trọng

1. **Thứ tự chạy:** Phải chạy theo đúng thứ tự 1 → 2 → 3 → 4

2. **URL Backend Tunnel thay đổi:** 
   - Mỗi lần chạy lại `2-start-backend-tunnel.bat`, URL backend sẽ đổi
   - Cần cập nhật lại `frontend/.env` với URL mới
   - Restart frontend (đóng và chạy lại `3-start-frontend.bat`)

3. **URL Frontend Tunnel thay đổi:**
   - Mỗi lần chạy lại `4-start-frontend-tunnel.bat`, URL frontend sẽ đổi
   - Cần gửi URL mới cho người test

4. **Tất cả cửa sổ phải mở:**
   - Nếu đóng bất kỳ cửa sổ nào, người khác sẽ không truy cập được
   - Tunnel chỉ hoạt động khi terminal đang chạy

---

## 🔧 Troubleshooting

### Lỗi "Connection refused"
- Đảm bảo backend/frontend đã chạy trước khi start tunnel
- Kiểm tra port đúng (3000 cho backend, 5173 cho frontend)

### API không hoạt động
- Kiểm tra `frontend/.env` có đúng URL backend tunnel không
- Đảm bảo có `/api` ở cuối URL
- Restart frontend sau khi thay đổi `.env`

### Tunnel không kết nối được
- Kiểm tra kết nối internet
- Thử chạy lại tunnel (đóng và mở lại file .bat)

---

## 💡 Tips

- **Lần đầu setup:** Chạy từng bước một để đảm bảo không có lỗi
- **Lần sau:** Có thể mở cả 4 file cùng lúc (nhưng đợi mỗi bước hoàn thành trước)
- **Gửi cho người test:** Chỉ cần gửi URL Frontend Tunnel, không cần gửi URL Backend

