/**
 * Supabase Connection Mode Guide
 * 
 * This script helps you understand which Supabase connection string to use
 * and provides instructions for getting the correct one.
 */

require('dotenv').config();

console.log('🔍 Supabase Connection Mode Guide');
console.log('=' .repeat(70));
console.log('');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

// Parse the connection string
const urlMatch = DATABASE_URL.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

if (!urlMatch) {
  console.error('❌ Invalid DATABASE_URL format');
  process.exit(1);
}

const [, user, password, host, port, database] = urlMatch;

console.log('📋 Current Connection Details:');
console.log(`   User: ${user}`);
console.log(`   Host: ${host}`);
console.log(`   Port: ${port}`);
console.log(`   Database: ${database}`);
console.log('');

// Detect connection type
let connectionType = 'Unknown';
let isPooler = false;

if (host.includes('.pooler.')) {
  isPooler = true;
  if (port === '5432') {
    connectionType = 'Session Mode Pooler (Port 5432)';
  } else if (port === '6543') {
    connectionType = 'Transaction Mode Pooler (Port 6543)';
  } else {
    connectionType = 'Pooler (Custom Port)';
  }
} else {
  connectionType = 'Direct Connection';
}

console.log(`🔌 Connection Type: ${connectionType}`);
console.log('');

// Provide recommendations
console.log('💡 Recommendations:');
console.log('=' .repeat(70));

if (isPooler && port === '5432') {
  console.log('✅ You are using Session Mode Pooler (RECOMMENDED for DDL operations)');
  console.log('');
  console.log('   This mode is suitable for:');
  console.log('   • CREATE TABLE, ALTER TABLE, DROP TABLE statements');
  console.log('   • Long-running queries');
  console.log('   • Transactions that span multiple queries');
  console.log('');
  console.log('   If you\'re still getting ECONNRESET errors:');
  console.log('   1. Run: node diagnose-connection.js');
  console.log('   2. Check Supabase dashboard for connection limits');
  console.log('   3. Ensure your Supabase project is active (not paused)');
} else if (isPooler && port === '6543') {
  console.log('⚠️  You are using Transaction Mode Pooler (NOT IDEAL for this app)');
  console.log('');
  console.log('   Transaction mode has limitations:');
  console.log('   ❌ Cannot run CREATE TABLE statements reliably');
  console.log('   ❌ Limited to single queries or simple transactions');
  console.log('   ❌ May cause ECONNRESET errors with DDL operations');
  console.log('');
  console.log('   👉 SWITCH TO SESSION MODE:');
  console.log('');
  console.log('   In Supabase Dashboard:');
  console.log('   1. Go to Project Settings > Database');
  console.log('   2. Look for "Connection string" section');
  console.log('   3. Select "Session mode" tab');
  console.log('   4. Copy the connection string (it uses port 5432)');
  console.log('   5. Update DATABASE_URL in your .env file');
  console.log('');
  console.log('   Your new DATABASE_URL should look like:');
  console.log(`   postgresql://${user}:YOUR_PASSWORD@${host.replace('.pooler.', '.pooler.')}:5432/${database}`);
} else if (!isPooler) {
  console.log('✅ You are using Direct Connection');
  console.log('');
  console.log('   Direct connections work well but:');
  console.log('   • Are limited in number (max 60-100 connections)');
  console.log('   • Don\'t scale as well as pooler connections');
  console.log('');
  console.log('   💡 Consider switching to Session Mode Pooler for production:');
  console.log('   1. Go to Supabase Dashboard > Project Settings > Database');
  console.log('   2. Find "Connection pooling" section');
  console.log('   3. Copy the "Session mode" connection string');
  console.log('   4. Update DATABASE_URL in .env');
}

console.log('');
console.log('=' .repeat(70));
console.log('📚 Additional Resources:');
console.log('');
console.log('   Supabase Connection Pooling:');
console.log('   https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler');
console.log('');
console.log('   Node.js pg library:');
console.log('   https://node-postgres.com/');
console.log('');
console.log('=' .repeat(70));
console.log('');
console.log('📝 Next Steps:');
console.log('');
console.log('   1. Run diagnostics: node diagnose-connection.js');
console.log('   2. If diagnostics fail, update your DATABASE_URL as shown above');
console.log('   3. Start your server: node server.js');
console.log('');
