const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

require('dotenv').config();
console.log('🔍 Verificando CLOUDINARY_URL:', process.env.CLOUDINARY_URL ? 'Encontrada' : 'NÃO encontrada');

if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
    console.log('✅ Cloudinary configurado com sucesso');
} else {
    console.error('❌ CLOUDINARY_URL não encontrada no arquivo .env');
}

// Storage Multer para uploads futuros
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'ThunderPets',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        public_id: (req, file) => Date.now() + '-' + file.originalname
    }
});

const upload = multer({ storage });

const listarImagensThunderPets = async () => {
    try {
        let result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'ThunderPets/',
            max_results: 100
        });

        if (result.resources.length === 0) {
            console.log('Nenhuma imagem encontrada na pasta ThunderPets, listando todas...');
            result = await cloudinary.api.resources({ type: 'upload', max_results: 100 });
        }

        return result.resources.map(r => ({
            public_id: r.public_id,
            url: r.secure_url,
            filename: r.public_id.split('/').pop()
        }));
    } catch (error) {
        console.error('Erro ao listar imagens do Cloudinary:', error);
        return [];
    }
};

module.exports = { cloudinary, upload, listarImagensThunderPets };
