const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

require('dotenv').config();

console.log('🔍 Verificando CLOUDINARY_URL:', process.env.CLOUDINARY_URL ? 'Encontrada' : 'NÃO encontrada');

// Carrega automaticamente CLOUDINARY_URL (correto)
cloudinary.config();

console.log('✅ Cloudinary configurado com sucesso');


// MULTER STORAGE (para uploads futuros)
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'ThunderPets',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        public_id: (req, file) => Date.now() + '-' + file.originalname
    }
});

const upload = multer({ storage });


// LISTAR IMAGENS
const listarImagensThunderPets = async () => {
    try {
        let result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'ThunderPets/',  // <--- BUSCA A PASTA CERTA
            max_results: 100
        });

        if (result.resources.length === 0) {
            console.log('⚠️ Nenhuma imagem encontrada em ThunderPets/, buscando todas...');
            result = await cloudinary.api.resources({
                type: 'upload',
                max_results: 100
            });
        }

        return result.resources.map(r => ({
            public_id: r.public_id,
            url: r.secure_url,
            filename: r.public_id.split('/').pop()
        }));

    } catch (error) {
        console.error('❌ Erro ao listar imagens do Cloudinary:', error);
        return [];
    }
};

module.exports = { cloudinary, upload, listarImagensThunderPets };
