const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { DatabaseManager } = require('./db');
const { listarImagensThunderPets } = require('./cloudinary');

const app = express();
const PORT = process.env.PORT || 3001;

// Segurança e CORS
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limit
app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 100 }));

// Rotas
const petRoutes = require('./routes/pets');
const adoptionRoutes = require('./routes/adoptions');
const donationRoutes = require('./routes/donations');
const mediatorRoutes = require('./routes/mediators');

app.use('/api/pets', petRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/doacoes', donationRoutes);
app.use('/api/mediadores', mediatorRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({
    status:'OK',
    timestamp: new Date().toISOString(),
    service:'ThunderPets API',
    version:'1.0.0'
}));

// 404
app.use('*', (req, res) => res.status(404).json({
    error: 'Route not found',
    message:`Cannot ${req.method} ${req.originalUrl}`
}));

// Error handling
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error:'Internal Server Error',
        message: process.env.NODE_ENV==='development'? err.message:'Something went wrong'
    });
});

async function startServer() {
    try {
        const fs = require('fs');
        const dbPath = path.join(__dirname, 'thunderpets.db');

        // =====================================================
        // 🧹 1. Apagar o banco sempre que iniciar o server (DESABILITADO TEMPORARIAMENTE)
        // =====================================================
        if (fs.existsSync(dbPath)) {
            // fs.unlinkSync(dbPath);
            console.log("💾 Banco existente mantido (imagens Cloudinary já sincronizadas).");
        } else {
            console.log("⚠️ Nenhum banco encontrado (ok, será criado).");
        }

        // =====================================================
        // 🛠 2. Criar banco novo
        // =====================================================
        const dbManager = new DatabaseManager();
        await dbManager.initDatabase();
        global.dbManager = dbManager;





        // =====================================================
        // 🚀 4. Iniciar API normalmente
        // =====================================================
        app.listen(PORT, () =>
            console.log(`🚀 ThunderPets API rodando na porta ${PORT}`)
        );

    } catch (error) {
        console.error('❌ Falha ao iniciar servidor:', error);
        process.exit(1);
    }
}

startServer();
