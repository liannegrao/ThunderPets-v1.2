// ThunderPets API - Adoptions Routes
const express = require('express');
const router = express.Router();

// Listar todas as adoções
router.get('/', async (req, res) => {
    try {
        const adocoes = await global.dbManager.all(`
            SELECT a.*, p.nome as pet_nome, p.foto_url
            FROM adocoes a
            LEFT JOIN pets p ON a.pet_id = p.id
            ORDER BY a.criado_em DESC
        `);
        res.json(adocoes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar adoções' });
    }
});

// Buscar adoção específica
router.get('/:id', async (req, res) => {
    try {
        const adocao = await global.dbManager.get(`
            SELECT a.*, p.nome as pet_nome, p.foto_url
            FROM adocoes a
            LEFT JOIN pets p ON a.pet_id = p.id
            WHERE a.id = ?
        `, [req.params.id]);

        if (!adocao) return res.status(404).json({ error: 'Adoção não encontrada' });
        res.json(adocao);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar adoção' });
    }
});

// Solicitar adoção
router.post('/', async (req, res) => {
    try {
        const { pet_id, adotante_nome, adotante_email, adotante_telefone, motivacao } = req.body;

        // Verificar se pet existe e está disponível
        const pet = await global.dbManager.get('SELECT * FROM pets WHERE id = ? AND adotado = FALSE', [pet_id]);
        if (!pet) return res.status(404).json({ error: 'Pet não encontrado ou já adotado' });

        const result = await global.dbManager.run(`
            INSERT INTO adocoes (pet_id, adotante_nome, adotante_email, adotante_telefone, motivacao)
            VALUES (?, ?, ?, ?, ?)
        `, [pet_id, adotante_nome, adotante_email, adotante_telefone, motivacao]);

        res.status(201).json({
            id: result.id,
            message: 'Solicitação de adoção registrada! Entraremos em contato em breve.'
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao solicitar adoção' });
    }
});

// Atualizar status da adoção (mediador)
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pendente', 'analise', 'aprovado', 'finalizado', 'cancelado', 'rejeitado'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Status inválido' });
        }

        await global.dbManager.run('UPDATE adocoes SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Status da adoção atualizado!' });

    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar adoção' });
    }
});

// Finalizar adoção (marcar pet como adotado)
router.post('/:id/finalizar', async (req, res) => {
    try {
        // Marcar adoção como finalizada
        await global.dbManager.run('UPDATE adocoes SET status = ?, finalizado_em = CURRENT_TIMESTAMP WHERE id = ?', ['finalizado', req.params.id]);

        // Marcar pet como adotado
        const adocao = await global.dbManager.get('SELECT pet_id FROM adocoes WHERE id = ?', [req.params.id]);
        await global.dbManager.run('UPDATE pets SET adotado = TRUE WHERE id = ?', [adocao.pet_id]);

        res.json({ message: 'Adoção finalizada com sucesso!' });

    } catch (error) {
        res.status(500).json({ error: 'Erro ao finalizar adoção' });
    }
});

module.exports = router;
