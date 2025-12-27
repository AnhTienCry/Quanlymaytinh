# QLMT Agent

Agent quét thông tin máy tính - Tự động chạy khi user bấm "Quét thông tin" trên web.

## Cách hoạt động

1. User bấm nút "Quét thông tin" trên web
2. Hệ thống tự động tải file `QuetThongTin.bat` về
3. File tự động mở và chạy agent
4. Agent chạy ngầm, tự động thêm vào Windows Startup
5. Hệ thống tự động quét thông tin sau 5 giây

## Thông tin

- Agent chạy tại: http://localhost:3001
- Kiểm tra: http://localhost:3001/health
- Quét: http://localhost:3001/scan
