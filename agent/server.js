/**
 * QUẢN LÝ MÁY TÍNH - LOCAL AGENT
 * 
 * Agent chạy trên MÁY CLIENT để quét thông tin phần cứng
 * Mỗi user cần chạy agent này trên máy của mình
 * 
 * Flow:
 * 1. User truy cập web app (http://192.168.x.x:5173)
 * 2. User bấm "Quét thông tin"
 * 3. Frontend gọi đến localhost:3001 (agent trên máy user)
 * 4. Agent quét và trả về thông tin
 * 5. Frontend gửi thông tin lên API server
 * 6. Admin xem dashboard
 */

const express = require('express');
const cors = require('cors');
const si = require('systeminformation');
const os = require('os');

const app = express();
const PORT = 3001;

// Enable CORS - cho phép tất cả origins vì frontend có thể được access từ nhiều IP
app.use(cors({
  origin: true, // Cho phép tất cả origins
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Lấy IP của máy hiện tại
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({ name, ip: iface.address });
      }
    }
  }
  return ips;
}

/**
 * Quét thông tin hệ thống chi tiết
 */
async function scanSystemInfo() {
  console.log('[*] Đang quét thông tin hệ thống...');
  
  try {
    // Lấy thông tin song song để nhanh hơn
    const [
      system,
      bios,
      cpu,
      mem,
      diskLayout,
      graphics,
      networkInterfaces,
      osInfo
    ] = await Promise.all([
      si.system(),
      si.bios(),
      si.cpu(),
      si.mem(),
      si.diskLayout(),
      si.graphics(),
      si.networkInterfaces(),
      si.osInfo()
    ]);

    // Tìm network interface có MAC (ưu tiên Ethernet/WiFi thực)
    const activeInterface = networkInterfaces.find(
      iface => iface.mac && 
               iface.mac !== '00:00:00:00:00:00' && 
               !iface.virtual &&
               (iface.type === 'wired' || iface.type === 'wireless')
    ) || networkInterfaces.find(iface => iface.mac && iface.mac !== '00:00:00:00:00:00');

    // Tính tổng RAM (GB)
    const totalRAM = (mem.total / (1024 * 1024 * 1024)).toFixed(1);

    // Ghép thông tin ổ cứng
    const diskInfo = diskLayout.map(disk => {
      const sizeGB = (disk.size / (1024 * 1024 * 1024)).toFixed(0);
      const type = disk.type || (disk.name?.toLowerCase().includes('ssd') ? 'SSD' : 'HDD');
      return `${disk.name || disk.vendor} ${sizeGB}GB ${type}`;
    }).join(' | ');

    // Ghép thông tin VGA
    const vgaInfo = graphics.controllers
      .map(gpu => gpu.model || gpu.name)
      .filter(Boolean)
      .join(' | ');

    // Xác định năm sản xuất (từ BIOS nếu có)
    let namSX = null;
    if (bios.releaseDate) {
      const year = new Date(bios.releaseDate).getFullYear();
      if (year > 2000 && year <= new Date().getFullYear()) {
        namSX = year;
      }
    }

    const result = {
      // Thông tin cơ bản
      hostname: osInfo.hostname,
      manufacturer: system.manufacturer || bios.vendor,
      model: system.model || 'Unknown',
      
      // Năm sản xuất
      namSX: namSX,
      
      // CPU
      cpu: `${cpu.manufacturer} ${cpu.brand} @ ${cpu.speed}GHz (${cpu.cores} cores)`,
      
      // RAM
      ram: `${totalRAM} GB`,
      
      // Storage
      ssd: diskInfo || 'Không xác định',
      
      // Graphics
      vga: vgaInfo || 'Không xác định',
      
      // Network
      mac: activeInterface?.mac || '00:00:00:00:00:00',
      ip: activeInterface?.ip4 || 'Không xác định',
      
      // OS
      os: `${osInfo.distro} ${osInfo.release}`,
      
      // Serial
      serialNumber: system.serial || bios.serial || 'Không xác định',
      
      // Thời gian quét
      scanTime: new Date().toISOString()
    };

    console.log('[+] Quét thành công!');
    console.log('    Hostname:', result.hostname);
    console.log('    Manufacturer:', result.manufacturer);
    console.log('    Model:', result.model);
    console.log('    CPU:', result.cpu);
    console.log('    RAM:', result.ram);
    console.log('    Storage:', result.ssd);
    console.log('    VGA:', result.vga);
    console.log('    MAC:', result.mac);
    console.log('    IP:', result.ip);

    return result;
  } catch (error) {
    console.error('[-] Lỗi quét:', error.message);
    throw error;
  }
}

// API: Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    agent: 'QLMT Local Agent',
    version: '1.0.0',
    hostname: os.hostname()
  });
});

// API: Quét thông tin
app.get('/scan', async (req, res) => {
  console.log(`\n[${new Date().toLocaleTimeString()}] Nhận yêu cầu quét từ: ${req.ip}`);
  
  try {
    const info = await scanSystemInfo();
    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API: Quét và trả về chi tiết đầy đủ
app.get('/scan/full', async (req, res) => {
  try {
    const [system, bios, cpu, mem, diskLayout, graphics, networkInterfaces, osInfo, battery] = 
      await Promise.all([
        si.system(),
        si.bios(),
        si.cpu(),
        si.mem(),
        si.diskLayout(),
        si.graphics(),
        si.networkInterfaces(),
        si.osInfo(),
        si.battery()
      ]);

    res.json({
      success: true,
      data: {
        system,
        bios,
        cpu,
        memory: mem,
        disks: diskLayout,
        graphics,
        network: networkInterfaces,
        os: osInfo,
        battery
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  const localIPs = getLocalIPs();
  
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         QUẢN LÝ MÁY TÍNH - LOCAL AGENT                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🖥️  Máy tính: ${os.hostname()}`);
  console.log(`🚀 Agent đang chạy tại port ${PORT}`);
  console.log('');
  console.log('📡 Endpoints:');
  console.log(`   http://localhost:${PORT}/health - Kiểm tra agent`);
  console.log(`   http://localhost:${PORT}/scan   - Quét thông tin`);
  console.log('');
  console.log('🌐 IP của máy này:');
  localIPs.forEach(({ name, ip }) => {
    console.log(`   ${name}: ${ip}`);
  });
  console.log('');
  console.log('📋 Hướng dẫn:');
  console.log('   1. Mở trình duyệt, truy cập web app');
  console.log('   2. Đăng nhập với tài khoản của bạn');
  console.log('   3. Bấm nút "Quét thông tin"');
  console.log('   4. Điền thông tin bổ sung và gửi');
  console.log('');
  console.log('⚠️  GIỮ CỬA SỔ NÀY MỞ khi đang sử dụng!');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('');
});
