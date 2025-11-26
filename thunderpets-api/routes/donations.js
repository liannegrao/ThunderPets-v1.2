// ThunderPets API - Donations Routes (Cuidado Terapeutico)
const express = require('express');
const router = express.Router();

// Listar todas as solicitações de cuidado terapêutico
router.get('/', async (req, res) => {
    try {
        const donations = await global.dbManager.all('SELECT * FROM doacoes_terapeuticas ORDER BY criado_em DESC');
        res.json(donations);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar solicitações' });
    }
});

// Buscar solicitação específica
router.get('/:id', async (req, res) => {
    try {
        const donation = await global.dbManager.get('SELECT * FROM doacoes_terapeuticas WHERE id = ?', [req.params.id]);
        if (!donation) return res.status(404).json({ error: 'Solicitação não encontrada' });
        res.json(donation);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar solicitação' });
    }
});

// Nova solicitação de cuidado terapêutico
router.post('/', async (req, res) => {
    try {
        const { solicitante_nome, solicitante_email, solicitante_telefone,
                especie_desejada, motivacao, urgencia } = req.body;

        const result = await global.dbManager.run(`
            INSERT INTO doacoes_terapeuticas (solicitante_nome, solicitante_email, solicitante_telefone,
                                              especie_desejada, motivacao, urgencia)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [solicitante_nome, solicitante_email, solicitante_telefone,
             especie_desejada, motivacao, urgencia]);

        res.status(201).json({
            id: result.id,
            message: 'Solicitação de cuidado terapêutico registrada! Entraremos em contato em breve.'
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar solicitação' });
    }
});

// Atualizar status da solicitação
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['analise', 'aprovado', 'em_andamento', 'finalizado'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Status inválido' });
        }

        await global.dbManager.run('UPDATE doacoes_terapeuticas SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Status da solicitação atualizado!' });

    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar solicitação' });
    }
});

// Atribuir pet terapêutico a uma solicitação
router.post('/:id/atribuir-pet', async (req, res) => {
    try {
        const { pet_id } = req.body;

        // Verificar se pet existe e está disponível
        const pet = await global.dbManager.get('SELECT * FROM pets WHERE id = ? AND adotado = FALSE', [pet_id]);
        if (!pet) return res.status(404).json({ error: 'Pet não encontrado ou não disponível' });

        await global.dbManager.run(`
            UPDATE doacoes_terapeuticas
            SET pet_atribuido_id = ?, status = 'em_andamento', iniciado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [pet_id, req.params.id]);

        res.json({ message: 'Pet terapêutico atribuído com sucesso!' });

    } catch (error) {
        res.status(500).json({ error: 'Erro ao atribuir pet' });
    }
});

// Finalizar cuidado terapêutico
router.post('/:id/finalizar', async (req, res) => {
    try {
        await global.dbManager.run(`
            UPDATE doacoes_terapeuticas
            SET status = 'finalizado', finalizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [req.params.id]);

        res.json({ message: 'Cuidado terapêutico finalizado!' });

    } catch (error) {
        res.status(500).json({ error: 'Erro ao finalizar cuidado terapêutico' });
    }
});

module.exports = router;
