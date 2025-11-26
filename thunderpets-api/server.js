// ThunderPets API - Main Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { DatabaseManager } = require('./db');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/images', express.static(path.join(__dirname, 'uploads')));

// Import routes
const petRoutes = require('./routes/pets');
const adoptionRoutes = require('./routes/adoptions');
const donationRoutes = require('./routes/donations');
const mediatorRoutes = require('./routes/mediators');

// API routes
app.use('/api/pets', petRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/mediators', mediatorRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'ThunderPets API',
        version: '1.0.0'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Error handling
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
async function startServer() {
    try {
        // Initialize database
        const dbManager = new DatabaseManager();
        await dbManager.initDatabase();
        global.dbManager = dbManager;

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 ThunderPets API rodando na porta ${PORT}`);
            console.log(`📊 Endpoints:`);
            console.log(`   Health: GET /api/health`);
            console.log(`   Pets: GET/POST/PUT /api/pets/*`);
            console.log(`   Adoções: GET/POST /api/adoptions/*`);
            console.log(`   Doações: GET/POST /api/donations/*`);
            console.log(`   Mediadores: GET/POST /api/mediators/* (precisa x-api-key)`);
            console.log(`🔗 Angular frontend: http://localhost:4200`);
        });

    } catch (error) {
        console.error('❌ Falha ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nRecebido sinal de interrupção...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nRecebido sinal de terminação...');
    process.exit(0);
});

startServer();
