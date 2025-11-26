// ThunderPets API - Database Manager
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

class DatabaseManager {
    constructor(dbPath = './thunderpets.db') {
        this.db = null;
        this.dbPath = dbPath;
    }

    init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('✅ SQLite conectado: ThunderPets');
                    resolve();
                }
            });
        });
    }

    async initDatabase() {
        await this.init();

        // Execute schema
        const schemaPath = './schema.sql';
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await this.run(schema);
        console.log('✅ Schema inicializado com dados de exemplo');
    }

    get() { return this.db; }

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

// Função para inicialização do banco
async function initDatabase() {
    try {
        const dbManager = new DatabaseManager();
        await dbManager.initDatabase();
        console.log('✅ Banco de dados inicializado com sucesso!');
    } catch (error) {
        console.error('❌ Falha ao inicializar banco:', error);
        throw error;
    }
}

module.exports.initDatabase = initDatabase;
