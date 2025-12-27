import { Request, Response } from 'express';
import { existsSync } from 'fs';
import { join } from 'path';

export async function downloadAgentLauncher(req: Request, res: Response) {
  try {
    // CÁCH MỚI: Dùng process.cwd() để lấy thư mục gốc của Backend
    // Nó sẽ trỏ về: E:\DEVcodon\Projects\Quanlymaytinh\backend
    const rootDir = process.cwd();
    
    // Đường dẫn file mong muốn: backend/public/CongCuQuetThongTin.exe
    const filePath = join(rootDir, 'public', 'CongCuQuetThongTin.exe');
    
    // In ra log để kiểm tra (Quan trọng)
    console.log('------------------------------------------------');
    console.log('📂 Thư mục gốc (CWD):', rootDir);
    console.log('🔍 Đang tìm file tại:', filePath);
    console.log('------------------------------------------------');

    if (!existsSync(filePath)) {
      console.error('❌ KẾT QUẢ: Không tìm thấy file!');
      return res.status(404).json({ 
        error: `Không tìm thấy file tại server. Đường dẫn: ${filePath}` 
      });
    }
    
    console.log('✅ KẾT QUẢ: Đã thấy file! Đang gửi...');
    res.download(filePath, 'CongCuQuetThongTin.exe');
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Lỗi server khi tải file.' });
  }
}

export function getAgentInfo(req: Request, res: Response) {
    res.json({ success: true, message: "Agent API Ready" });
}