# Tạo SSL Certificate cho HTTPS (Tùy chọn)

## Cách 1: Sử dụng mkcert (Khuyến nghị)

### Cài đặt mkcert:
```bash
# Windows (với Chocolatey)
choco install mkcert

# Hoặc download từ: https://github.com/FiloSottile/mkcert/releases
```

### Tạo certificate:
```bash
# Cài đặt local CA
mkcert -install

# Tạo certificate cho localhost và IP LAN
mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1 192.168.2.11

# (Thay 192.168.2.11 bằng IP của máy bạn)
```

### Kết quả:
- `localhost.pem` - Certificate file
- `localhost-key.pem` - Private key file

Copy 2 file này vào thư mục `frontend/`

## Cách 2: Bỏ qua HTTPS (đơn giản hơn)

Nếu không cần HTTPS, giữ nguyên cấu hình hiện tại. 
Browser sẽ cảnh báo nhưng vẫn hoạt động bình thường cho việc test.

## Lưu ý

- Certificate tự ký (self-signed) chỉ dùng cho development
- Production cần certificate thật từ Let's Encrypt hoặc CA khác
- Cảnh báo "insecure connection" là bình thường khi dùng HTTP trên IP LAN

