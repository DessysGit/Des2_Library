/**
 * Supabase Connection Diagnostic Tool
 * 
 * This script tests different connection methods and settings
 * to identify the best configuration for your Supabase database.
 */

require('dotenv').config();
const { Pool } = require('pg');

console.log('🔍 Supabase Connection Diagnostic Tool');
console.log('=' .repeat(60));

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

console.log('✓ DATABASE_URL found');
console.log(`  URL: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);
console.log('');

// Test different configurations
const configs = [
  {
    name: 'Config 1: SSL with rejectUnauthorized false',
    config: {
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    }
  },
  {
    name: 'Config 2: SSL with rejectUnauthorized false + keepAlive',
    config: {
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    }
  },
  {
    name: 'Config 3: SSL with rejectUnauthorized false + increased timeouts',
    config: {
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 60000,
      statement_timeout: 60000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    }
  }
];

async function testConfig(name, config) {
  console.log(`\n📋 Testing: ${name}`);
  console.log('-'.repeat(60));
  
  const pool = new Pool(config);
  let client;
  
  try {
    // Test 1: Basic connection
    console.log('  Test 1: Basic connection...');
    client = await pool.connect();
    console.log('  ✓ Connection successful');
    
    // Test 2: Simple query
    console.log('  Test 2: Simple query (SELECT NOW())...');
    const result1 = await client.query('SELECT NOW()');
    console.log('  ✓ Simple query successful');
    console.log(`    Server time: ${result1.rows[0].now}`);
    
    // Test 3: Check if tables exist
    console.log('  Test 3: Checking existing tables...');
    const result2 = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log(`  ✓ Found ${result2.rows.length} tables:`);
    result2.rows.forEach(row => {
      console.log(`    - ${row.table_name}`);
    });
    
    // Test 4: CREATE TABLE (most problematic operation)
    console.log('  Test 4: CREATE TABLE statement...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_connection_table (
        id SERIAL PRIMARY KEY,
        test_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✓ CREATE TABLE successful');
    
    // Test 5: Cleanup
    console.log('  Test 5: Cleanup (DROP TABLE)...');
    await client.query('DROP TABLE IF EXISTS test_connection_table');
    console.log('  ✓ Cleanup successful');
    
    client.release();
    await pool.end();
    
    console.log(`\n✅ ${name} - ALL TESTS PASSED`);
    return true;
    
  } catch (err) {
    if (client) {
      try { client.release(); } catch (e) { /* ignore */ }
    }
    try { await pool.end(); } catch (e) { /* ignore */ }
    
    console.error(`\n❌ ${name} - FAILED`);
    console.error(`  Error: ${err.message}`);
    console.error(`  Code: ${err.code || 'N/A'}`);
    return false;
  }
}

async function runDiagnostics() {
  console.log('\n🚀 Starting diagnostics...\n');
  
  const results = [];
  
  for (const { name, config } of configs) {
    const success = await testConfig(name, config);
    results.push({ name, success });
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n');
  console.log('=' .repeat(60));
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('=' .repeat(60));
  
  results.forEach(({ name, success }) => {
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${name}`);
  });
  
  const successCount = results.filter(r => r.success).length;
  
  console.log('\n');
  if (successCount === 0) {
    console.log('❌ All configurations failed!');
    console.log('\n💡 Possible solutions:');
    console.log('   1. Check if your Supabase project is active');
    console.log('   2. Verify your DATABASE_URL is correct');
    console.log('   3. Check Supabase dashboard for connection limits');
    console.log('   4. Try using the direct connection string (not pooler)');
    console.log('   5. Check your network/firewall settings');
  } else if (successCount === configs.length) {
    console.log('✅ All configurations passed!');
    console.log('\n💡 Recommendation: Use Config 3 for best reliability');
  } else {
    console.log(`⚠️  ${successCount}/${configs.length} configurations passed`);
    console.log('\n💡 Use the configuration that passed all tests');
  }
  
  console.log('\n');
}

// Run diagnostics
runDiagnostics()
  .then(() => {
    console.log('✨ Diagnostics complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Diagnostic error:', err);
    process.exit(1);
  });
