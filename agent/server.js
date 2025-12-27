/**
 * QUẢN LÝ MÁY TÍNH - LOCAL AGENT
 */
const express = require('express');
const cors = require('cors');
const si = require('systeminformation');
const app = express();
const PORT = 3001;

// Đặt title để dễ tìm trong Task Manager
process.title = "CongCuQuetThongTin";

app.use(cors({ origin: true })); // Cho phép mọi nguồn gọi vào
app.use(express.json());

// 1. API Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// 2. API Scan
app.get('/scan', async (req, res) => {
  console.log(`[+] Đang quét thông tin...`);
  try {
    const [system, bios, cpu, mem, diskLayout, graphics, networkInterfaces, osInfo] = await Promise.all([
      si.system(), si.bios(), si.cpu(), si.mem(), si.diskLayout(), si.graphics(), si.networkInterfaces(), si.osInfo()
    ]);

    // Lấy MAC Address thật (ưu tiên dây/wifi, bỏ qua ảo)
    const activeInterface = networkInterfaces.find(
      iface => iface.mac && iface.mac !== '00:00:00:00:00:00' && !iface.virtual && (iface.type === 'wired' || iface.type === 'wireless')
    ) || networkInterfaces[0];

    const totalRAM = (mem.total / (1024 * 1024 * 1024)).toFixed(1);
    const diskInfo = diskLayout.map(d => `${d.name} ${(d.size / (1024**3)).toFixed(0)}GB`).join(' | ');
    const vgaInfo = graphics.controllers.map(g => g.model).join(' | ');

    const data = {
      hostname: osInfo.hostname,
      manufacturer: system.manufacturer || bios.vendor,
      model: system.model || 'Unknown',
      namSX: null, 
      cpu: `${cpu.manufacturer} ${cpu.brand} (${cpu.cores} cores)`,
      ram: `${totalRAM} GB`,
      ssd: diskInfo || 'N/A',
      vga: vgaInfo || 'N/A',
      mac: activeInterface?.mac || 'N/A',
      ip: activeInterface?.ip4 || 'N/A',
      os: `${osInfo.distro} ${osInfo.release}`,
      serialNumber: system.serial || bios.serial || 'N/A',
      scanTime: new Date().toISOString()
    };

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n==================================================`);
  console.log(`   CÔNG CỤ QUÉT THÔNG TIN ĐANG CHẠY (PORT ${PORT})`);
  console.log(`==================================================`);
  console.log(`\n -> Đừng tắt cửa sổ này.`);
  console.log(` -> Quay lại trình duyệt và bấm nút "Quét".`);
});