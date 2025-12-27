import { useState, useCallback, useRef } from 'react';
import { ScanData, computerApi } from '../services/api';
import { App } from 'antd';

// Local Agent URL
const AGENT_URL = 'http://localhost:3001';

interface SystemInfo extends ScanData {
  namSX?: number;
  scanTime?: string;
}

interface UseSystemInfoReturn {
  systemInfo: SystemInfo | null;
  isScanning: boolean;
  isSending: boolean;
  error: string | null;
  agentStatus: 'unknown' | 'checking' | 'online' | 'offline';
  scanSystem: () => Promise<void>;
  sendToServer: (additionalData?: Partial<ScanData>) => Promise<boolean>;
  clearInfo: () => void;
  checkAgent: () => Promise<boolean>;
}

/**
 * Hook để quét thông tin hệ thống thông qua Local Agent
 */
export function useSystemInfo(): UseSystemInfoReturn {
  const { message } = App.useApp();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<'unknown' | 'checking' | 'online' | 'offline'>('unknown');
  
  // Để tránh check nhiều lần
  const lastCheckRef = useRef<number>(0);
  const isCheckingRef = useRef<boolean>(false);

  /**
   * Kiểm tra Agent có đang chạy không
   * Chỉ check tối đa 1 lần mỗi 10 giây
   */
  const checkAgent = useCallback(async (): Promise<boolean> => {
    const now = Date.now();
    
    // Nếu đang check hoặc vừa check trong 10s trước, skip
    if (isCheckingRef.current) {
      return agentStatus === 'online';
    }
    
    if (now - lastCheckRef.current < 10000 && agentStatus !== 'unknown') {
      return agentStatus === 'online';
    }
    
    isCheckingRef.current = true;
    setAgentStatus('checking');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${AGENT_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setAgentStatus('online');
        lastCheckRef.current = now;
        isCheckingRef.current = false;
        return true;
      }
      
      setAgentStatus('offline');
      lastCheckRef.current = now;
      isCheckingRef.current = false;
      return false;
    } catch {
      // Không log lỗi vì đây là trạng thái bình thường khi chưa cài agent
      setAgentStatus('offline');
      lastCheckRef.current = now;
      isCheckingRef.current = false;
      return false;
    }
  }, [agentStatus]);

  /**
   * Quét thông tin hệ thống từ Local Agent
   */
  const scanSystem = useCallback(async () => {
    setIsScanning(true);
    setError(null);

    try {
      // Kiểm tra agent trước
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      let agentOnline = false;
      try {
        const healthResponse = await fetch(`${AGENT_URL}/health`, {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        agentOnline = healthResponse.ok;
      } catch {
        clearTimeout(timeoutId);
        agentOnline = false;
      }
      
      if (!agentOnline) {
        setAgentStatus('offline');
        throw new Error('Agent chưa chạy!');
      }
      
      setAgentStatus('online');

      // Gọi API quét từ local agent
      const scanController = new AbortController();
      const scanTimeoutId = setTimeout(() => scanController.abort(), 30000);
      
      const response = await fetch(`${AGENT_URL}/scan`, {
        method: 'GET',
        signal: scanController.signal,
      });
      
      clearTimeout(scanTimeoutId);

      if (!response.ok) {
        throw new Error('Lỗi khi quét thông tin từ Agent');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Quét thất bại');
      }

      const info: SystemInfo = {
        hostname: result.data.hostname,
        cpu: result.data.cpu,
        ram: result.data.ram,
        ssd: result.data.ssd,
        vga: result.data.vga,
        mac: result.data.mac,
        ip: result.data.ip,
        os: result.data.os,
        serialNumber: result.data.serialNumber,
        model: result.data.model,
        manufacturer: result.data.manufacturer,
        namSX: result.data.namSX,
        scanTime: result.data.scanTime,
      };

      setSystemInfo(info);
      message.success('Đã quét thông tin máy tính thành công!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi quét hệ thống';
      setError(errorMessage);
      
      if (errorMessage.includes('Agent chưa chạy')) {
        message.warning('Agent chưa chạy! Vui lòng xem hướng dẫn cài đặt.');
      } else {
        message.error(errorMessage);
      }
    } finally {
      setIsScanning(false);
    }
  }, [message]);

  /**
   * Gửi thông tin lên server
   */
  const sendToServer = useCallback(async (additionalData?: Partial<ScanData>) => {
    if (!systemInfo) {
      message.warning('Vui lòng quét thông tin trước');
      return false;
    }

    setIsSending(true);
    setError(null);

    try {
      const dataToSend: ScanData = {
        ...systemInfo,
        ...additionalData,
      };

      const response = await computerApi.submitScan(dataToSend);
      
      if (response.data.success) {
        message.success(response.data.message || 'Đã gửi thông tin thành công!');
        return true;
      } else {
        throw new Error(response.data.error || 'Gửi thất bại');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi gửi dữ liệu';
      setError(errorMessage);
      message.error(errorMessage);
      return false;
    } finally {
      setIsSending(false);
    }
  }, [systemInfo, message]);

  const clearInfo = useCallback(() => {
    setSystemInfo(null);
    setError(null);
  }, []);

  return {
    systemInfo,
    isScanning,
    isSending,
    error,
    agentStatus,
    scanSystem,
    sendToServer,
    clearInfo,
    checkAgent,
  };
}

export default useSystemInfo;
