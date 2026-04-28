const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Create Documents Table
    db.run(`CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT,
        running_number INTEGER,
        doc_number TEXT,
        user_name TEXT,
        division TEXT,
        internal_external TEXT,
        doc_date TEXT,
        klasifikasi TEXT,
        perihal TEXT,
        signed_by TEXT,
        keterangan TEXT,
        link_document TEXT,
        judul_dokumen TEXT,
        template_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        division TEXT
    )`);

    // Create Divisions Table
    db.run(`CREATE TABLE IF NOT EXISTS divisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        code TEXT,
        klasifikasi TEXT
    )`);

    // Insert Default Data
    const users = [
        ['Andi', 'IT'],
        ['Budi', 'HRD'],
        ['Citra', 'Finance'],
        ['Dewi', 'Marketing']
    ];

    const divisions = [
        ['IT', 'IT', 'Internal'],
        ['HRD', 'HR', 'Internal'],
        ['Finance', 'FIN', 'External'],
        ['Marketing', 'MKT', 'External']
    ];

    users.forEach(user => {
        db.run(`INSERT INTO users (name, division) SELECT ?, ? WHERE NOT EXISTS(SELECT 1 FROM users WHERE name = ?)`, [user[0], user[1], user[0]]);
    });

    divisions.forEach(div => {
        db.run(`INSERT INTO divisions (name, code, klasifikasi) SELECT ?, ?, ? WHERE NOT EXISTS(SELECT 1 FROM divisions WHERE name = ?)`, [div[0], div[1], div[2], div[0]]);
    });

    console.log("Database initialized successfully");
});

db.close();
