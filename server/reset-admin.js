const bcrypt = require('bcrypt');
const db = require('./config/db');

async function resetAdminPassword() {
  try {
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Update the admin user's password
    const result = await db.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING *',
      [hashedPassword, 'admin@vrhub.com']
    );
    
    if (result.rows.length > 0) {
      console.log('Admin password reset successfully!');
      console.log('You can now login with:');
      console.log('Email: admin@vrhub.com');
      console.log('Password: admin123');
    } else {
      console.log('Admin user not found. Creating a new admin user...');
      
      // Create a new admin user
      const newAdminResult = await db.query(
        'INSERT INTO users (email, password, name, is_admin, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        ['admin@vrhub.com', hashedPassword, 'Admin User', true, true]
      );
      
      if (newAdminResult.rows.length > 0) {
        console.log('New admin user created successfully!');
        console.log('You can now login with:');
        console.log('Email: admin@vrhub.com');
        console.log('Password: admin123');
      } else {
        console.log('Failed to create admin user.');
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

resetAdminPassword(); 