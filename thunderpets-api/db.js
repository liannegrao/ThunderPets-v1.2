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

        // Verifica se a tabela 'pets' já existe
        const tableCheck = await this.get("SELECT name FROM sqlite_master WHERE type='table' AND name='pets'");

        if (!tableCheck) {
            // Se não existe, executa todo o schema.sql
            console.log('🐾 Criando e populando o banco de dados do zero...');
            const schemaPath = path.join(__dirname, 'schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            await new Promise((resolve, reject) => {
                this.db.exec(schema, (err) => {
                    if (err) return reject(err);
                    console.log('✅ Schema inicializado com dados de exemplo');
                    resolve();
                });
            });
        } else {
            // Se a tabela existe, apenas informa
            console.log('✅ O banco de dados já está populado.');
        }
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

// =============================================================
// 🚀 SEED AUTOMÁTICO: Criar 52 pets com imagens do Cloudinary
// =============================================================
async function seedPets(db) {
    console.log("📦 Criando 52 pets automaticamente...");

    const pets = [];

    // URLs reais você pode trocar depois
    const cloudinaryImages = [
        'https://res.cloudinary.com/demo/image/upload/v1699999999/thor.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1699999999/caramelo.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1699999999/luna.jpg'
    ];

    const genericDog = 'https://res.cloudinary.com/demo/image/upload/v1699999999/cachorro.jpg';
    const genericCat = 'https://res.cloudinary.com/demo/image/upload/v1699999999/gato.jpg';

    for (let i = 1; i <= 52; i++) {
        let foto_url;

        if (i === 1) foto_url = cloudinaryImages[0]; // Thor
        else if (i === 2) foto_url = cloudinaryImages[1]; // Caramelo
        else if (i === 3) foto_url = cloudinaryImages[2]; // Luna
        else foto_url = i % 2 === 0 ? genericDog : genericCat;

        pets.push({
            nome: `Pet ${i}`,
            especie: i % 2 === 0 ? 'Cachorro' : 'Gato',
            raca: i % 2 === 0 ? 'Vira-lata' : 'SRD',
            idade_meses: Math.floor(Math.random() * 180) + 1,
            porte: ['pequeno', 'medio', 'grande'][Math.floor(Math.random() * 3)],
            energia: ['calmo-caseiro', 'moderado', 'ativo-aventurado'][Math.floor(Math.random() * 3)],
            personalidade: ['amigavel', 'brincalhao', 'tranquilo', 'ativo'][Math.floor(Math.random() * 4)],
            descricao: `Descrição automática do Pet ${i}`,
            foto_url
        });
    }

    for (const pet of pets) {
        await db.run(
            `INSERT INTO pets
                (nome, especie, raca, idade_meses, porte, energia, personalidade, descricao, foto_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                pet.nome,
                pet.especie,
                pet.raca,
                pet.idade_meses,
                pet.porte,
                pet.energia,
                pet.personalidade,
                pet.descricao,
                pet.foto_url
            ]
        );
    }

    console.log("✅ Seed finalizado com sucesso!");
}

module.exports = { DatabaseManager, seedPets };
