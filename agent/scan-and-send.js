/**
 * QUẢN LÝ MÁY TÍNH - AGENT QUÉT VÀ GỬI TRỰC TIẾP
 * 
 * File này quét thông tin máy tính và gửi trực tiếp lên server
 * Không cần local server, không cần tương tác với web
 */

const si = require('systeminformation');
const https = require('https');
const http = require('http');
const readline = require('readline');

// Cấu hình - có thể set qua environment variable SERVER_URL
// Ví dụ: SERVER_URL=https://your-backend.trycloudflare.com node scan-and-send.js
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const API_ENDPOINT = `${SERVER_URL}/api/computers/scan-direct`;

// Đặt title để dễ tìm trong Task Manager
process.title = "CongCuQuetThongTin";

// ANSI Color Codes cho console đẹp hơn
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
};

// Helper functions để tạo UI đẹp
function printHeader() {
  const header = `
${colors.cyan}${'═'.repeat(60)}${colors.reset}
${colors.bright}${colors.cyan}          CÔNG CỤ QUÉT THÔNG TIN MÁY TÍNH${colors.reset}
${colors.cyan}${'═'.repeat(60)}${colors.reset}
`;
  console.log(header);
}

function printBox(title, content) {
  const width = 58;
  console.log(`${colors.blue}┌${'─'.repeat(width)}┐${colors.reset}`);
  console.log(`${colors.blue}│${colors.reset} ${colors.bright}${colors.white}${title.padEnd(width - 2)}${colors.reset} ${colors.blue}│${colors.reset}`);
  console.log(`${colors.blue}├${'─'.repeat(width)}┤${colors.reset}`);
  const lines = content.split('\n');
  lines.forEach(line => {
    console.log(`${colors.blue}│${colors.reset} ${line.padEnd(width - 2)} ${colors.blue}│${colors.reset}`);
  });
  console.log(`${colors.blue}└${'─'.repeat(width)}┘${colors.reset}`);
}

function printSuccess(message) {
  console.log(`\n${colors.bgGreen}${colors.white}${colors.bright} ✓ ${message} ${colors.reset}\n`);
}

function printError(message) {
  console.log(`\n${colors.bgRed}${colors.white}${colors.bright} ✗ ${message} ${colors.reset}\n`);
}

function printInfo(label, value, color = colors.cyan) {
  if (value === undefined || value === null) return; // Skip undefined/null values
  const labelWidth = 20;
  const paddedLabel = label.padEnd(labelWidth);
  console.log(`  ${colors.dim}${paddedLabel}${colors.reset}${color}${value}${colors.reset}`);
}

function printSeparator() {
  console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`);
}

// Tạo readline interface để nhập username
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Hàm quét thông tin máy tính
 */
async function scanComputer() {
  console.log(`\n${colors.yellow}${colors.bright}[+]${colors.reset} ${colors.yellow}Đang quét thông tin máy tính...${colors.reset}\n`);
  
  // Hiển thị progress indicator
  const progressChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let progressIndex = 0;
  const progressInterval = setInterval(() => {
    process.stdout.write(`\r${colors.cyan}${progressChars[progressIndex]} Đang quét...${colors.reset}`);
    progressIndex = (progressIndex + 1) % progressChars.length;
  }, 100);
  
  try {
    const [system, bios, cpu, mem, diskLayout, graphics, networkInterfaces, osInfo, baseboard] = await Promise.all([
      si.system(),
      si.bios(),
      si.cpu(),
      si.mem(),
      si.diskLayout(),
      si.graphics(),
      si.networkInterfaces(),
      si.osInfo(),
      si.baseboard().catch(() => null) // Có thể không có thông tin
    ]);

    clearInterval(progressInterval);
    process.stdout.write('\r' + ' '.repeat(30) + '\r'); // Clear progress line

    // Lấy MAC Address thật (ưu tiên dây/wifi, bỏ qua ảo)
    const activeInterface = networkInterfaces.find(
      iface => iface.mac && iface.mac !== '00:00:00:00:00:00' && !iface.virtual && (iface.type === 'wired' || iface.type === 'wireless')
    ) || networkInterfaces[0];

    // Format RAM
    const totalRAM = (mem.total / (1024 * 1024 * 1024)).toFixed(1);
    
    // Format Ổ cứng - Chi tiết hơn
    const diskInfo = diskLayout.map(d => {
      const sizeGB = (d.size / (1024**3)).toFixed(0);
      return `${d.name || d.type || 'Disk'} ${sizeGB}GB ${d.interface ? `(${d.interface})` : ''}`.trim();
    }).join(' | ');
    
    // Format VGA - Chi tiết hơn
    const vgaInfo = graphics.controllers.map(g => {
      const vram = g.vram ? ` ${(g.vram / 1024).toFixed(0)}MB` : '';
      return `${g.model}${vram}`;
    }).filter(Boolean).join(' | ') || 'N/A';

    // Format CPU - Chi tiết hơn
    const cpuInfo = `${cpu.manufacturer} ${cpu.brand} (${cpu.cores} cores${cpu.physicalCores ? `, ${cpu.physicalCores} physical` : ''})`;
    
    // Format OS - Chi tiết hơn cho Windows
    let osInfoFormatted = '';
    if (osInfo.platform === 'win32') {
      osInfoFormatted = `${osInfo.distro} ${osInfo.release} ${osInfo.build || ''}`.trim();
    } else {
      osInfoFormatted = `${osInfo.distro} ${osInfo.release}`;
    }
    
    // Lấy Năm sản xuất từ BIOS date hoặc system
    let namSX = null;
    if (bios.releaseDate) {
      const yearMatch = bios.releaseDate.match(/\d{4}/);
      if (yearMatch) {
        namSX = parseInt(yearMatch[0]);
      }
    }
    // Nếu không có từ BIOS, thử từ baseboard
    if (!namSX && baseboard?.releaseDate) {
      const yearMatch = baseboard.releaseDate.match(/\d{4}/);
      if (yearMatch) {
        namSX = parseInt(yearMatch[0]);
      }
    }

    // Manufacturer và Model
    const manufacturer = system.manufacturer || bios.vendor || baseboard?.manufacturer || '';
    const model = system.model || baseboard?.model || 'Unknown';

    const data = {
      hostname: osInfo.hostname || 'Unknown',
      manufacturer: manufacturer,
      model: model,
      namSX: namSX, // Năm sản xuất (nếu có)
      cpu: cpuInfo,
      ram: `${totalRAM} GB`,
      ssd: diskInfo || 'N/A',
      vga: vgaInfo,
      mac: activeInterface?.mac || 'N/A',
      ip: activeInterface?.ip4 || activeInterface?.ip6 || 'N/A',
      os: osInfoFormatted,
      serialNumber: system.serial || bios.serial || baseboard?.serial || 'N/A',
    };

    return data;
  } catch (error) {
    clearInterval(progressInterval);
    process.stdout.write('\r' + ' '.repeat(30) + '\r'); // Clear progress line
    printError(`Lỗi khi quét thông tin: ${error.message}`);
    throw error;
  }
}

/**
 * Hàm gửi dữ liệu lên server
 */
function sendToServer(data, username) {
  return new Promise((resolve, reject) => {
    // Thêm username vào data
    data.tenNguoiDung = username;

    const postData = JSON.stringify(data);
    const url = new URL(API_ENDPOINT);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const client = url.protocol === 'https:' ? https : http;

    console.log(`\n${colors.yellow}${colors.bright}[+]${colors.reset} ${colors.yellow}Đang gửi dữ liệu lên server...${colors.reset}`);
    console.log(`${colors.dim}   URL: ${API_ENDPOINT}${colors.reset}\n`);
    
    const req = client.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (res.statusCode === 200 && result.success) {
            resolve(result);
          } else {
            reject(new Error(result.error || 'Lỗi server'));
          }
        } catch (e) {
          reject(new Error('Không thể parse response từ server'));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Lỗi kết nối: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Hàm main
 */
async function main() {
  // Clear screen
  console.clear();
  printHeader();

  // Bước 1: Yêu cầu nhập tên người dùng
  console.log(`${colors.bright}${colors.white}Bước 1:${colors.reset} ${colors.cyan}Nhập thông tin${colors.reset}\n`);
  console.log(`${colors.yellow}⚠️  Lưu ý:${colors.reset} Vui lòng nhập chính xác ${colors.bright}${colors.white}tên đăng nhập${colors.reset} của bạn trên hệ thống\n`);
  
  rl.question(`${colors.bright}${colors.cyan}→${colors.reset} ${colors.white}Tên đăng nhập:${colors.reset} `, async (username) => {
    if (!username || username.trim() === '') {
      printError('Tên đăng nhập không được để trống!');
      rl.close();
      process.exit(1);
    }

    username = username.trim();

    try {
      // Bước 2: Quét thông tin máy tính
      console.log(`\n${colors.bright}${colors.white}Bước 2:${colors.reset} ${colors.cyan}Quét thông tin máy tính${colors.reset}`);
      const scanData = await scanComputer();
      
      // Hiển thị thông tin đã quét trong box đẹp
      console.log(`\n${colors.bright}${colors.white}Bước 3:${colors.reset} ${colors.cyan}Thông tin đã quét${colors.reset}\n`);
      printBox('THÔNG TIN HỆ THỐNG', 
        `Tên máy:     ${scanData.hostname}
Hãng:        ${scanData.manufacturer || 'N/A'}
Model:       ${scanData.model || 'N/A'}
Năm SX:      ${scanData.namSX || 'N/A'}
CPU:         ${scanData.cpu}
RAM:         ${scanData.ram}
Ổ cứng:      ${scanData.ssd}
VGA:         ${scanData.vga}
MAC:         ${scanData.mac}
IP:          ${scanData.ip}
OS:          ${scanData.os}
Serial:      ${scanData.serialNumber || 'N/A'}`
      );

      // Bước 3: Gửi lên server
      console.log(`\n${colors.bright}${colors.white}Bước 4:${colors.reset} ${colors.cyan}Gửi dữ liệu lên server${colors.reset}`);
      const result = await sendToServer(scanData, username);

      // Hiển thị kết quả thành công
      console.log(`\n${colors.green}${'═'.repeat(60)}${colors.reset}`);
      printSuccess('GỬI DỮ LIỆU THÀNH CÔNG!');
      console.log(`${colors.green}${'═'.repeat(60)}${colors.reset}\n`);
      
      if (result.data?.maMT) {
        printInfo('Máy tính ID', `${result.data.maMT}`, colors.green);
      }
      printInfo('Tên đăng nhập', username, colors.green);
      console.log(`\n${colors.dim}${colors.italic}   Bạn có thể quay lại trang web để xem thông tin máy tính của mình.${colors.reset}\n`);

      rl.question(`${colors.dim}Nhấn Enter để thoát...${colors.reset}`, () => {
        rl.close();
        process.exit(0);
      });

    } catch (error) {
      console.log(`\n${colors.red}${'═'.repeat(60)}${colors.reset}`);
      printError(error.message);
      console.log(`${colors.red}${'═'.repeat(60)}${colors.reset}\n`);

      rl.question(`${colors.dim}Nhấn Enter để thoát...${colors.reset}`, () => {
        rl.close();
        process.exit(1);
      });
    }
  });
}

// Chạy chương trình
main();
