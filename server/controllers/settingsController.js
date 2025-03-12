const db = require('../config/db');

// Default settings
const DEFAULT_SETTINGS = {
  siteName: 'VR Hub',
  siteDescription: 'The best platform for VR videos',
  contactEmail: 'contact@vrhub.com',
  maxUploadSize: 1024,
  allowRegistration: true,
  maintenanceMode: false,
  analyticsId: '',
  featuredVideosCount: 6,
  defaultPageSize: 12
};

// Get all settings
exports.getSettings = async (req, res) => {
  try {
    // Check if settings table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'settings'
      )
    `);
    
    // If settings table doesn't exist, create it
    if (!tableCheck.rows[0].exists) {
      await createSettingsTable();
    }
    
    // Get all settings
    const result = await db.query('SELECT * FROM settings');
    
    // Convert settings to object
    const settings = {};
    result.rows.forEach(row => {
      // Convert value based on type
      let value = row.value;
      if (row.type === 'boolean') {
        value = value === 'true';
      } else if (row.type === 'number') {
        value = parseFloat(value);
      }
      settings[row.key] = value;
    });
    
    // Merge with default settings for any missing values
    const mergedSettings = { ...DEFAULT_SETTINGS, ...settings };
    
    res.json(mergedSettings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    // Check if settings table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'settings'
      )
    `);
    
    // If settings table doesn't exist, create it
    if (!tableCheck.rows[0].exists) {
      await createSettingsTable();
    }
    
    // Start transaction
    await db.query('BEGIN');
    
    // Update each setting
    for (const [key, value] of Object.entries(req.body)) {
      // Skip if not in default settings
      if (!(key in DEFAULT_SETTINGS)) continue;
      
      // Determine value type
      let type = typeof value;
      if (type === 'number') {
        type = 'number';
      } else if (type === 'boolean') {
        type = 'boolean';
      } else {
        type = 'string';
      }
      
      // Convert value to string for storage
      const stringValue = String(value);
      
      // Check if setting exists
      const settingCheck = await db.query('SELECT * FROM settings WHERE key = $1', [key]);
      
      if (settingCheck.rows.length > 0) {
        // Update existing setting
        await db.query(
          'UPDATE settings SET value = $1, type = $2 WHERE key = $3',
          [stringValue, type, key]
        );
      } else {
        // Insert new setting
        await db.query(
          'INSERT INTO settings (key, value, type) VALUES ($1, $2, $3)',
          [key, stringValue, type]
        );
      }
    }
    
    // Commit transaction
    await db.query('COMMIT');
    
    // Get updated settings
    const result = await db.query('SELECT * FROM settings');
    
    // Convert settings to object
    const settings = {};
    result.rows.forEach(row => {
      // Convert value based on type
      let value = row.value;
      if (row.type === 'boolean') {
        value = value === 'true';
      } else if (row.type === 'number') {
        value = parseFloat(value);
      }
      settings[row.key] = value;
    });
    
    // Merge with default settings for any missing values
    const mergedSettings = { ...DEFAULT_SETTINGS, ...settings };
    
    res.json(mergedSettings);
  } catch (err) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Helper function to create settings table
async function createSettingsTable() {
  try {
    // Create settings table
    await db.query(`
      CREATE TABLE settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        type VARCHAR(20) NOT NULL
      )
    `);
    
    // Insert default settings
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      // Determine value type
      let type = typeof value;
      if (type === 'number') {
        type = 'number';
      } else if (type === 'boolean') {
        type = 'boolean';
      } else {
        type = 'string';
      }
      
      // Convert value to string for storage
      const stringValue = String(value);
      
      // Insert setting
      await db.query(
        'INSERT INTO settings (key, value, type) VALUES ($1, $2, $3)',
        [key, stringValue, type]
      );
    }
    
    console.log('Settings table created and initialized with defaults');
  } catch (err) {
    console.error('Error creating settings table:', err);
    throw err;
  }
} 