require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function testConnection() {
  const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log('Connecting to:');
    console.log(`- Host: ${process.env.PG_HOST}`);
    console.log(`- Port: ${process.env.PG_PORT}`);
    console.log(`- Database: ${process.env.PG_DATABASE}`);
    console.log(`- User: ${process.env.PG_USER}`);
    
    const result = await pool.query('SELECT NOW()');
    console.log('Connection successful!');
    console.log('Current time from database:', result.rows[0].now);
  } catch (error) {
    console.error('Connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
  } finally {
    await pool.end();
    console.log('Connection closed');
  }
}

testConnection(); 