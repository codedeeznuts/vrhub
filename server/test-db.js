const db = require('./config/db');

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const connectionTest = await db.query('SELECT NOW()');
    console.log('Database connection successful:', connectionTest.rows[0]);
    
    // Test videos table
    console.log('Testing videos table...');
    const videosTest = await db.query('SELECT COUNT(*) FROM videos');
    console.log('Videos count:', videosTest.rows[0].count);
    
    // Get a sample of videos
    const videosResult = await db.query('SELECT id, title FROM videos LIMIT 3');
    console.log('Sample videos:', videosResult.rows);
    
    console.log('All tests passed successfully!');
  } catch (err) {
    console.error('Database test failed:', err.message);
    console.error(err.stack);
  } finally {
    // Close the connection pool
    db.pool.end();
  }
}

testDatabaseConnection(); 