const { DatabaseManager } = require('./db');

async function cleanDatabase() {
  try {
    const db = new DatabaseManager();
    await db.init();

    // Verificar total atual
    const total = await db.get('SELECT COUNT(*) as count FROM pets');
    console.log(`Pets atuais no banco: ${total.count}`);

    // Manter apenas os primeiros 52 pets (ordenados por ID)
    await db.run('DELETE FROM pets WHERE id > 52');
    console.log('Removidos pets com ID > 52');

    // Verificar resultado
    const remaining = await db.get('SELECT COUNT(*) as count FROM pets');
    console.log(`Pets restantes: ${remaining.count}`);

    // Verificar se têm imagens Cloudinary
    const withCloudinary = await db.all("SELECT COUNT(*) as count FROM pets WHERE foto_url LIKE '%cloudinary.com%'");
    console.log(`Pets com imagens Cloudinary: ${withCloudinary[0].count}`);

    await db.close();
    console.log('✅ Banco limpo com sucesso!');
  } catch (error) {
    console.error('Erro:', error);
  }
}

cleanDatabase();
