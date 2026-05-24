require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function main(){
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASS || '';
  const database = process.env.DB_NAME || 'nextjs_app';

  // Connect without database to create it if needed
  const conn = await mysql.createConnection({ host, user, password });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  console.log('Ensured database', database);
  await conn.end();

  // Now connect to the DB and create tables + seed
  const pool = await mysql.createPool({ host, user, password, database, waitForConnections:true, connectionLimit:5 });

  // Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200),
      email VARCHAR(200),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200),
      description TEXT,
      quantity INT DEFAULT 0,
      price DECIMAL(10,2) DEFAULT 0.00
    ) ENGINE=InnoDB;
  `);

  // Insert sample data
  const [existingUsers] = await pool.query('SELECT id FROM users LIMIT 1');
  if (existingUsers.length === 0) {
    const [r] = await pool.query('INSERT INTO users (name, email) VALUES (?, ?)', ['Alice Example', 'alice@example.com']);
    const userId = r.insertId;
    await pool.query('INSERT INTO chats (user_id, message) VALUES (?, ?), (?, ?)', [userId, 'Hello, this is a seeded chat!', userId, 'Another seeded message']);
    await pool.query('INSERT INTO items (name, description, quantity, price) VALUES ?',[ [ ['Widget A','A basic widget',10,9.99], ['Gadget B','An advanced gadget',5,29.95], ['Thingamajig','Useful tool',2,199.99] ] ]);
    console.log('Inserted sample users, chats, and items');
  } else {
    console.log('Data already present, skipping inserts');
  }

  await pool.end();
  console.log('Done.');
}

main().catch(err=>{ console.error(err); process.exit(1); });
