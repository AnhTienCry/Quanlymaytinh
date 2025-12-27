import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import fs from 'fs';
import path from 'path';

// Tự động tạo self-signed certificate cho HTTPS (chỉ dùng cho development)
// Nếu chưa có, sẽ dùng HTTP (cảnh báo browser là bình thường)
function getHttpsConfig() {
  const certPath = path.resolve(__dirname, 'localhost.pem');
  const keyPath = path.resolve(__dirname, 'localhost-key.pem');

  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    try {
      return {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
      };
    } catch {
      // Nếu đọc file lỗi, return undefined để dùng HTTP
      return undefined;
    }
  }

  // Nếu không có cert, return undefined để dùng HTTP
  // Cảnh báo "insecure connection" là bình thường khi dùng HTTP trên IP LAN
  return undefined;
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0', // Cho phép truy cập từ IP khác trong mạng LAN
    https: getHttpsConfig(), // Tự động dùng HTTPS nếu có cert, nếu không thì HTTP
    strictPort: false,
    // Cho phép tất cả subdomain của trycloudflare.com cho Cloudflare Tunnel
    // Pattern này sẽ match bất kỳ subdomain nào của trycloudflare.com
    allowedHosts: [
      '.trycloudflare.com', // Cho phép tất cả subdomain (wildcard)
      'localhost',
      '127.0.0.1',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
