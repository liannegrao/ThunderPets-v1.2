require('dotenv').config();
const { listarImagensThunderPets } = require('./cloudinary');
const { DatabaseManager } = require('./db');

// Script para sincronizar pets com imagens do Cloudinary (60 pets)
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

    // Buscar todos os pets (60 pets)
    console.log('🐕 Buscando pets no banco...');
    const pets = await global.dbManager.all('SELECT id, nome, foto_url FROM pets ORDER BY id');
    console.log(`✅ Encontrados ${pets.length} pets no banco`);

    if (pets.length !== 60) {
      console.log(`⚠️  Avisos: Esperados 60 pets, encontrados ${pets.length}`);
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

    // Atribuir imagens para cachorros
    let indexCachorro = 0;
    for (const pet of cachorros) {
      let imagem;
      if (imagensCachorros.length > 0) {
        imagem = imagensCachorros[indexCachorro % imagensCachorros.length];
        indexCachorro++;
      } else if (imagensNeutras.length > 0) {
        imagem = imagensNeutras[indexCachorro % imagensNeutras.length];
        indexCachorro++;
      } else {
        // Fallback para qualquer imagem
        imagem = imagensCloudinary[indexCachorro % imagensCloudinary.length];
        indexCachorro++;
      }

      console.log(`🐕 ${pet.nome} (ID: ${pet.id}) → ${imagem.filename}`);

      await global.dbManager.run(
        'UPDATE pets SET foto_url = ? WHERE id = ?',
        [imagem.url, pet.id]
      );
    }

    // Atribuir imagens para gatos
    let indexGato = 0;
    for (const pet of gatos) {
      let imagem;
      if (imagensGatos.length > 0) {
        imagem = imagensGatos[indexGato % imagensGatos.length];
        indexGato++;
      } else if (imagensNeutras.length > 0) {
        imagem = imagensNeutras[indexGato % imagensNeutras.length];
        indexGato++;
      } else {
        // Fallback para qualquer imagem
        imagem = imagensCloudinary[indexGato % imagensCloudinary.length];
        indexGato++;
      }

      console.log(`🐱 ${pet.nome} (ID: ${pet.id}) → ${imagem.filename}`);

      await global.dbManager.run(
        'UPDATE pets SET foto_url = ? WHERE id = ?',
        [imagem.url, pet.id]
      );
    }

    console.log('✅ Sincronização concluída!');
    console.log(`📊 ${pets.length} pets sincronizados com ${imagensCloudinary.length} imagens Cloudinary`);

    // Verificar algumas atualizações
    const petsVerificacao = await global.dbManager.all('SELECT id, nome, foto_url FROM pets LIMIT 10');
    console.log('\n🔍 Verificação das primeiras sincronizações:');
    petsVerificacao.forEach(pet => {
      const url = pet.foto_url;
      const isCloudinary = url && url.includes('cloudinary.com');
      console.log(`${isCloudinary ? '✅' : '❌'} ${pet.nome}: ${url ? url.substring(0, 60) + '...' : 'SEM URL'}`);
    });

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  } finally {
    process.exit(0);
  }
}

// Executar o script
syncPetsWithCloudinaryImages();
