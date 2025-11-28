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

    // Atualizar cada pet com uma imagem do Cloudinary (distribuição uniforme)
    let imageIndex = 0;
    const imagesPerPet = Math.ceil(imagensCloudinary.length / pets.length);
    console.log(`📊 ${imagensCloudinary.length} imagens para ${pets.length} pets (${imagesPerPet} imagens por pet em média)`);

    for (const pet of pets) {
      const imagem = imagensCloudinary[imageIndex % imagensCloudinary.length];

      console.log(`🔄 ${pet.nome} (ID: ${pet.id}) → ${imagem.filename}`);

      await global.dbManager.run(
        'UPDATE pets SET foto_url = ? WHERE id = ?',
        [imagem.url, pet.id]
      );

      imageIndex++;
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
