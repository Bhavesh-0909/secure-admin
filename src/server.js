import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const db = new sqlite3.Database('ctf.db');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// Load SQL payloads from sql.txt
const sqlPayloads = fs.readFileSync('src/sql.txt', 'utf-8').split('\n').map(line => line.trim()).filter(line => line);

// Function to check for SQL injection payloads
const isPayloadMatched = (input) => {
  return sqlPayloads.some(payload => input.includes(payload));
};

// Vulnerable login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Check for SQL injection payloads
  if (isPayloadMatched(username) || isPayloadMatched(password)) {
    return res.render('login', { error: 'Invalid input detected.' });
  }

  // Vulnerable SQL query - DO NOT USE IN PRODUCTION!
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  db.get(query, (err, user) => {
    if (err) {
      console.error('Login error:', err);
      return res.render('login', { error: 'An error occurred' });
    }

    if (user) {
      if (user.is_admin) {
        // Get flag for admin users
        db.get('SELECT flag FROM flags LIMIT 1', (err, flag) => {
          if (err) {
            console.error('Flag error:', err);
            return res.render('login', { error: 'An error occurred' });
          }
          res.render('admin', { flag: flag.flag });
        });
      } else {
        res.render('user', { username: user.username });
      }
    } else {
      res.render('login', { error: 'Invalid credentials' });
    }
  });
});

app.get('/', (req, res) => {
  res.render('login', { error: null });
});

app.listen(3000, () => {
  console.log('CTF challenge running on http://localhost:3000');
});