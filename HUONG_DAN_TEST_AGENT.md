# 🧪 Hướng dẫn Test Agent Mới

## 📋 Chuẩn bị

### Bước 1: Đảm bảo Backend đang chạy

1. Mở terminal, chạy backend:
```bash
cd backend
npm run dev
```

Backend phải chạy tại: `http://localhost:3000`

**Nếu dùng Cloudflare Tunnel:**
- Chạy Backend Tunnel và copy URL (ví dụ: `https://abc-xyz.trycloudflare.com`)
- Nhớ URL này để cấu hình cho agent

---

## 🔨 Build Agent

### Bước 2: Build file .exe

```bash
cd agent
npm install
npm run build
```

Sau khi build xong, bạn sẽ có file: `agent/CongCuQuetThongTin.exe`

**Lưu ý:** Nếu chưa có `pkg` globally, có thể cần:
```bash
npm install -g pkg
```

---

## ⚙️ Cấu hình Server URL cho Agent

### Nếu test local (Backend chạy tại localhost:3000):

**Không cần làm gì!** Agent mặc định dùng `http://localhost:3000`

### Nếu test với Cloudflare Tunnel:

Có 2 cách:

**Cách 1: Set Environment Variable (Khuyên dùng)**
```bash
# Windows PowerShell
$env:SERVER_URL="https://abc-xyz.trycloudflare.com"

# Sau đó chạy agent
node scan-and-send.js
```

**Cách 2: Sửa trực tiếp trong code**

Mở file `agent/scan-and-send.js`, tìm dòng 14:
```javascript
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
```

Sửa thành:
```javascript
const SERVER_URL = process.env.SERVER_URL || 'https://abc-xyz.trycloudflare.com';
```

Sau đó build lại:
```bash
npm run build
```

---

## 🧪 Test Agent

### Cách 1: Test bằng Node.js (Development)

```bash
cd agent
node scan-and-send.js
```

### Cách 2: Test bằng file .exe (Production)

Double-click vào file `CongCuQuetThongTin.exe` hoặc chạy trong terminal:

```bash
cd agent
.\CongCuQuetThongTin.exe
```

---

## 📝 Quy trình Test

### Khi chạy agent, bạn sẽ thấy:

1. **Màn hình chào mừng:**
```
==================================================
   CÔNG CỤ QUÉT THÔNG TIN MÁY TÍNH
==================================================
```

2. **Yêu cầu nhập tên người dùng:**
```
Nhập tên người dùng: 
```

3. **Nhập tên người dùng** (ví dụ: `Nguyen Van A`) và nhấn Enter

4. **Agent sẽ quét thông tin:**
```
[+] Đang quét thông tin máy tính...

[+] Thông tin đã quét:
   - Hostname: DESKTOP-ABC123
   - MAC: 00:11:22:33:44:55
   - IP: 192.168.1.100
   - CPU: Intel Core i7-10700 (8 cores)
   - RAM: 16.0 GB

[+] Đang gửi dữ liệu lên server: http://localhost:3000/api/computers/scan-direct
```

5. **Kết quả:**

**✅ Nếu thành công:**
```
==================================================
   ✓ GỬI DỮ LIỆU THÀNH CÔNG!
==================================================

   Máy tính đã được lưu với ID: 123

   Nhấn Enter để thoát...
```

**❌ Nếu lỗi:**
```
==================================================
   ✗ LỖI!
==================================================

   Lỗi kết nối: connect ECONNREFUSED 127.0.0.1:3000

   Nhấn Enter để thoát...
```

---

## ✅ Kiểm tra dữ liệu đã lưu

### Cách 1: Qua Admin Dashboard

1. Đăng nhập vào web với tài khoản admin
2. Vào trang **"Quản lý Máy tính"**
3. Kiểm tra xem máy tính mới đã xuất hiện chưa

### Cách 2: Qua Database

1. Mở SQL Server Management Studio
2. Query bảng `MayTinh`:
```sql
SELECT TOP 10 * FROM MayTinh ORDER BY NgayTao DESC
```

3. Kiểm tra bảng `LichSuQuet`:
```sql
SELECT TOP 10 * FROM LichSuQuet ORDER BY NgayQuet DESC
```

---

## 🔍 Troubleshooting

### Lỗi 1: "Lỗi kết nối: connect ECONNREFUSED"

**Nguyên nhân:** Backend không chạy hoặc URL sai

**Giải pháp:**
- Kiểm tra Backend có đang chạy không
- Kiểm tra URL trong agent có đúng không
- Nếu dùng tunnel, đảm bảo tunnel URL đúng

### Lỗi 2: "Địa chỉ MAC không hợp lệ"

**Nguyên nhân:** Agent không lấy được MAC address

**Giải pháp:**
- Kiểm tra network adapter
- Thử chạy với quyền Administrator

### Lỗi 3: "Lỗi server lưu dữ liệu"

**Nguyên nhân:** Backend có lỗi khi lưu vào database

**Giải pháp:**
- Kiểm tra Backend logs
- Kiểm tra kết nối database
- Kiểm tra database schema có đúng không

### Lỗi 4: Build .exe không thành công

**Nguyên nhân:** Thiếu `pkg` hoặc có lỗi trong code

**Giải pháp:**
```bash
npm install -g pkg
cd agent
npm install
npm run build
```

Nếu vẫn lỗi, test bằng `node scan-and-send.js` trước để đảm bảo code chạy đúng.

---

## 🎯 Test Cases

### Test Case 1: Test Local (Backend localhost)
- ✅ Backend chạy tại localhost:3000
- ✅ Agent không set SERVER_URL (dùng mặc định)
- ✅ Chạy agent → Nhập username → Kiểm tra dữ liệu đã lưu

### Test Case 2: Test với Tunnel
- ✅ Backend chạy với tunnel
- ✅ Agent set SERVER_URL = tunnel URL
- ✅ Chạy agent từ máy khác → Nhập username → Kiểm tra dữ liệu đã lưu

### Test Case 3: Test gửi lại (Update máy đã có)
- ✅ Chạy agent lần đầu (INSERT)
- ✅ Chạy agent lần 2 với cùng MAC (UPDATE)
- ✅ Kiểm tra dữ liệu đã được update

---

## 📌 Checklist Test

- [ ] Backend đang chạy
- [ ] Agent build thành công
- [ ] Cấu hình SERVER_URL đúng
- [ ] Agent chạy và quét được thông tin
- [ ] Agent gửi được dữ liệu lên server
- [ ] Dữ liệu đã lưu vào database
- [ ] Hiển thị đúng trong Admin Dashboard
- [ ] Lịch sử quét đã được lưu

---

## 🚀 Khi test xong

Nếu mọi thứ hoạt động tốt:

1. **Copy file .exe** từ `agent/CongCuQuetThongTin.exe` vào `backend/public/`
2. **Đảm bảo** file `.exe` trong `backend/public/` là version mới nhất
3. **Test download** từ web xem file có đúng không
4. **Distribute** file `.exe` cho users

---

## 💡 Tips

- **Test bằng Node.js trước** (`node scan-and-send.js`) để dễ debug
- **Kiểm tra Backend logs** khi có lỗi
- **Test với nhiều username khác nhau** để đảm bảo dữ liệu đúng
- **Kiểm tra database** để xác nhận dữ liệu đã lưu đúng

---

Done! 🎉

