import sqlite3 from 'sqlite3';
import fs from 'fs';

// Delete existing database if it exists
if (fs.existsSync('ctf.db')) {
  fs.unlinkSync('ctf.db');
}

const db = new sqlite3.Database('ctf.db', (err) => {
  if (err) {
    console.error('Database creation error:', err);
    process.exit(1);
  }

  // Create tables
  db.serialize(() => {
    db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT 0
      )
    `);

    db.run(`
      CREATE TABLE flags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        flag TEXT NOT NULL
      )
    `);

    // Insert sample data
    db.run('INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)', 
      ['admin', 'super_secret_password_123', 1]);
    
    db.run('INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)', 
      ['user', 'password123', 0]);

    db.run('INSERT INTO flags (flag) VALUES (?)', 
      ['CTF{SQL1_byp4ss_m4st3r_2024}'], 
      (err) => {
        if (err) {
          console.error('Data insertion error:', err);
          process.exit(1);
        }
        console.log('Database setup complete!');
        db.close();
      });
  });
});