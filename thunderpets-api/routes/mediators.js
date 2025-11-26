// ThunderPets API - Mediators Routes (Ações Administrativas)
const express = require('express');
const router = express.Router();

// Middleware para verificar API key
const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(403).json({ error: 'API key inválida' });
    }
    next();
};

// Aplicar middleware em todas as rotas
router.use(verifyApiKey);

// Estatísticas gerais do sistema
router.get('/stats', async (req, res) => {
    try {
        const stats = {
            total_pets: await global.dbManager.get('SELECT COUNT(*) as count FROM pets'),
            pets_disponiveis: await global.dbManager.get('SELECT COUNT(*) as count FROM pets WHERE adotado = FALSE'),
            pets_adotados: await global.dbManager.get('SELECT COUNT(*) as count FROM pets WHERE adotado = TRUE'),
            total_adocoes: await global.dbManager.get('SELECT COUNT(*) as count FROM adocoes'),
            adocoes_pendentes: await global.dbManager.get('SELECT COUNT(*) as count FROM adocoes WHERE status = "pendente"'),
            total_doacoes: await global.dbManager.get('SELECT COUNT(*) as count FROM doacoes_terapeuticas'),
            active_users: await global.dbManager.get('SELECT COUNT(*) as count FROM usuarios WHERE ativo = TRUE')
        };

        const result = {
            total_pets: stats.total_pets.count,
            pets_disponiveis: stats.pets_disponiveis.count,
            pets_adotados: stats.pets_adotados.count,
            total_adocoes: stats.total_adocoes.count,
            adocoes_pendentes: stats.adocoes_pendentes.count,
            total_doacoes: stats.total_doacoes.count,
            active_users: stats.active_users.count
        };

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao obter estatísticas' });
    }
});

// Aprovar pet para adoção
router.post('/approve/:petId', async (req, res) => {
    try {
        const petId = req.params.petId;

        // Verificar se pet existe
        const pet = await global.dbManager.get('SELECT * FROM pets WHERE id = ?', [petId]);
        if (!pet) return res.status(404).json({ error: 'Pet não encontrado' });

        await global.dbManager.run('UPDATE pets SET aprovado = TRUE WHERE id = ?', [petId]);
        res.json({ message: `Pet ${pet.nome} aprovado para adoção!` });

    } catch (error) {
        res.status(500).json({ error: 'Erro ao aprovar pet' });
    }
});

// Rejeitar pet
router.post('/reject/:petId', async (req, res) => {
    try {
        const petId = req.params.petId;

        // Verificar se pet existe
        const pet = await global.dbManager.get('SELECT * FROM pets WHERE id = ?', [petId]);
        if (!pet) return res.status(404).json({ error: 'Pet não encontrado' });

        // Remover pet do sistema
        await global.dbManager.run('DELETE FROM pets WHERE id = ?', [petId]);
        res.json({ message: `Pet ${pet.nome} rejeitado e removido do sistema.` });

    } catch (error) {
        res.status(500).json({ error: 'Erro ao rejeitar pet' });
    }
});

// Marcar pet como adotado
router.post('/adopt/:petId', async (req, res) => {
    try {
        const petId = req.params.petId;

        // Verificar se pet existe e não está adotado
        const pet = await global.dbManager.get('SELECT * FROM pets WHERE id = ? AND adotado = FALSE', [petId]);
        if (!pet) return res.status(404).json({ error: 'Pet não encontrado ou já adotado' });

        await global.dbManager.run('UPDATE pets SET adotado = TRUE WHERE id = ?', [petId]);
        res.json({ message: `Pet ${pet.nome} marcado como adotado!` });

    } catch (error) {
        res.status(500).json({ error: 'Erro ao marcar como adotado' });
    }
});

module.exports = router;
