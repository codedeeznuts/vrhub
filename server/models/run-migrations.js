const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure consistent order
    
    // Run each migration in a transaction
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      await db.query('BEGIN');
      try {
        await db.query(sql);
        await db.query('COMMIT');
        console.log(`Migration ${file} completed successfully`);
      } catch (err) {
        await db.query('ROLLBACK');
        console.error(`Error running migration ${file}:`, err);
        throw err;
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = runMigrations; 