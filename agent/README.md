# Agent - Quét và Gửi Thông Tin Máy Tính

## Cách hoạt động

1. User tải file `CongCuQuetThongTin.exe` từ web
2. User mở file `.exe`
3. File yêu cầu nhập **Tên người dùng**
4. File tự động quét thông tin máy tính
5. File gửi trực tiếp lên server (không cần local server, không cần web)

## Build Agent

```bash
npm install
npm run build
```

File output: `CongCuQuetThongTin.exe`

## Cấu hình Server URL

Agent mặc định gửi đến `http://localhost:3000`. 

Để đổi URL server (ví dụ khi dùng Cloudflare Tunnel):

**Windows PowerShell:**
```powershell
$env:SERVER_URL="https://your-backend.trycloudflare.com"
node scan-and-send.js
```

**Hoặc sửa trực tiếp trong code:**

Mở `scan-and-send.js`, tìm dòng 15:
```javascript
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
```

Sửa thành:
```javascript
const SERVER_URL = process.env.SERVER_URL || 'https://your-backend.trycloudflare.com';
```

Sau đó build lại:
```bash
npm run build
```

## Test

### Test bằng Node.js (Development):
```bash
node scan-and-send.js
```

### Test bằng file .exe:
Double-click `CongCuQuetThongTin.exe` hoặc:
```bash
.\CongCuQuetThongTin.exe
```

## Endpoint Backend

Agent gửi POST request đến: `/api/computers/scan-direct`

Endpoint này không cần authentication (public endpoint).

## Cấu trúc dữ liệu gửi lên

```json
{
  "hostname": "DESKTOP-ABC123",
  "manufacturer": "Dell Inc.",
  "model": "OptiPlex 7090",
  "cpu": "Intel Core i7-10700 (8 cores)",
  "ram": "16.0 GB",
  "ssd": "NVMe SSD 512GB",
  "vga": "NVIDIA GeForce RTX 3060",
  "mac": "00:11:22:33:44:55",
  "ip": "192.168.1.100",
  "os": "Windows 10 21H2",
  "serialNumber": "ABC123456",
  "tenNguoiDung": "Nguyen Van A"
}
```
