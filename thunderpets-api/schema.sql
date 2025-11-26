-- ThunderPets API - Schema SQL Simplificado

-- Pets disponíveis para adoção
CREATE TABLE IF NOT EXISTS pets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    especie TEXT NOT NULL, -- 'cachorro', 'gato'
    raca TEXT NOT NULL,
    idade_meses INTEGER,
    porte TEXT, -- 'pequeno', 'medio', 'grande'
    energia TEXT, -- 'calmo-caseiro', 'moderado', 'ativo-aventurado'
    personalidade TEXT,

    -- Scores terapêuticos (0-100)
    depressao_score INTEGER DEFAULT 50,
    ansiedade_score INTEGER DEFAULT 50,
    solidao_score INTEGER DEFAULT 50,

    beneficio_emocional TEXT,
    saude TEXT,
    cuidados TEXT,
    historia TEXT,
    casa_ideal TEXT,

    -- Imagens
    foto_url TEXT DEFAULT '/img/THUNDERPETS (4) (1).png',

    -- Status
    adotado BOOLEAN DEFAULT FALSE,
    aprovado BOOLEAN DEFAULT TRUE,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Usuários (simplificado para doadores e mediadores)
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role TEXT DEFAULT 'doador', -- 'mediador', 'doador', 'voluntario'
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Adoções (simplificado)
CREATE TABLE IF NOT EXISTS adocoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id INTEGER,
    adotante_nome TEXT NOT NULL,
    adotante_email TEXT,
    adotante_telefone TEXT,
    motivacao TEXT,
    status TEXT DEFAULT 'pendente', -- 'pendente', 'aprovado', 'finalizado'
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id)
);

-- Solicitações terapêuticas
CREATE TABLE IF NOT EXISTS doacoes_terapeuticas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    solicitante_nome TEXT NOT NULL,
    solicitante_email TEXT,
    solicitante_telefone TEXT,
    especie_desejada TEXT,
    motivacao TEXT,
    urgencia TEXT DEFAULT 'media',
    status TEXT DEFAULT 'analise',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Dados iniciais de pets
INSERT OR IGNORE INTO pets (nome, especie, raca, idade_meses, porte, energia, personalidade,
    depressao_score, ansiedade_score, solidao_score, beneficio_emocional,
    saude, cuidados, historia, casa_ideal, foto_url) VALUES

-- CACHORROS
('Biscoito', 'cachorro', 'Golden Retriever', 24, 'medio', 'ativo-aventurado',
    'Energético e brincalhão, perfeito para combater inércia depressiva', 85, 60, 80,
    'Energia & Alegria', 'Vacinado, esterilizado', 'Exercícios diários moderados',
    'Encontrado ainda filhote', 'Qualquer lar com disposição para caminhadas', '/img/cachorro-caramelo-Petlove.jpg'),

('Thor', 'cachorro', 'Labrador', 36, 'medio', 'moderado',
    'Sociável e carinhoso, excelente em combater isolamento social', 70, 50, 90,
    'Socialização & Conexão', 'Vacinas atualizadas', 'Alimentação balanceada',
    'Doado por tutores', 'Famílias ou pessoas sozinhas', '/img/raca-de-cachorro-preto.jpg'),

('Buddy', 'cachorro', 'Poodle', 60, 'pequeno', 'moderado',
    'Inteligente e fiel, perfeito para ansiedade', 50, 85, 60,
    'Apoio contra Ansiedade', 'Saudável, vacinado', 'Cuidados veterinários regulares',
    'Companion dog cuidado', 'Apartamentos ou casas pequenas', '/img/cachorro-_1750287085273-750x375.webp'),

('Luna', 'cachorro', 'Beagle', 48, 'pequeno', 'calmo-caseiro',
    'Dócil e carinhosa, ideal para insônia e ansiedade', 40, 95, 70,
    'Calma & Serenidade', 'Excelente saúde', 'Ração premium',
    'Encontrada abandonada', 'Ambientes calmos', '/img/pexels-photo-2247894.jpeg'),

-- GATOS
('Purês', 'gato', 'Vira-lata laranja', 24, 'medio', 'moderado',
    'Muito afetuoso, adora colo humano', 60, 80, 85,
    'Afeto & Companheirismo', 'Esterilizado, vacinas', 'Limpeza diária caixa areia',
    'Resgatado filhote', 'Qualquer ambiente doméstico', '/img/Design sem nome.jpg'),

('Sonecas', 'gato', 'Vira-lata cinza', 36, 'medio', 'calmo-caseiro',
    'Calma e observadora, prefere cantos aquecidos', 50, 90, 60,
    'Paz & Serenidade', 'Esterilizada, vacinas', 'Água sempre fresca',
    'Gata independente', 'Apartamentos silenciosos', '/img/patas.png'),

-- ⭐ PETS ADICIONAIS PARA DEMOSTRAÇÕES ⭐
('Max', 'cachorro', 'Bulldog Francês', 32, 'pequeno', 'moderado',
    'Alegre e infantil, ajuda a resgatar alegria perdida', 80, 70, 75,
    'Alegria Recuperada', 'Vacinas atualizadas, saúde ótima', 'Passeios diários curtos',
    'Bulldog resgatado de canil', 'Apartamentos acolhedores', '/img/Filhote-labrador-5.jpg'),

('Bella', 'cachorro', 'Border Collie', 28, 'medio', 'ativo-aventurado',
    'Alta energia, combate depressão através de atividades', 90, 40, 85,
    'Energia Mental', 'Excelente saúde física', 'Exercícios intensos diários',
    'Athlete Border Collie', 'Casas com espaço para atividades', '/img/homem-abracando-seu-pitbull-amigavel.jpg'),

('Charlie', 'cachorro', 'Shih Tzu', 54, 'pequeno', 'calmo-caseiro',
    'Muito pacífico, reduz ansiedade por presença constante', 45, 92, 75,
    'Serenidade Diária', 'Saúde perfeita', 'Cuidados especiais felpudos',
    'Companion perfeito', 'Qualquer lar amoroso', '/img/shihtzunsc.jpg'),

('Mimi', 'gato', 'Persa', 42, 'medio', 'calmo-caseiro',
    'Doce e calma, ajuda na ansiedade durante crises', 30, 95, 80,
    'Redução da Ansiedade', 'Cuidado veterinário regular', 'Escovação diária',
    'Gata de rua resgatada', 'Ambientes calmos, interiores', '/img/mulher-feliz-com-seu-cachorro-fofo_23-2148345885.avif');

-- Usuários iniciais
INSERT OR IGNORE INTO usuarios (nome, email, password_hash, role) VALUES
('Administrador', 'admin@thunderpets.com', '$2b$10$dummy.hash.for.admin', 'mediador'),
('Doador Exemplo', 'doador@email.com', '$2b$10$dummy.hash.for.doador', 'doador'),
('Voluntário Exemplo', 'voluntario@email.com', '$2b$10$dummy.hash.for.voluntario', 'voluntario');
