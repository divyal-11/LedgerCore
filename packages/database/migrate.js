const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from root .env if present
try {
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });
} catch (e) {
  // dotenv might not be installed, proceed with existing env variables
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: DATABASE_URL environment variable is not defined.');
  console.error('Please set it using: $env:DATABASE_URL="your-connection-string" (PowerShell) or export DATABASE_URL="..." (Bash)');
  process.exit(1);
}

const migrationsDir = path.join(__dirname, 'migrations');

const migrationFiles = [
  '001_create_enums.sql',
  '002_create_accounts.sql',
  '003_create_fiscal_periods.sql',
  '004_create_journal_entries.sql',
  '005_create_journal_lines.sql',
  '006_create_triggers.sql',
  '007_create_materialized_views.sql',
  '008_seeds.sql',
  '009_create_indexes.sql'
];

async function runMigrations() {
  console.log('Connecting to database...');
  const client = new Client({
    connectionString,
    ssl: connectionString.includes('sslmode=require') || connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Successfully connected to database.\n');

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      console.log(`Running migration: ${file}...`);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Migration file not found: ${filePath}`);
      }

      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Execute the migration SQL
      await client.query(sql);
      console.log(`✓ Migration ${file} completed successfully.`);
    }

    console.log('\nAll migrations executed successfully! 🎉');
  } catch (err) {
    console.error('\n❌ Migration failed!');
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
