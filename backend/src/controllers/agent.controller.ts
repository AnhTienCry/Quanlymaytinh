import { Request, Response } from 'express';
import { existsSync } from 'fs';
import { join } from 'path';

export async function downloadAgentLauncher(req: Request, res: Response) {
  try {
    const rootDir = process.cwd();
    const filePath = join(rootDir, 'public', 'CongCuQuetThongTin.exe');
    
    console.log('📥 Download request:', {
      rootDir,
      filePath,
      exists: existsSync(filePath),
    });

    if (!existsSync(filePath)) {
      console.error('❌ File not found:', filePath);
      return res.status(404).json({ 
        error: 'Không tìm thấy file agent. Vui lòng liên hệ admin.' 
      });
    }
    
    // Set headers cho file download lớn
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="CongCuQuetThongTin.exe"');
    res.setHeader('Cache-Control', 'no-cache');
    
    console.log('✅ Sending file:', filePath);
    res.download(filePath, 'CongCuQuetThongTin.exe', (err) => {
      if (err) {
        console.error('❌ Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Lỗi khi tải file.' });
        }
      } else {
        console.log('✅ File sent successfully');
      }
    });
    
  } catch (error) {
    console.error('❌ Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Lỗi server khi tải file.' });
    }
  }
}

export function getAgentInfo(req: Request, res: Response) {
    res.json({ success: true, message: "Agent API Ready" });
}