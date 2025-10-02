#!/usr/bin/env node

/**
 * Verification Script for Refactored Structure
 * Run: node verify-structure.js
 */

const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log('\n🔍 Des2 Library - Structure Verification\n');
console.log('=========================================\n');

const requiredFiles = [
  { path: 'server.js', description: 'Main entry point' },
  { path: 'src/app.js', description: 'Express application' },
  { path: 'src/config/database.js', description: 'Database configuration' },
  { path: 'src/config/environment.js', description: 'Environment config' },
  { path: 'src/config/cloudinary.js', description: 'Cloudinary config' },
  { path: 'src/config/passport.js', description: 'Passport config' },
  { path: 'src/middleware/auth.js', description: 'Auth middleware' },
  { path: 'src/middleware/rateLimiter.js', description: 'Rate limiter' },
  { path: 'src/routes/auth.js', description: 'Auth routes' },
  { path: 'src/routes/books.js', description: 'Books routes' },
  { path: 'src/routes/reviews.js', description: 'Reviews routes' },
  { path: 'src/routes/users.js', description: 'Users routes' },
  { path: 'src/routes/recommendations.js', description: 'Recommendations' },
  { path: 'src/routes/newsletter.js', description: 'Newsletter routes' },
  { path: 'src/routes/download.js', description: 'Download routes' },
  { path: 'src/routes/chatbot.js', description: 'Chatbot routes' },
  { path: 'src/services/emailService.js', description: 'Email service' },
  { path: 'src/services/databaseService.js', description: 'Database service' },
  { path: 'src/utils/helpers.js', description: 'Utility functions' },
];

const documentationFiles = [
  'REFACTORING_GUIDE.md',
  'REFACTORING_SUMMARY.md',
  'ARCHITECTURE.md',
  'VERIFICATION_CHECKLIST.md',
  'REFACTORING_COMPLETE.md'
];

let allFilesExist = true;
let missingCount = 0;

console.log('📁 Checking core files:\n');

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file.path);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    const stats = fs.statSync(fullPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`${GREEN}✓${RESET} ${file.path.padEnd(45)} (${sizeKB} KB) - ${file.description}`);
  } else {
    console.log(`${RED}✗${RESET} ${file.path.padEnd(45)} - ${file.description} ${RED}MISSING${RESET}`);
    allFilesExist = false;
    missingCount++;
  }
});

console.log('\n📚 Checking documentation:\n');

documentationFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    console.log(`${GREEN}✓${RESET} ${file}`);
  } else {
    console.log(`${YELLOW}!${RESET} ${file} ${YELLOW}(optional)${RESET}`);
  }
});

console.log('\n📦 Checking directories:\n');

const requiredDirs = [
  'src',
  'src/config',
  'src/middleware',
  'src/routes',
  'src/services',
  'src/utils'
];

requiredDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    const files = fs.readdirSync(fullPath);
    console.log(`${GREEN}✓${RESET} ${dir.padEnd(25)} (${files.length} files)`);
  } else {
    console.log(`${RED}✗${RESET} ${dir.padEnd(25)} ${RED}MISSING${RESET}`);
    allFilesExist = false;
  }
});

console.log('\n⚙️  Checking configuration:\n');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log(`${GREEN}✓${RESET} .env file exists`);
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'SENDGRID_API_KEY',
    'CLOUDINARY_CLOUD_NAME'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`  ${GREEN}✓${RESET} ${varName}`);
    } else {
      console.log(`  ${YELLOW}!${RESET} ${varName} ${YELLOW}(not found)${RESET}`);
    }
  });
} else {
  console.log(`${RED}✗${RESET} .env file missing`);
  allFilesExist = false;
}

console.log('\n=========================================\n');

if (allFilesExist) {
  console.log(`${GREEN}✅ All required files are present!${RESET}\n`);
  console.log('Next steps:');
  console.log('1. Verify your .env file has all required variables');
  console.log('2. Run: npm install');
  console.log('3. Start server: npm start');
  console.log('4. Test endpoints using VERIFICATION_CHECKLIST.md\n');
} else {
  console.log(`${RED}❌ ${missingCount} required file(s) missing!${RESET}\n`);
  console.log('Please ensure all files are created before starting the server.\n');
  process.exit(1);
}

console.log('📖 Documentation available:');
console.log('   - REFACTORING_GUIDE.md - Complete guide');
console.log('   - REFACTORING_SUMMARY.md - Quick start');
console.log('   - ARCHITECTURE.md - System overview');
console.log('   - VERIFICATION_CHECKLIST.md - Testing checklist\n');
