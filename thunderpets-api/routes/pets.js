// ThunderPets API - Pets Routes
const express = require('express');
const router = express.Router();

require('dotenv').config();
const { upload, listarImagensThunderPets } = require('../cloudinary');

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

// Listar todos os pets (sempre inclui foto_url)
router.get('/', async (req, res) => {
    try {
        const pets = await global.dbManager.all(`
            SELECT id, nome, especie, raca, idade_meses, porte, energia,
                   personalidade, beneficio_emocional, saude, cuidados,
                   historia, casa_ideal, foto_url, adotado, aprovado,
                   criado_em, depressao_score, ansiedade_score, solidao_score
            FROM pets ORDER BY criado_em DESC
        `);
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

// Cadastrar novo pet (com foto_url do Cloudinary ou upload)
router.post('/', upload.single('foto'), async (req, res) => {
    try {
        const pet = req.body;

        // Prioriza foto_url do body, depois upload de arquivo
        let fotoUrl = pet.foto_url; // URL direta do Cloudinary
        if (!fotoUrl && req.file) {
            fotoUrl = req.file.path; // URL do arquivo enviado
        }

        const result = await global.dbManager.run(`
            INSERT INTO pets (nome, especie, raca, idade_meses, porte, energia,
                              personalidade, beneficio_emocional, saude, cuidados,
                              historia, casa_ideal, foto_url, vacinado,vermifugado,castrado,
                              necessidades_especiais, caracteristicas_positivas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [pet.nome, pet.especie, pet.raca, pet.idade_meses, pet.porte, pet.energia,
             pet.personalidade, pet.beneficio_emocional, pet.saude, pet.cuidados,
             pet.historia, pet.casa_ideal, fotoUrl, pet.vacinado, pet.vermifugado,
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

// Listar imagens disponíveis no Cloudinary
router.get('/images', async (req, res) => {
  try {
    const imagens = await listarImagensThunderPets();
    res.json(imagens);
  } catch (error) {
    console.error('Erro ao listar imagens:', error);
    res.status(500).json({ error: 'Erro ao listar imagens' });
  }
});

// Atualizar foto_url de um pet (para usar imagens do Cloudinary)
router.patch('/:id/image', async (req, res) => {
  try {
    const { foto_url } = req.body;
    if (!foto_url) {
      return res.status(400).json({ error: 'foto_url é obrigatório' });
    }

    const result = await global.dbManager.run(
      'UPDATE pets SET foto_url = ? WHERE id = ?',
      [foto_url, req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pet não encontrado' });
    }

    res.json({ message: 'Foto do pet atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar foto do pet:', error);
    res.status(500).json({ error: 'Erro ao atualizar foto do pet' });
  }
});

// Sincronizar TODOS os pets (60) com imagens do Cloudinary
router.post('/sync-cloudinary-images', async (req, res) => {
  try {
    console.log('🚀 Iniciando sincronização de 60 pets com imagens Cloudinary...');

    // Buscar todas as imagens do Cloudinary
    const imagensCloudinary = await listarImagensThunderPets();
    console.log(`✅ Encontradas ${imagensCloudinary.length} imagens no Cloudinary`);

    if (imagensCloudinary.length === 0) {
      return res.status(404).json({
        error: 'Nenhuma imagem encontrada no Cloudinary',
        message: 'Verifique se há imagens na pasta ThunderPets'
      });
    }

    // Buscar todos os pets (deve ser 60)
    const pets = await global.dbManager.all('SELECT id, nome, foto_url FROM pets ORDER BY id');
    console.log(`✅ Encontrados ${pets.length} pets no banco`);

    if (pets.length !== 60) {
      console.log(`⚠️  Sistema configurado para 60 pets, encontrados ${pets.length}`);
    }

    // Sincronizar cada pet com uma imagem do Cloudinary (distribuição uniforme)
    let imageIndex = 0;
    let syncedCount = 0;

    for (const pet of pets) {
      const imagem = imagensCloudinary[imageIndex % imagensCloudinary.length];

      await global.dbManager.run(
        'UPDATE pets SET foto_url = ? WHERE id = ?',
        [imagem.url, pet.id]
      );

      syncedCount++;
      imageIndex++;
    }

    console.log(`✅ ${syncedCount} pets sincronizados com sucesso!`);

    res.json({
      message: '60 pets sincronizados com imagens do Cloudinary!',
      stats: {
        petsSynced: syncedCount,
        cloudinaryImages: imagensCloudinary.length,
        expectedPets: 60,
        actualPets: pets.length,
        imagesPerPet: Math.ceil(imagensCloudinary.length / pets.length)
      }
    });

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    res.status(500).json({
      error: 'Erro ao sincronizar imagens dos pets',
      details: error.message
    });
  }
});

// Upload de imagem (para compatibilidade futura)
router.post('/upload', upload.single('foto'), (req, res) => {
  if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
  }
  res.json({ url: req.file.path });
});

module.exports = router;
