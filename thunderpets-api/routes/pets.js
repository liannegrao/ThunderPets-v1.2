// ThunderPets API - Pets Routes
const express = require('express');
const router = express.Router();

// Buscar pets terapeuticos compativeis
router.get('/matching', async (req, res) => {
    try {
        const { situacao, energia, disponibilidade } = req.query;

        let sql = `SELECT * FROM pets WHERE adotado = FALSE AND aprovado = TRUE`;
        const params = [];

        // Filtros baseados no matching terapeutico
        const filters = [];
        if (situacao) {
            if (situacao === 'depressao') filters.push('depressao_score >= 70');
            if (situacao === 'ansiedade') filters.push('ansiedade_score >= 70');
            if (situacao === 'solidao') filters.push('solidao_score >= 70');
        }

        if (energia) filters.push('energia = ?');
        if (filters.length > 0) sql += ' AND ' + filters.join(' AND ');
        if (energia) params.push(energia);

        const pets = await global.dbManager.all(sql, params);
        res.json(pets.slice(0, 6)); // Max 6 resultados

    } catch (error) {
        console.error('Erro no matching:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

// Listar todos os pets
router.get('/', async (req, res) => {
    try {
        const pets = await global.dbManager.all('SELECT * FROM pets ORDER BY criado_em DESC');
        res.json(pets);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar pets' });
    }
});

// Buscar pet especifico
router.get('/:id', async (req, res) => {
    try {
        const pet = await global.dbManager.get('SELECT * FROM pets WHERE id = ?', [req.params.id]);
        if (!pet) return res.status(404).json({ error: 'Pet não encontrado' });
        res.json(pet);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar pet' });
    }
});

// Cadastrar novo pet
router.post('/', async (req, res) => {
    try {
        const pet = req.body;
        const result = await global.dbManager.run(`
            INSERT INTO pets (nome, especie, raca, idade_meses, porte, energia,
                              personalidade, beneficio_emocional, saude, cuidados,
                              historia, casa_ideal, foto_url, vacinado,vermifugado,castrado,
                              necessidades_especiais, caracteristicas_positivas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [pet.nome, pet.especie, pet.raca, pet.idade_meses, pet.porte, pet.energia,
             pet.personalidade, pet.beneficio_emocional, pet.saude, pet.cuidados,
             pet.historia, pet.casa_ideal, pet.foto_url, pet.vacinado, pet.vermifugado,
             pet.castrado, pet.necessidades_especiais, pet.caracteristicas_positivas]
        );
        res.status(201).json({ id: result.id, message: 'Pet cadastrado!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar pet' });
    }
});

// Atualizar pet
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        const fields = Object.keys(updates).filter(key => updates[key] !== undefined);
        const values = fields.map(key => updates[key]);

        if (fields.length === 0) return res.status(400).json({ error: 'Nenhuma atualização fornecida' });

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        values.push(req.params.id);

        await global.dbManager.run(`UPDATE pets SET ${setClause} WHERE id = ?`, values);
        res.json({ message: 'Pet atualizado!' });

    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar pet' });
    }
});

// Remover pet
router.delete('/:id', async (req, res) => {
    try {
        await global.dbManager.run('DELETE FROM pets WHERE id = ?', [req.params.id]);
        res.json({ message: 'Pet removido!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover pet' });
    }
});

module.exports = router;
