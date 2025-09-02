#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up InspMail environment files...\n');

// Backend .env setup
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const backendEnvExamplePath = path.join(__dirname, 'backend', 'env.example');

if (!fs.existsSync(backendEnvPath)) {
  if (fs.existsSync(backendEnvExamplePath)) {
    fs.copyFileSync(backendEnvExamplePath, backendEnvPath);
    console.log('✅ Created backend/.env from env.example');
  } else {
    const backendEnvContent = `# InspMail Backend Environment Configuration
# Update the values with your actual configuration

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/inspmail

# IMAP Configuration
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-app-password
IMAP_TLS=true

# Optional: IMAP Folder Configuration
# IMAP_FOLDER=INBOX

# Optional: Monitoring Configuration
# IMAP_CHECK_INTERVAL=30000
# MAX_RECONNECT_ATTEMPTS=5`;
    
    fs.writeFileSync(backendEnvPath, backendEnvContent);
    console.log('✅ Created backend/.env with default configuration');
  }
} else {
  console.log('ℹ️  backend/.env already exists');
}

// Frontend .env.local setup
const frontendEnvPath = path.join(__dirname, 'frontend', '.env.local');
const frontendEnvExamplePath = path.join(__dirname, 'frontend', 'env.example');

if (!fs.existsSync(frontendEnvPath)) {
  if (fs.existsSync(frontendEnvExamplePath)) {
    fs.copyFileSync(frontendEnvExamplePath, frontendEnvPath);
    console.log('✅ Created frontend/.env.local from env.example');
  } else {
    const frontendEnvContent = `# InspMail Frontend Environment Configuration
# Update the values with your actual configuration

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Optional: Additional Frontend Configuration
# NEXT_PUBLIC_APP_NAME=InspMail
# NEXT_PUBLIC_APP_VERSION=1.0.0`;
    
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log('✅ Created frontend/.env.local with default configuration');
  }
} else {
  console.log('ℹ️  frontend/.env.local already exists');
}

console.log('\n🎉 Environment setup complete!');
console.log('\n📝 Next steps:');
console.log('1. Edit backend/.env with your IMAP and MongoDB credentials');
console.log('2. Edit frontend/.env.local if you need to change the API URL');
console.log('3. Run "npm run dev" to start the development servers');
console.log('\n⚠️  Important: Never commit .env files to version control!');
