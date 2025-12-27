import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { UserPayload, ApiResponse } from '../types';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

/**
 * Middleware xác thực JWT
 */
export function authenticateToken(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Không tìm thấy token xác thực',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: 'Token không hợp lệ hoặc đã hết hạn',
    });
    return;
  }
}

/**
 * Middleware kiểm tra quyền Admin
 */
export function requireAdmin(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Chưa xác thực',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Bạn không có quyền truy cập chức năng này',
    });
    return;
  }

  next();
}

/**
 * Middleware kiểm tra quyền User (bất kỳ role nào)
 */
export function requireUser(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Chưa xác thực',
    });
    return;
  }

  next();
}



