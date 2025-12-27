import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';
import { getConnection } from './config/database';
import { seedDefaultAdmin } from './controllers/auth.controller';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


// Static files serving - Phải đặt TRƯỚC helmet để không bị chặn
const publicPath = path.join(process.cwd(), 'public');
app.use('/downloads', express.static(publicPath, {
  maxAge: '1d', // Cache 1 ngày
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Cho phép download file lớn
    if (filePath.endsWith('.exe')) {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', 'attachment; filename="CongCuQuetThongTin.exe"');
    }
    res.setHeader('Cache-Control', 'public, max-age=86400');
  },
}));

// Middleware
// Cấu hình helmet để cho phép download files
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Tắt CSP để không chặn downloads
}));
app.use(cors({
  origin: true, // Cho phép tất cả origins (để users từ các IP khác truy cập)
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
async function startServer() {
  try {
    // Kết nối database
    await getConnection();
    
    // Seed admin mặc định
    await seedDefaultAdmin();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
      console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Không thể khởi động server:', error);
    process.exit(1);
  }
}

startServer();

