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
    'Jovem', 'Lares sociais', '/img/patas.png'),

-- Adicionando mais 37 pets para totalizar 97
('Rocky II', 'cachorro', 'Boxer', 24, 'grande', 'ativo-aventurado', 'Brincalhão e leal', 80, 60, 75, 'Energia & Companhia', 'Vacinado', 'Exercícios diários', 'Resgatado de um abrigo', 'Casa com quintal', '/img/raca-de-cachorro-preto.jpg'),
('Mia', 'gato', 'Siamês', 12, 'pequeno', 'ativo-aventurado', 'Curiosa e falante', 60, 75, 85, 'Companheirismo & Interação', 'Vacinada e esterilizada', 'Brinquedos e atenção', 'Nascida em um lar temporário', 'Apartamento ou casa', '/img/Design sem nome.jpg'),
('Duke', 'cachorro', 'Pastor Alemão', 48, 'grande', 'moderado', 'Protetor e inteligente', 70, 65, 80, 'Segurança & Lealdade', 'Vacinado', 'Treinamento e passeios', 'Doado por família que se mudou', 'Casa com espaço', '/img/homem-abracando-seu-pitbull-amigavel.jpg'),
('Gigi', 'gato', 'Persa', 36, 'medio', 'calmo-caseiro', 'Calma e carinhosa', 45, 90, 70, 'Relaxamento & Conforto', 'Pelagem longa, exige escovação', 'Cuidados com os olhos', 'Vivia com uma senhora idosa', 'Ambiente tranquilo', '/img/patas.png'),
('Apollo', 'cachorro', 'Dálmata', 18, 'medio', 'ativo-aventurado', 'Energético e divertido', 90, 50, 70, 'Alegria & Atividade', 'Vacinado', 'Corridas e brincadeiras', 'Comprado de um criador', 'Família ativa', '/img/shihtzunsc.jpg'),
('Cleopatra', 'gato', 'Sphynx', 22, 'medio', 'moderado', 'Afetuosa e carente de calor', 55, 80, 90, 'Afeto & Proximidade', 'Pele sensível, precisa de hidratação', 'Banhos regulares', 'Resgatada de um gatil', 'Ambiente interno e aquecido', '/img/patas.png'),
('Buster', 'cachorro', 'Beagle', 30, 'pequeno', 'ativo-aventurado', 'Farejador e teimoso', 75, 60, 65, 'Aventura & Descoberta', 'Vacinado', 'Passeios com guia', 'Encontrado perdido na rua', 'Casa com quintal cercado', '/img/pexels-photo-2247894.jpeg'),
('Zelda', 'gato', 'Maine Coon', 40, 'grande', 'moderado', 'Gigante gentil e sociável', 65, 70, 85, 'Presença & Amizade', 'Vacinada', 'Escovação regular', 'Doada por falta de espaço', 'Casa espaçosa', '/img/patas.png'),
('Koda', 'cachorro', 'Husky Siberiano', 28, 'medio', 'ativo-aventurado', 'Independente e uivador', 85, 55, 60, 'Independência & Aventura', 'Vacinado', 'Exercícios intensos', 'Veio de uma região fria', 'Precisa de estímulo mental e físico', '/img/cachorro-caramelo-Petlove.jpg'),
('Fiona', 'gato', 'Vira-lata', 24, 'medio', 'moderado', 'Dócil e um pouco tímida', 50, 85, 80, 'Confiança & Calma', 'Esterilizada', 'Paciência e carinho', 'Resgatada da rua com seus irmãos', 'Lar paciente e amoroso', '/img/Design sem nome.jpg'),
('Marley', 'cachorro', 'Labrador', 15, 'medio', 'ativo-aventurado', 'Destruidor de corações e sapatos', 95, 40, 80, 'Energia & Caos Adorável', 'Vacinado', 'Muitos brinquedos', 'Filhote de uma ninhada inesperada', 'Família com senso de humor', '/img/raca-de-cachorro-preto.jpg'),
('Garfield', 'gato', 'Exótico', 60, 'medio', 'calmo-caseiro', 'Ama lasanha e odeia segundas-feiras', 30, 95, 50, 'Sarcasmo & Conforto', 'Saudável', 'Dieta controlada', 'Personagem de desenho animado', 'Qualquer lugar com um sofá', '/img/patas.png'),
('Hachi', 'cachorro', 'Akita', 72, 'grande', 'moderado', 'Extremamente leal e reservado', 60, 70, 95, 'Lealdade & Devoção', 'Vacinado', 'Socialização desde cedo', 'Inspirado em uma história real', 'Tutor experiente e dedicado', '/img/raca-de-cachorro_2.jpg'),
('Salem', 'gato', 'Bombaim', 36, 'medio', 'moderado', 'Irônico e inteligente', 55, 78, 82, 'Companhia Sarcástica', 'Saudável', 'Muitos petiscos', 'Era o familiar de uma bruxa adolescente', 'Alguém que entenda seu humor', '/img/Design sem nome.jpg'),
('Bolt', 'cachorro', 'Pastor-branco-suíço', 24, 'medio', 'ativo-aventurado', 'Acredita ter superpoderes', 88, 50, 70, 'Aventura & Fantasia', 'Vacinado', 'Muitas corridas', 'Estrela de cinema', 'Crianças para brincar', '/img/cachorro-_1750287085273-750x375.webp'),
('Dory', 'gato', 'Vira-lata', 18, 'pequeno', 'calmo-caseiro', 'Esquecida mas muito amável', 40, 90, 85, 'Amor & Paciência', 'Esterilizada', 'Rotina consistente', 'Continua a nadar', 'Um lar para chamar de seu', '/img/patas.png'),
('Scooby', 'cachorro', 'Dogue Alemão', 84, 'grande', 'calmo-caseiro', 'Medroso e faminto', 40, 80, 90, 'Amizade & Mistério', 'Saudável', 'Biscoitos Scooby', 'Resolve mistérios com seus amigos', 'Uma van e muitos lanches', '/img/homem-abracando-seu-pitbull-amigavel.jpg'),
('Tigrão', 'gato', 'Bengal', 30, 'medio', 'ativo-aventurado', 'Adora pular e explorar', 75, 60, 70, 'Energia & Diversão', 'Vacinado', 'Arranhadores altos', 'Veio do Bosque dos Cem Acres', 'Espaço para suas aventuras', '/img/Design sem nome.jpg'),
('Lady', 'cachorro', 'Cocker Spaniel Americano', 36, 'medio', 'moderado', 'Elegante e romântica', 50, 85, 80, 'Romance & Companhia', 'Vacinada', 'Jantares à luz de velas', 'De um bairro nobre', 'Um "Vagabundo" para amar', '/img/pexels-photo-2247894.jpeg'),
('Cheshire', 'gato', 'British Shorthair', 48, 'medio', 'moderado', 'Enigmático e sorridente', 55, 75, 70, 'Mistério & Filosofia', 'Saudável', 'Conversas intrigantes', 'Do País das Maravilhas', 'Alguém que não se importe com desaparecimentos', '/img/patas.png'),
('Pongo', 'cachorro', 'Dálmata', 40, 'medio', 'ativo-aventurado', 'Pai de uma grande família', 80, 60, 75, 'Família & Aventura', 'Vacinado', 'Muitos passeios', 'Fugiu de uma estilista malvada', 'Uma casa cheia de filhotes', '/img/shihtzunsc.jpg'),
('Azrael', 'gato', 'Vira-lata', 60, 'medio', 'moderado', 'Leal ao seu mestre, mas mal-humorado', 50, 70, 60, 'Lealdade Resmungona', 'Saudável', 'Tentar capturar criaturinhas azuis', 'Companheiro de um feiticeiro', 'Um castelo ou uma cabana', '/img/Design sem nome.jpg'),
('Toto', 'cachorro', 'Cairn Terrier', 30, 'pequeno', 'ativo-aventurado', 'Corajoso e leal', 70, 65, 80, 'Coragem & Aventura', 'Vacinado', 'Não teme leões covardes', 'Viajou para uma terra mágica', 'Alguém para seguir pela estrada de tijolos amarelos', '/img/shihtzunsc.jpg'),
('Dinah', 'gato', 'Vira-lata', 24, 'pequeno', 'calmo-caseiro', 'Doce e sonhadora', 45, 88, 80, 'Sonhos & Carinho', 'Esterilizada', 'Um colo quentinho', 'Pertence a uma menina chamada Alice', 'Um jardim para tardes de sol', '/img/patas.png'),
('Einstein', 'cachorro', 'Terrier misto', 96, 'medio', 'moderado', 'Inteligente e um pouco excêntrico', 60, 70, 75, 'Inteligência & Companhia', 'Saudável', 'Viagens no tempo', 'Companheiro de um cientista', 'Uma garagem com um DeLorean', '/img/cachorro-_1750287085273-750x375.webp'),
('Penelope', 'gato', 'Vira-lata', 18, 'medio', 'moderado', 'Romântica incurável', 55, 75, 85, 'Romance & Perseguição', 'Esterilizada', 'Fugir de gambás apaixonados', 'Estrela de desenhos animados clássicos', 'Paris na primavera', '/img/Design sem nome.jpg'),
('Gromit', 'cachorro', 'Beagle', 60, 'pequeno', 'calmo-caseiro', 'Silencioso, inteligente e engenhoso', 50, 90, 70, 'Engenhosidade & Lealdade', 'Saudável', 'Tricô e leitura de jornais', 'Companheiro de um inventor queijo-maníaco', 'Uma casa cheia de invenções', '/img/pexels-photo-2247894.jpeg'),
('Figaro', 'gato', 'Vira-lata', 12, 'pequeno', 'ativo-aventurado', 'Mimado e um pouco ciumento', 65, 70, 80, 'Afeto & Atenção', 'Vacinado', 'Dormir em camas confortáveis', 'Mascote de um carpinteiro', 'Um lar onde seja o centro das atenções', '/img/Design sem nome.jpg'),
('Snoopy', 'cachorro', 'Beagle', 72, 'pequeno', 'moderado', 'Sonhador e imaginativo', 55, 80, 75, 'Imaginação & Amizade', 'Saudável', 'Dormir no telhado de sua casinha', 'Dono de um passarinho amarelo', 'Alguém para suas fantasias de piloto', '/img/pexels-photo-2247894.jpeg'),
('Mittens', 'gato', 'Vira-lata', 48, 'medio', 'moderado', 'Cínica, mas com um bom coração', 50, 75, 80, 'Amizade Inesperada', 'Saudável', 'Viagens pelos Estados Unidos', 'Ex-gata de rua', 'Um super-cão como amigo', '/img/Design sem nome.jpg'),
('Pluto', 'cachorro', 'Bloodhound', 84, 'grande', 'moderado', 'Leal e um pouco desajeitado', 60, 70, 90, 'Lealdade & Diversão', 'Saudável', 'Seu melhor amigo é um rato', 'Mascote de um personagem famoso', 'Uma casa com um quintal grande', '/img/raca-de-cachorro-preto.jpg'),
('Duquesa', 'gato', 'Angorá', 60, 'medio', 'calmo-caseiro', 'Elegante e maternal', 45, 90, 80, 'Maternidade & Elegância', 'Vacinada', 'Aulas de canto e pintura', 'Aristogata de Paris', 'Um lar com seus três gatinhos', '/img/patas.png'),
('Odie', 'cachorro', 'Terrier/Dachshund', 48, 'pequeno', 'ativo-aventurado', 'Bobo e afetuoso', 80, 50, 85, 'Alegria & Baba', 'Saudável', 'Ser chutado da mesa por um gato laranja', 'Companheiro de um gato cínico', 'Qualquer lugar, desde que tenha comida', '/img/shihtzunsc.jpg'),
('Marie', 'gato', 'Angorá', 12, 'pequeno', 'moderado', 'Dama e um pouco mandona', 55, 80, 75, 'Charme & Elegância', 'Vacinada', 'Ser a "dama"', 'Filha da Duquesa', 'Paris', '/img/patas.png'),
('Balto', 'cachorro', 'Husky/Lobo', 48, 'grande', 'ativo-aventurado', 'Herói corajoso e determinado', 85, 55, 70, 'Heroísmo & Determinação', 'Vacinado', 'Correr longas distâncias na neve', 'Salvou uma cidade no Alasca', 'Um lugar para ser reconhecido como herói', '/img/cachorro-caramelo-Petlove.jpg'),
('Berlioz', 'gato', 'Angorá', 12, 'pequeno', 'moderado', 'Artista e um pouco tímido', 50, 85, 70, 'Arte & Sensibilidade', 'Vacinado', 'Tocar piano', 'Filho da Duquesa', 'Paris', '/img/patas.png'),
('Toulouse', 'gato', 'Angorá', 12, 'pequeno', 'ativo-aventurado', 'Durão e aspirante a gato de rua', 70, 65, 75, 'Aventura & Bravura', 'Vacinado', 'Praticar suas garras', 'Filho da Duquesa', 'Paris', '/img/Design sem nome.jpg'),

-- Adicionando 8 pets para totalizar 97
('Vagabundo', 'cachorro', 'Vira-lata', 48, 'medio', 'moderado', 'Esperto e charmoso, com um coração de ouro', 60, 70, 90, 'Charme & Lealdade', 'Forte e saudável', 'Gosta de espaguete', 'Vivendo livremente nas ruas', 'Um lar com uma "Lady"', '/img/raca-de-cachorro-preto.jpg'),
('Thomas O''Malley', 'gato', 'Vira-lata', 40, 'medio', 'moderado', 'Gato de rua charmoso e galanteador', 65, 70, 85, 'Confiança & Charme', 'Saudável', 'Gosta de jazz', 'Abraham de Lacy Giuseppe Casey Thomas O''Malley', 'Paris, com uma duquesa e seus gatinhos', '/img/Design sem nome.jpg'),
('Crookshanks', 'gato', 'Persa', 36, 'medio', 'calmo-caseiro', 'Extremamente inteligente, um pouco rabugento', 50, 85, 70, 'Inteligência & Companhia', 'Saudável', 'Não gosta de ratos de estimação', 'Companheiro de uma bruxa muito inteligente', 'Uma sala comunal aconchegante', '/img/patas.png'),
('Fang', 'cachorro', 'Mastim Napolitano', 60, 'grande', 'calmo-caseiro', 'Babão e covarde, mas muito leal', 40, 80, 90, 'Presença Leal', 'Saudável, mas baba muito', 'Mantenha um pano por perto', 'Mascote de um guarda-caça meio-gigante', 'Uma cabana perto de uma floresta proibida', '/img/homem-abracando-seu-pitbull-amigavel.jpg'),
('Lassie', 'cachorro', 'Rough Collie', 48, 'grande', 'moderado', 'Heróica, inteligente e incrivelmente leal', 70, 60, 95, 'Heroísmo & Devoção', 'Excelente', 'Escovação regular da pelagem', 'Sempre encontra o caminho de volta para casa', 'Uma fazenda ou casa com uma família amorosa', '/img/cachorro-caramelo-Petlove.jpg'),
('Rin Tin Tin', 'cachorro', 'Pastor Alemão', 50, 'grande', 'ativo-aventurado', 'Corajoso, atlético e uma estrela de cinema', 80, 65, 80, 'Coragem & Ação', 'Atlético', 'Muito treinamento e exercício', 'Resgatado de um campo de batalha da Primeira Guerra', 'Um set de filmagem ou um lar ativo', '/img/homem-abracando-seu-pitbull-amigavel.jpg'),
('Ghost', 'cachorro', 'Husky Siberiano', 30, 'grande', 'moderado', 'Silencioso, leal e protetor', 60, 75, 90, 'Proteção Silenciosa', 'Albino, olhos vermelhos', 'Leal a quem não sabe de nada', 'Lobo gigante de um bastardo nobre', 'O Norte, além da Muralha', '/img/cachorro-caramelo-Petlove.jpg'),
('Jake', 'cachorro', 'Bulldog', 48, 'medio', 'moderado', 'Mágico, sábio e um ótimo amigo', 70, 70, 85, 'Aventura & Sabedoria', 'Poderes de esticar', 'Gosta de tocar viola', 'Companheiro de um herói humano', 'A Terra de Ooo', '/img/raca-de-cachorro_2.jpg');

-- Usuários iniciais
INSERT OR IGNORE INTO usuarios (nome, email, password_hash, role) VALUES
('Administrador', 'admin@thunderpets.com', '$2b$10$dummy.hash.for.admin', 'mediador'),
('Doador Exemplo', 'doador@email.com', '$2b$10$dummy.hash.for.doador', 'doador'),
('Voluntário Exemplo', 'voluntario@email.com', '$2b$10$dummy.hash.for.voluntario', 'voluntario');
