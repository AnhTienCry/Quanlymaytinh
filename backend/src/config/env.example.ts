/**
 * Environment Configuration Example
 * Copy this content and create a .env file in the backend root directory
 * 
 * Required environment variables:
 */

/*
# Server Configuration
PORT=3000
NODE_ENV=development

# Database - SQL Server
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=your_password_here
DB_NAME=QuanLyMayTinhDB

# JWT Configuration
JWT_SECRET=quanlymaytinh-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Admin Default Credentials (created on first run)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
*/

export const ENV_TEMPLATE = `
# Server Configuration
PORT=3000
NODE_ENV=development

# Database - SQL Server
DB_SERVER=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=your_password_here
DB_NAME=QuanLyMayTinhDB

# JWT Configuration
JWT_SECRET=quanlymaytinh-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
`;



