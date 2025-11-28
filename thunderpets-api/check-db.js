require('dotenv').config();
const { DatabaseManager } = require('./db');

async function checkDatabase() {
  try {
    console.log('🔍 Verificando pets no banco de dados...\n');

    const dbManager = new DatabaseManager();
    await dbManager.initDatabase();
    global.dbManager = dbManager;

    const pets = await global.dbManager.all('SELECT id, nome, foto_url FROM pets ORDER BY id');

    console.log(`📊 Total de pets encontrados: ${pets.length}\n`);

    console.log('🐕 Lista de pets e suas imagens:');
    console.log('='.repeat(60));

    pets.forEach(pet => {
      const isCloudinary = pet.foto_url && pet.foto_url.includes('cloudinary.com');
      const status = isCloudinary ? '☁️ CLOUDINARY' : '📁 LOCAL';
      console.log(`${pet.id}. ${pet.nome}`);
      console.log(`   ${status}: ${pet.foto_url || 'SEM IMAGEM'}`);
      console.log('');
    });

    // Verificar se há alguma URL específica
    const cloudinaryPets = pets.filter(pet => pet.foto_url && pet.foto_url.includes('cloudinary.com'));
    console.log(`📈 Estatísticas:`);
    console.log(`   - Pets com imagens Cloudinary: ${cloudinaryPets.length}`);
    console.log(`   - Pets com imagens locais: ${pets.length - cloudinaryPets.length}`);

  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error);
  } finally {
    process.exit(0);
  }
}

checkDatabase();
