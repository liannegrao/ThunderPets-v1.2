
require('dotenv').config();
const { listarImagensThunderPets } = require('./cloudinary');
const { DatabaseManager } = require('./db');

// Script para sincronizar pets com imagens do Cloudinary (97 pets)
async function syncPetsWithCloudinaryImages() {
  try {
    console.log('🚀 Iniciando sincronização de imagens dos pets...');

    // Inicializar banco de dados
    const dbManager = new DatabaseManager();
    await dbManager.initDatabase();
    global.dbManager = dbManager;

    // Buscar todas as imagens do Cloudinary
    console.log('📸 Buscando imagens no Cloudinary...');
    const imagensCloudinary = await listarImagensThunderPets();
    console.log(`✅ Encontradas ${imagensCloudinary.length} imagens no Cloudinary`);

    if (imagensCloudinary.length === 0) {
      console.log('❌ Nenhuma imagem encontrada no Cloudinary. Verifique a pasta ThunderPets.');
      return;
    }

    // Buscar todos os pets (97 pets)
    console.log('🐕 Buscando pets no banco...');
    const pets = await global.dbManager.all('SELECT id, nome, especie, foto_url FROM pets ORDER BY id');
    console.log(`✅ Encontrados ${pets.length} pets no banco`);

    if (pets.length !== 97) {
      console.log(`⚠️  Avisos: Esperados 97 pets, encontrados ${pets.length}`);
    }

    // 🔍 CLASSIFICAR IMAGENS POR TIPO (Cachorro vs Gato)
    const imagensCachorros = [];
    const imagensGatos = [];
    const imagensNeutras = [];

    // Palavras-chave para identificar imagens
    const palavrasCachorro = ['dog', 'cachorro', 'cao', 'puppy', 'pet', 'animal', 'hound', 'retriever', 'labrador', 'golden', 'poodle', 'bulldog', 'beagle', 'husky', 'pitbull', 'pug', 'shih', 'yorkshire', 'boxer', 'rottweiler', 'dachshund', 'schnauzer'];
    const palavrasGato = ['cat', 'gato', 'kitten', 'feline', 'persian', 'siamese', 'angora', 'ragdoll', 'sphynx', 'bengal', 'manx', 'russian', 'scottish', 'fold', 'burmese', 'tonkinese', 'korat', 'ashera'];

    for (const imagem of imagensCloudinary) {
      const filename = imagem.filename.toLowerCase();
      const publicId = imagem.public_id.toLowerCase();

      // Verificar se contém palavras de cachorro
      const isCachorro = palavrasCachorro.some(palavra =>
        filename.includes(palavra) || publicId.includes(palavra)
      );

      // Verificar se contém palavras de gato
      const isGato = palavrasGato.some(palavra =>
        filename.includes(palavra) || publicId.includes(palavra)
      );

      if (isCachorro && !isGato) {
        imagensCachorros.push(imagem);
      } else if (isGato && !isCachorro) {
        imagensGatos.push(imagem);
      } else {
        imagensNeutras.push(imagem);
      }
    }

    console.log(`🐕 ${imagensCachorros.length} imagens de cachorros encontradas`);
    console.log(`🐱 ${imagensGatos.length} imagens de gatos encontradas`);
    console.log(`🎨 ${imagensNeutras.length} imagens neutras encontradas`);

    // 🔄 ATRIBUIR IMAGENS POR ESPÉCIE
    const cachorros = pets.filter(pet => pet.especie === 'cachorro');
    const gatos = pets.filter(pet => pet.especie === 'gato');

    console.log(`🐕 ${cachorros.length} pets cachorros para sincronizar`);
    console.log(`🐱 ${gatos.length} pets gatos para sincronizar`);

    // Usar cópias para não modificar os arrays originais
    let poolCachorros = [...imagensCachorros];
    let poolGatos = [...imagensGatos];
    let poolNeutras = [...imagensNeutras];
    let poolTodas = [...imagensCloudinary];

    const atribuirImagem = (pet, poolEspecifica, poolFallback, poolGeral) => {
      let imagem;
      if (poolEspecifica.length > 0) {
        const index = Math.floor(Math.random() * poolEspecifica.length);
        imagem = poolEspecifica.splice(index, 1)[0];
      } else if (poolFallback.length > 0) {
        const index = Math.floor(Math.random() * poolFallback.length);
        imagem = poolFallback.splice(index, 1)[0];
      } else if (poolGeral.length > 0) {
        const index = Math.floor(Math.random() * poolGeral.length);
        imagem = poolGeral.splice(index, 1)[0];
      }

      if (imagem) {
        // Remover a imagem da pool geral para não ser usada novamente
        const geralIndex = poolTodas.findIndex(img => img.public_id === imagem.public_id);
        if (geralIndex > -1) {
          poolTodas.splice(geralIndex, 1);
        }
        return imagem;
      }
      return null;
    };

    for (const pet of cachorros) {
      const imagem = atribuirImagem(pet, poolCachorros, poolNeutras, poolTodas);
      if (imagem) {
        console.log(`🐕 ${pet.nome} (ID: ${pet.id}) → ${imagem.filename}`);
        await global.dbManager.run(
          'UPDATE pets SET foto_url = ? WHERE id = ?',
          [imagem.url, pet.id]
        );
      } else {
        console.log(`⚠️  Nenhuma imagem disponível para o cachorro ${pet.nome}`);
      }
    }

    for (const pet of gatos) {
      const imagem = atribuirImagem(pet, poolGatos, poolNeutras, poolTodas);
      if (imagem) {
        console.log(`🐱 ${pet.nome} (ID: ${pet.id}) → ${imagem.filename}`);
        await global.dbManager.run(
          'UPDATE pets SET foto_url = ? WHERE id = ?',
          [imagem.url, pet.id]
        );
      } else {
        console.log(`⚠️  Nenhuma imagem disponível para o gato ${pet.nome}`);
      }
    }

    console.log(`
📊 ${pets.length} pets sincronizados com ${imagensCloudinary.length} imagens Cloudinary`);
    console.log('✅ Sincronização concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao sincronizar pets com imagens do Cloudinary:', error);
  } finally {
    // Fechar a conexão com o banco de dados
    if (global.dbManager) {
      await global.dbManager.close();
      console.log('🚪 Conexão com o banco de dados fechada.');
    }
  }
}

// Executar o script
syncPetsWithCloudinaryImages();
