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

-- Dados iniciais de pets (60 pets para adoção terapêutica)
INSERT OR IGNORE INTO pets (nome, especie, raca, idade_meses, porte, energia, personalidade,
    depressao_score, ansiedade_score, solidao_score, beneficio_emocional,
    saude, cuidados, historia, casa_ideal, foto_url) VALUES

-- CACHORROS ORIGINAIS E VARIAÇÕES
('Caramelo', 'cachorro', 'Golden Retriever', 24, 'medio', 'ativo-aventurado',
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

('Max', 'cachorro', 'Golden Retriever', 30, 'medio', 'ativo-aventurado',
    'Cheio de energia, ajuda a combater a tristeza', 82, 55, 75,
    'Energia & Alegria', 'Vacinado, esterilizado', 'Passeios diários',
    'Resgatado de abrigo', 'Lares ativos', '/img/cachorro-caramelo-Petlove.jpg'),

('Bella', 'cachorro', 'Labrador', 42, 'medio', 'moderado',
    'Muito carinhosa, perfeita para combater solidão', 65, 45, 95,
    'Conexão Emocional', 'Vacinas em dia', 'Alimentação balanceada',
    'Doada por família', 'Qualquer lar amoroso', '/img/raca-de-cachorro-preto.jpg'),

('Charlie', 'cachorro', 'Poodle', 54, 'pequeno', 'moderado',
    'Esperto e leal, ótimo para ansiedade', 55, 88, 65,
    'Apoio Emocional', 'Saúde perfeita', 'Cuidados veterinários',
    'Cão de companhia', 'Apartamentos', '/img/cachorro-_1750287085273-750x375.webp'),

('Daisy', 'cachorro', 'Beagle', 36, 'pequeno', 'calmo-caseiro',
    'Doce e calma, ideal para serenidade', 45, 92, 75,
    'Paz Interior', 'Excelente saúde', 'Ração premium',
    'Encontrada perdida', 'Ambientes tranquilos', '/img/pexels-photo-2247894.jpeg'),

('Rex', 'cachorro', 'Pastor Alemão', 28, 'grande', 'ativo-aventurado',
    'Protetor e energizado, combate inércia', 80, 65, 70,
    'Proteção & Energia', 'Vacinado', 'Exercícios intensos',
    'Doado por criador', 'Lares com espaço', '/img/homem-abracando-seu-pitbull-amigavel.jpg'),

('Molly', 'cachorro', 'Bulldog', 40, 'medio', 'calmo-caseiro',
    'Preguiçosa e amorosa, perfeita para relaxamento', 35, 98, 80,
    'Relaxamento', 'Saúde boa', 'Cuidados básicos',
    'Resgatada', 'Lares calmos', '/img/raca-de-cachorro_2.jpg'),

-- GATOS ORIGINAIS E VARIAÇÕES
('Luna', 'gato', 'Vira-lata laranja', 24, 'medio', 'moderado',
    'Muito afetuoso, adora colo humano', 60, 80, 85,
    'Afeto & Companheirismo', 'Esterilizado, vacinas', 'Limpeza diária caixa areia',
    'Resgatado filhote', 'Qualquer ambiente doméstico', '/img/Design sem nome.jpg'),

('Sonecas', 'gato', 'Vira-lata cinza', 36, 'medio', 'calmo-caseiro',
    'Calma e observadora, prefere cantos aquecidos', 50, 90, 60,
    'Paz & Serenidade', 'Esterilizada, vacinas', 'Água sempre fresca',
    'Gata independente', 'Apartamentos silenciosos', '/img/patas.png'),

('Whiskers', 'gato', 'Siamês', 18, 'pequeno', 'moderado',
    'Muito sociável e falante', 55, 75, 88,
    'Companheirismo', 'Vacinado', 'Caixa areia limpa',
    'Doado por família', 'Lares ativos', '/img/Design sem nome.jpg'),

('Miau', 'gato', 'Persa', 48, 'medio', 'calmo-caseiro',
    'Fofo e preguiçoso, ama aconchego', 45, 95, 55,
    'Conforto', 'Pelagem cuidada', 'Escovação diária',
    'Criado em casa', 'Ambientes quentes', '/img/patas.png'),

('Shadow', 'gato', 'Bombaim', 30, 'medio', 'moderado',
    'Misterioso e independente', 52, 78, 82,
    'Presença Calma', 'Saúde boa', 'Cuidados básicos',
    'Encontrado na rua', 'Lares tranquilos', '/img/Design sem nome.jpg'),

('Nala', 'gato', 'Maine Coon', 42, 'grande', 'ativo-aventurado',
    'Grande e brincalhona', 65, 70, 78,
    'Diversão & Alegria', 'Vacinada', 'Espaço para brincar',
    'Resgatada', 'Casas espaçosas', '/img/patas.png'),

-- MAIS CACHORROS (continuando até 60)
('Toby', 'cachorro', 'Shih Tzu', 32, 'pequeno', 'moderado',
    'Fofo e carinhoso', 48, 82, 85,
    'Afeto Diário', 'Pelo cuidado', 'Banho regular',
    'Companion', 'Apartamentos', '/img/shihtzunsc.jpg'),

('Coco', 'cachorro', 'Yorkshire', 26, 'pequeno', 'ativo-aventurado',
    'Pequeno mas energético', 75, 70, 80,
    'Energia Compacta', 'Saúde boa', 'Cuidados especiais',
    'Doado', 'Lares pequenos', '/img/shihtzunsc.jpg'),

('Zeus', 'cachorro', 'Rottweiler', 38, 'grande', 'moderado',
    'Forte mas gentil', 60, 55, 85,
    'Força & Lealdade', 'Vacinado', 'Treinamento básico',
    'Guarda', 'Lares seguros', '/img/homem-abracando-seu-pitbull-amigavel.jpg'),

('Lola', 'cachorro', 'Dachshund', 44, 'pequeno', 'calmo-caseiro',
    'Comprida e preguiçosa', 42, 96, 72,
    'Sossego', 'Coluna saudável', 'Cuidado especial',
    'Idosa', 'Lares calmos', '/img/raca-de-cachorro_2.jpg'),

('Bruno', 'cachorro', 'Boxer', 34, 'medio', 'ativo-aventurado',
    'Brincalhão e forte', 78, 58, 76,
    'Atividade & Alegria', 'Vacinado', 'Exercícios',
    'Jovem', 'Lares ativos', '/img/raca-de-cachorro-preto.jpg'),

('Sasha', 'cachorro', 'Husky', 22, 'medio', 'ativo-aventurado',
    'Aventureira e energética', 88, 52, 68,
    'Aventura', 'Vacinada', 'Muito exercício',
    'Jovem', 'Lares com jardim', '/img/cachorro-caramelo-Petlove.jpg'),

('Rocky', 'cachorro', 'Pit Bull', 46, 'medio', 'moderado',
    'Carinhoso apesar da fama', 55, 60, 92,
    'Amor Incondicional', 'Reabilitado', 'Socialização',
    'Resgatado', 'Lares amorosos', '/img/homem-abracando-seu-pitbull-amigavel.jpg'),

('Maggie', 'cachorro', 'Cocker Spaniel', 50, 'medio', 'calmo-caseiro',
    'Doce e calma', 38, 94, 78,
    'Serenidade', 'Ouvido cuidado', 'Limpeza regular',
    'Idosa', 'Lares tranquilos', '/img/pexels-photo-2247894.jpeg'),

('Bear', 'cachorro', 'Chow Chow', 28, 'medio', 'calmo-caseiro',
    'Independente e leal', 50, 85, 70,
    'Presença Calma', 'Pelagem especial', 'Cuidado com pelo',
    'Jovem', 'Lares calmos', '/img/raca-de-cachorro-preto.jpg'),

('Bailey', 'cachorro', 'Basset Hound', 52, 'medio', 'calmo-caseiro',
    'Preguiçoso e fofo', 40, 98, 75,
    'Relaxamento', 'Ouvido cuidado', 'Cama confortável',
    'Adulto', 'Lares tranquilos', '/img/raca-de-cachorro_2.jpg'),

-- MAIS GATOS (continuando até 60)
('Tiger', 'gato', 'Tabby', 20, 'medio', 'ativo-aventurado',
    'Brincalhão e curioso', 70, 65, 80,
    'Diversão', 'Vacinado', 'Brinquedos',
    'Filhote', 'Lares ativos', '/img/Design sem nome.jpg'),

('Princess', 'gato', 'Angorá', 38, 'medio', 'calmo-caseiro',
    'Elegante e calma', 48, 92, 68,
    'Elegância', 'Pelagem longa', 'Escovação',
    'Adulto', 'Ambientes limpos', '/img/patas.png'),

('Smokey', 'gato', 'Russian Blue', 26, 'medio', 'moderado',
    'Misterioso e inteligente', 58, 76, 82,
    'Inteligência Calma', 'Saúde boa', 'Cuidados básicos',
    'Jovem', 'Lares tranquilos', '/img/Design sem nome.jpg'),

('Misty', 'gato', 'Ragdoll', 32, 'medio', 'calmo-caseiro',
    'Mole e amorosa', 45, 95, 85,
    'Conforto', 'Pelagem especial', 'Cuidado com pelo',
    'Adulto', 'Lares carinhosos', '/img/patas.png'),

('Bandit', 'gato', 'Manx', 44, 'medio', 'moderado',
    'Saltitante e brincalhão', 62, 72, 78,
    'Diversão', 'Sem rabo', 'Cuidados normais',
    'Adulto', 'Qualquer lar', '/img/Design sem nome.jpg'),

('Cleo', 'gato', 'Egípcio', 16, 'pequeno', 'ativo-aventurado',
    'Curiosa e aventureira', 75, 68, 76,
    'Aventura', 'Vacinada', 'Exploração segura',
    'Jovem', 'Lares seguros', '/img/patas.png'),

('Oscar', 'gato', 'British Shorthair', 40, 'medio', 'calmo-caseiro',
    'Gordo e preguiçoso', 35, 97, 72,
    'Conforto', 'Peso controlado', 'Alimentação balanceada',
    'Adulto', 'Lares calmos', '/img/Design sem nome.jpg'),

('Ziggy', 'gato', 'Scottish Fold', 24, 'medio', 'moderado',
    'Orelhas dobradas, fofo', 55, 80, 85,
    'Fofura', 'Ouvido cuidado', 'Cuidados especiais',
    'Jovem', 'Lares amorosos', '/img/patas.png'),

('Jasmine', 'gato', 'Bengal', 28, 'medio', 'ativo-aventurado',
    'Selvagem domesticada', 72, 60, 74,
    'Aventura Controlada', 'Vacinada', 'Espaço para correr',
    'Jovem', 'Lares espaçosos', '/img/Design sem nome.jpg'),

('Midnight', 'gato', 'Oriental', 36, 'medio', 'moderado',
    'Esbelta e elegante', 52, 78, 80,
    'Elegância', 'Saúde boa', 'Cuidados básicos',
    'Adulto', 'Lares elegantes', '/img/patas.png'),

-- ÚLTIMOS PETS PARA CHEGAR A 60
('Jack', 'cachorro', 'Jack Russell', 30, 'pequeno', 'ativo-aventurado',
    'Hiperativo e inteligente', 85, 50, 65,
    'Energia Inteligente', 'Vacinado', 'Muito exercício mental',
    'Jovem', 'Lares ativos', '/img/shihtzunsc.jpg'),

('Ginger', 'cachorro', 'Golden Retriever', 18, 'medio', 'ativo-aventurado',
    'Filhote energética', 90, 45, 75,
    'Alegria Juvenil', 'Vacinada', 'Socialização',
    'Filhote', 'Lares pacientes', '/img/cachorro-caramelo-Petlove.jpg'),

('Sam', 'cachorro', 'Schnauzer', 48, 'pequeno', 'moderado',
    'Esperto e alerta', 55, 75, 78,
    'Inteligência', 'Pelo cuidado', 'Banho regular',
    'Adulto', 'Lares atentos', '/img/cachorro-_1750287085273-750x375.webp'),

('Ruby', 'cachorro', 'Pug', 36, 'pequeno', 'calmo-caseiro',
    'Fofo e ronronante', 40, 96, 82,
    'Fofura', 'Respiração cuidada', 'Cuidados especiais',
    'Adulto', 'Lares calmos', '/img/raca-de-cachorro_2.jpg'),

('Hunter', 'cachorro', 'Weimaraner', 24, 'medio', 'ativo-aventurado',
    'Caçador urbano', 82, 55, 70,
    'Aventura', 'Vacinado', 'Muito exercício',
    'Jovem', 'Lares ativos', '/img/cachorro-caramelo-Petlove.jpg'),

('Sophie', 'cachorro', 'Cavalier King', 42, 'pequeno', 'calmo-caseiro',
    'Realeza calma', 38, 94, 88,
    'Nobreza Calma', 'Coração saudável', 'Cuidados veterinários',
    'Adulto', 'Lares nobres', '/img/pexels-photo-2247894.jpeg'),

('Zoe', 'gato', 'Chartreux', 34, 'medio', 'moderado',
    'Gato sorriso', 58, 76, 84,
    'Alegria Silenciosa', 'Saúde boa', 'Cuidados básicos',
    'Adulto', 'Lares felizes', '/img/Design sem nome.jpg'),

('Leo', 'gato', 'Leão da Montanha', 22, 'medio', 'ativo-aventurado',
    'Grande e brincalhão', 68, 62, 76,
    'Diversão Grande', 'Vacinado', 'Espaço grande',
    'Jovem', 'Casas espaçosas', '/img/patas.png'),

('Lily', 'gato', 'Snowshoe', 40, 'medio', 'calmo-caseiro',
    'Patas brancas, calma', 48, 90, 78,
    'Calma Elegante', 'Saúde boa', 'Cuidados normais',
    'Adulto', 'Lares elegantes', '/img/patas.png'),

('Simba', 'gato', 'Abissínio', 26, 'medio', 'ativo-aventurado',
    'Atlético e curioso', 72, 58, 74,
    'Aventura Felina', 'Vacinado', 'Exploração',
    'Jovem', 'Lares aventureiros', '/img/Design sem nome.jpg'),

('Oliver', 'gato', 'American Bobtail', 38, 'medio', 'moderado',
    'Rabo curto, brincalhão', 60, 72, 82,
    'Diversão Bobtail', 'Saúde boa', 'Cuidados básicos',
    'Adulto', 'Lares divertidos', '/img/patas.png'),

('Chloe', 'gato', 'Burmês', 30, 'medio', 'moderado',
    'Carinhosa e falante', 55, 80, 86,
    'Afeto Falante', 'Saúde boa', 'Atenção',
    'Adulto', 'Lares atentos', '/img/Design sem nome.jpg'),

('Milo', 'gato', 'Sphynx', 20, 'medio', 'ativo-aventurado',
    'Sem pelo, energético', 78, 65, 70,
    'Energia Única', 'Pele cuidada', 'Proteção solar',
    'Jovem', 'Lares cuidadosos', '/img/patas.png'),

('Bella', 'gato', 'Himalaio', 44, 'medio', 'calmo-caseiro',
    'Peludo e preguiçoso', 42, 95, 76,
    'Conforto Peludo', 'Pelagem cuidada', 'Escovação',
    'Adulto', 'Lares quentes', '/img/patas.png'),

('Charlie', 'gato', 'Singapura', 16, 'pequeno', 'ativo-aventurado',
    'Pequeno aventureiro', 80, 55, 72,
    'Aventura Pequena', 'Vacinado', 'Exploração segura',
    'Jovem', 'Lares seguros', '/img/Design sem nome.jpg'),

('Lucy', 'gato', 'Tonquinês', 28, 'medio', 'moderado',
    'Sociável e carinhosa', 62, 75, 88,
    'Social Felina', 'Saúde boa', 'Atenção',
    'Jovem', 'Lares sociais', '/img/patas.png');

-- Usuários iniciais
INSERT OR IGNORE INTO usuarios (nome, email, password_hash, role) VALUES
('Administrador', 'admin@thunderpets.com', '$2b$10$dummy.hash.for.admin', 'mediador'),
('Doador Exemplo', 'doador@email.com', '$2b$10$dummy.hash.for.doador', 'doador'),
('Voluntário Exemplo', 'voluntario@email.com', '$2b$10$dummy.hash.for.voluntario', 'voluntario');
