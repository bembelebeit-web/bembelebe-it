const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'dev_secret_key';

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());

// База данных
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error('Ошибка БД:', err.message);
    else console.log('SQLite подключена');
});

// Создаём таблицы
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        avatar TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // Создаём админа (логин: admin, пароль: admin)
    const hash = bcrypt.hashSync('admin', 10);
    db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', ?, 'admin')`, [hash]);
});

// API: Регистрация
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Заполни поля' });

    const hash = bcrypt.hashSync(password, 10);
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hash], function(err) {
        if (err) return res.status(400).json({ error: 'Ник занят' });
        res.json({ message: 'Успешно' });
    });
});

// API: Вход
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Неверные данные' });
        }
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY);
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, avatar: user.avatar } });
    });
});

// API: Получение тем
app.get('/api/topics', (req, res) => {
    db.all(`SELECT topics.*, users.username, users.role, users.avatar FROM topics JOIN users ON topics.user_id = users.id ORDER BY topics.id DESC`, [], (err, rows) => {
        res.json(rows || []);
    });
});

// API: Создание темы
app.post('/api/topics', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'Нет доступа' });
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const { title, content } = req.body;
        db.run(`INSERT INTO topics (title, content, user_id) VALUES (?, ?, ?)`, [title, content, decoded.id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
    } catch {
        res.status(403).json({ error: 'Неверный токен' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});