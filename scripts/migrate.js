#!/usr/bin/env node

/**
 * Database Migration Script
 * This script runs complete_schema.sql to set up the entire database
 * Run this after drop-all.js or on a fresh database
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Try to load .env file if dotenv is available
try {
  require('dotenv').config();
} catch (_e) {
  // dotenv not installed - environment variables must be set manually
}

// Validate required environment variables
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbName = process.env.DB_NAME || 'alinetwork';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD;

if (!dbPassword || dbPassword.trim() === '') {
  console.error('❌ Error: DB_PASSWORD environment variable is required!');
  console.error('💡 Please create a .env file with your database credentials.');
  console.error('💡 You can copy env.md to .env and update the values.');
  console.error('');
  console.error('Required variables:');
  console.error('  DB_HOST=localhost');
  console.error('  DB_PORT=5432');
  console.error('  DB_NAME=alinetwork');
  console.error('  DB_USER=postgres');
  console.error('  DB_PASSWORD=your_password');
  process.exit(1);
}

const pool = new Pool({
  host: dbHost,
  port: dbPort,
  database: dbName,
  user: dbUser,
  password: dbPassword,
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migration...');
    console.log(`📊 Database: ${process.env.DB_NAME || 'alinetwork'}`);
    console.log(`🏠 Host: ${process.env.DB_HOST || 'localhost'}`);
    
    // Read complete_schema.sql file
    const sqlFile = path.join(__dirname, '../src/schemas/complete_schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 Reading complete_schema.sql...');
    
    // Execute SQL
    console.log('⚡ Creating tables, functions, triggers, and policies...');
    await client.query(sql);
    
    console.log('✅ Database migration completed successfully!');
    console.log('💡 All tables, functions, triggers, and policies have been created.');
    
  } catch (error) {
    console.error('❌ Error during database migration:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { migrate };
