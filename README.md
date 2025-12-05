# ThunderPets 🐾

Uma plataforma de adoção terapêutica de pets que conecta pessoas com animais para terapia emocional e companhia.

## 📋 Visão Geral

ThunderPets é uma aplicação web inovadora projetada para facilitar a adoção terapêutica de pets. A plataforma utiliza algoritmos inteligentes de matching baseados nas necessidades emocionais dos usuários (scores de depressão, ansiedade, solidão) para pareá-los com pets adequados para adoção. O sistema suporta múltiplas funções de usuário incluindo adotantes, doadores e mediadores, fornecendo um ecossistema abrangente para adoção de pets com foco no bem-estar emocional.

## ✨ Funcionalidades

- **Matching Terapêutico**: Pareamento inteligente de pets baseado em scores de saúde emocional
- **Sistema Multi-Função**: Painéis separados para adotantes, doadores e mediadores
- **Integração Cloudinary**: Hospedagem e gerenciamento otimizado de imagens
- **Design Responsivo**: Interface amigável para desktop e mobile
- **Comentários em Tempo Real**: Sistema de discussão para perfis de pets
- **Sistema de Autenticação**: Login seguro e acesso baseado em funções
- **Gerenciamento de Banco**: SQLite com sincronização automática
- **97 Pets Pré-carregados**: Banco abrangente de pets com imagens

## 🛠️ Stack Tecnológico

### Frontend
- **Angular 19**: Framework web moderno para construção da interface do usuário
- **TypeScript**: Linguagem de programação fortemente tipada
- **CSS**: Estilização personalizada com design responsivo

### Backend
- **Node.js**: Ambiente de execução JavaScript para desenvolvimento server-side
- **Express.js**: Framework de aplicação web
- **SQLite**: Banco de dados relacional leve
- **Cloudinary**: Gerenciamento e otimização de imagens baseado em nuvem

### Bibliotecas Adicionais
- **bcrypt**: Hashing de senhas
- **CORS**: Compartilhamento de recursos entre origens
- **Helmet**: Middleware de segurança
- **Multer**: Gerenciamento de upload de arquivos
- **UUID**: Geração de identificadores únicos

## 📋 Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn** como gerenciador de pacotes
- **Conta Cloudinary** para hospedagem de imagens

## 🚀 Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/liannegrao/ThunderPets-v1.2.git
   cd ThunderPets-v1.2
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. ### 3. Configure o Cloudinary

O projeto utiliza o Cloudinary para armazenar e otimizar as imagens dos pets.  
Siga os passos abaixo para configurar corretamente:

1. Abra a pasta `thunderpets-api/`
2. Crie um arquivo chamado `.env`
3. Cole a seguinte variável exatamente **em uma única linha**:

```env
CLOUDINARY_URL=cloudinary://451688694316172:26uQM5CwTzT_UJb3RyWPKkMacHY@dblescwur

4. **Verifique a configuração**
   ```bash
   cd thunderpets-api
   node -e "require('dotenv').config(); console.log('✅ Cloudinary:', process.env.CLOUDINARY_URL ? 'Configurado' : 'NÃO configurado');"
   ```

## 🏃‍♂️ Executando a Aplicação

### Modo Desenvolvimento

1. **Inicie o servidor da API** (em um terminal):
   ```bash
   cd thunderpets-api
   npm start
   ```
   A API funcionará em `http://localhost:3001`

2. **Inicie a aplicação Angular** (em outro terminal):
   ```bash
   npm start
   ```
   O frontend funcionará em `http://localhost:4200`

3. ** Sincronize imagens dos pets** (execute uma vez após a primeira configuração):
   ```bash
   cd thunderpets-api
   node update-pets-images.js
   ```

### Configuração Automatizada de Desenvolvimento

Para uma configuração completa com inicialização do banco e sincronização de imagens, use:
```bash
npm run dev
```

Este comando irá:
- Limpar e recriar o banco de dados
- Sincronizar imagens do Cloudinary
- Iniciar tanto a API quanto os servidores Angular

## 🌐 Acessando a Aplicação

- **Aplicação Principal**: http://localhost:4200
- **Painel do Adotante**: http://localhost:4200/painel-adotante
- **Painel do Doador**: http://localhost:4200/painel-doador
- **Painel do Mediador**: http://localhost:4200/painel-mediador
- **Documentação da API**: http://localhost:3001/api/pets

## 📁 Estrutura do Projeto

```
ThunderPets-v1.2/
├── src/                          # Frontend Angular
│   ├── app/
│   │   ├── componente/           # Componentes da Aplicação
│   │   │   ├── home/            # Página inicial
│   │   │   ├── login/           # Autenticação
│   │   │   ├── painel-adotante/ # Painel do adotante
│   │   │   ├── painel-doador/   # Painel do doador
│   │   │   └── painel-mediador/ # Painel do mediador
│   │   ├── pages/               # Componentes de Página
│   │   │   ├── cadastrar-pet/   # Cadastro de pets
│   │   │   ├── comentar/        # Sistema de comentários
│   │   │   ├── header/          # Cabeçalho de navegação
│   │   │   └── footer/          # Rodapé da página
│   │   ├── services/            # Serviços Angular
│   │   │   ├── auth.service.ts  # Autenticação
│   │   │   ├── pets.service.ts  # Gerenciamento de pets
│   │   │   └── adocao.service.ts # Processo de adoção
│   │   └── guards/              # Guards de Rota
│   │       └── auth.guard.ts    # Guard de autenticação
│   ├── styles.css               # Estilos globais
│   └── index.html               # Template HTML principal
├── thunderpets-api/             # API Backend
│   ├── routes/                  # Rotas da API
│   │   ├── pets.js             # Endpoints de pets
│   │   ├── adoptions.js        # Endpoints de adoções
│   │   ├── donations.js        # Endpoints de doações
│   │   └── mediators.js        # Endpoints de mediadores
│   ├── db.js                   # Gerenciamento do banco
│   ├── server.js               # Servidor Express
│   ├── cloudinary.js           # Integração Cloudinary
│   ├── update-pets-images.js   # Sincronização de imagens
│   ├── schema.sql             # Schema do banco
│   ├── .env                   # Variáveis de ambiente
│   └── package.json           # Dependências da API
├── public/                     # Assets estáticos
│   └── img/                   # Imagens estáticas
├── package.json               # Dependências e scripts raiz
└── angular.json              # Configuração Angular
```

## 🔧 Scripts Disponíveis

### Scripts do Nível Raiz
```bash
npm start          # Inicia servidor de desenvolvimento Angular
npm run build      # Build para produção
npm run test       # Executa testes Angular
npm run dev        # Configuração completa de desenvolvimento (API + Frontend + DB)
npm run api        # Inicia apenas o servidor da API
npm run sync       # Sincroniza imagens Cloudinary
npm run clean      # Limpa duplicatas do banco
```

### Scripts da API
```bash
cd thunderpets-api
npm start          # Inicia servidor da API
npm run dev        # Inicia com nodemon (reinício automático)
npm run init-db    # Inicializa banco de dados
```

## 🔧 Configuração

### Banco de Dados
- **Tipo**: SQLite
- **Localização**: `thunderpets-api/thunderpets.db`
- **Auto-inicialização**: Banco criado automaticamente na primeira execução
- **Persistência de dados**: Modifique `thunderpets-api/server.js` linhas 67-72 para alterar comportamento de persistência

### Gerenciamento de Imagens
- **Provedor**: Cloudinary
- **Pasta padrão**: `ThunderPets/`
- **Formatos suportados**: JPG, PNG, JPEG
- **Otimização automática**: Habilitada por padrão
- **Sincronização**: Execute `node update-pets-images.js` para sincronizar imagens com pets

### Portas
- **Frontend**: 4200 (ou próxima disponível)
- **API**: 3001
- **Banco**: Baseado em arquivo (SQLite)

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua branch de feature (`git checkout -b feature/FuncionalidadeIncrivel`)
3. Commit suas mudanças (`git commit -m 'Adiciona funcionalidade incrível'`)
4. Push para a branch (`git push origin feature/FuncionalidadeIncrivel`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para dúvidas, problemas ou sugestões:
- Abra uma issue no GitHub
- Contato: suporte@thunderpets.com

---

**ThunderPets** - Transformando vidas através da conexão entre humanos e animais 🐾❤️
