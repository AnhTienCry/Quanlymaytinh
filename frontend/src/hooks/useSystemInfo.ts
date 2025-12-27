import { useState, useCallback, useRef, useEffect } from 'react';
import { computerApi, ScanData } from '../services/api'; 

const AGENT_URL = 'http://localhost:3001';

export function useSystemInfo(options: { autoCheck?: boolean } = {}) {
  // Đã xóa const { message } = App.useApp() vì hook này chỉ xử lý logic, không hiển thị UI
  const [systemInfo, setSystemInfo] = useState<any | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  
  const checkingRef = useRef(false);

  // Check Tool
  const checkAgent = useCallback(async (silent = false): Promise<boolean> => {
    if (checkingRef.current) return false;
    checkingRef.current = true;
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 500);
      const res = await fetch(`${AGENT_URL}/health`, { signal: controller.signal });
      clearTimeout(id);
      if (res.ok) {
        setAgentStatus('online');
        checkingRef.current = false;
        return true;
      }
    } catch {}
    if (!silent) setAgentStatus('offline');
    checkingRef.current = false;
    return false;
  }, []);

  // Auto Check Loop
  useEffect(() => {
    if (!options.autoCheck) return;
    checkAgent(true);
    const interval = setInterval(() => checkAgent(true), 10000);
    return () => clearInterval(interval);
  }, [options.autoCheck, checkAgent]);

  // Quét & Return Data
  const scanSystem = useCallback(async () => {
    setIsScanning(true);
    try {
      const isOnline = await checkAgent(true);
      if (!isOnline) throw new Error('Tool chưa bật');

      const res = await fetch(`${AGENT_URL}/scan`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setSystemInfo(json.data);
      return json.data;
    } catch (err) {
      setAgentStatus('offline');
      return null;
    } finally {
      setIsScanning(false);
    }
  }, [checkAgent]);

  // Gửi Server
  const sendToServer = useCallback(async (data: Partial<ScanData>) => {
    setIsSending(true);
    try {
      await computerApi.submitScan(data as ScanData);
      return true;
    } catch (e) {
      return false;
    } finally {
      setIsSending(false);
    }
  }, []);

  return { systemInfo, isScanning, isSending, agentStatus, scanSystem, sendToServer, clearInfo: () => setSystemInfo(null) };
}

export default useSystemInfo;