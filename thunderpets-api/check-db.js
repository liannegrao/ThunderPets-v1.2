const { DatabaseManager } = require('./db');

async function checkPets() {
  try {
    const db = new DatabaseManager();
    await db.init();

    const pets = await db.all('SELECT id, nome, foto_url FROM pets LIMIT 10');

    console.log('Primeiros 10 pets no banco:');
    pets.forEach(pet => {
      const url = pet.foto_url;
      const isCloudinary = url && url.includes('cloudinary.com');
      console.log(`${isCloudinary ? '✅' : '❌'} ${pet.nome} (ID: ${pet.id}): ${url ? url.substring(0, 60) + '...' : 'SEM URL'}`);
    });

    await db.close();
  } catch (error) {
    console.error('Erro:', error);
  }
}

checkPets();
