import { Request, Response } from 'express';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ApiResponse } from '../types';

/**
 * Tải file Agent Launcher
 */
export async function downloadAgentLauncher(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Thử nhiều đường dẫn có thể
    const possiblePaths = [
      join(process.cwd(), 'agent/QuetThongTin.bat'),
      join(process.cwd(), '../agent/QuetThongTin.bat'),
      join(__dirname, '../../../agent/QuetThongTin.bat'),
      join(__dirname, '../../../../agent/QuetThongTin.bat'),
    ];
    
    let launcherPath: string | null = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        launcherPath = path;
        break;
      }
    }
    
    if (!launcherPath) {
      console.error('Không tìm thấy file launcher. Đã thử các đường dẫn:', possiblePaths);
      res.status(404).json({
        success: false,
        error: 'Không tìm thấy file agent launcher. Vui lòng liên hệ Admin.',
      });
      return;
    }
    
    // Đọc file
    const fileContent = readFileSync(launcherPath);
    
    // Set headers để download file
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="QuetThongTin.bat"');
    res.setHeader('Content-Length', fileContent.length.toString());
    
    res.send(fileContent);
  } catch (error) {
    console.error('Download agent launcher error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tải file agent launcher',
    });
  }
}

/**
 * Serve thư mục agent (static files)
 */
export function getAgentInfo(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  return Promise.resolve(
    res.json({
      success: true,
      data: {
        downloadUrl: '/api/agent/download',
        instructions: [
          '1. Nhấn nút "Tải Agent Launcher"',
          '2. Chạy file vừa tải về',
          '3. Agent sẽ tự động khởi động',
          '4. Quay lại đây và bấm "Quét thông tin"',
        ],
      },
    })
  );
}

