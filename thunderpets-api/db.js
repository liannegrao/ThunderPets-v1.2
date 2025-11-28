// ThunderPets API - Database Manager
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class DatabaseManager {
    constructor(dbPath) {
        this.db = null;
        // Caminho absoluto do banco
        this.dbPath = dbPath || path.join(__dirname, 'thunderpets.db');
    }

    init() {
        return new Promise((resolve, reject) => {
            // Garante que a pasta do banco existe
            const dir = path.dirname(this.dbPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) reject(err);
                else {
                    console.log('✅ SQLite conectado:', this.dbPath);
                    resolve();
                }
            });
        });
    }

    async initDatabase() {
        await this.init();

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);

        for (const statement of statements) {
            if (statement) await this.run(statement);
        }

        console.log('✅ Schema inicializado com dados de exemplo');
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    close() {
        if (this.db) {
            return new Promise((resolve) => {
                this.db.close(() => resolve());
            });
        }
    }
}

module.exports = { DatabaseManager };
