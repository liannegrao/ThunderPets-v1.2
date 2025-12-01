# ThunderPets 🐾

**Plataforma de adoção terapêutica de pets** - Conectando pessoas com animais para terapia emocional.

## 📋 Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- Conta no **Cloudinary** para hospedagem de imagens

## 🚀 Instalação e Configuração

### Passo 1: Clonar o repositório
```bash
git clone https://github.com/liannegrao/ThunderPets-v1.2.git
cd ThunderPets-v1.2
```

### Passo 2: Instalar dependências
```bash
npm install
```

### Passo 3: Configurar Cloudinary
1. Acesse [cloudinary.com](https://cloudinary.com) e crie uma conta
2. Vá para Dashboard > Account Details > API Keys
3. Copie a **API Environment variable** (formato: `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`)
4. Abra o arquivo `thunderpets-api/.env`
5. Substitua a linha `CLOUDINARY_URL=` pela sua URL completa:
   ```env
   CLOUDINARY_URL=cloudinary://YOUR_API_KEY:YOUR_API_SECRET@YOUR_CLOUD_NAME
   ```

### Passo 4: Verificar configuração
```bash
cd thunderpets-api
node -e "require('dotenv').config(); console.log('✅ Cloudinary:', process.env.CLOUDINARY_URL ? 'Configurado' : 'NÃO configurado');"
```

## 🏃‍♂️ Como Executar

## 🔧 Aplicar Correções

Agora, para aplicar as correções, siga estes passos:

1. Pare a API : Se o servidor da API estiver em execução, pare-o no terminal.
2. Delete o banco de dados antigo : Vá até a pasta thunderpets-api e apague o arquivo thunderpets.db .
3. Inicie a API novamente : No terminal, dentro da pasta thunderpets-api , execute npm start . Isso criará um novo banco de dados com os 97 pets.
4. Execute o script de sincronização : Em outro terminal, também na pasta thunderpets-api , execute o comando node update-pets-images.js .
O script agora irá atribuir uma imagem única para cada pet, priorizando a correspondência por espécie (cão/gato) e evitando as duplicatas.

Depois de executar o script, verifique sua aplicação e você verá que cada pet tem uma imagem diferente e correta.



#### 5. Iniciar Angular (em outro terminal)
```bash
npm start
```
## 🌐 Acessar a Aplicação

Após executar `npm run dev`, acesse:

- **Aplicação principal**: http://localhost:4200
- **Painel do Adotante**: http://localhost:4200/painel-adotante
- **API**: http://localhost:3001/api/pets

## 📁 Estrutura do Projeto

```
ThunderPets-v1.2/
├── src/                    # Aplicação Angular
│   ├── app/
│   │   ├── componente/     # Componentes da aplicação
│   │   ├── services/       # Serviços (API, autenticação)
│   │   └── guards/         # Guards de rota
│   └── styles.css          # Estilos globais
├── thunderpets-api/        # API Backend
│   ├── routes/             # Rotas da API
│   ├── db.js              # Gerenciamento do banco
│   ├── server.js          # Servidor Express
│   ├── cloudinary.js      # Integração Cloudinary
│   └── .env               # Variáveis de ambiente
└── package.json           # Scripts e dependências
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento completo (recomendado)
npm run dev

# Apenas API
npm run api

# Sincronizar imagens Cloudinary
npm run sync

# Limpar duplicatas do banco
npm run clean

# Angular normal
npm start

# Build de produção
npm run build

# Testes
npm test
```

## 🐕 Sobre o ThunderPets

ThunderPets é uma plataforma inovadora que conecta pessoas com necessidades terapêuticas a pets adequados para adoção. O sistema utiliza:

- **Matching terapêutico inteligente** baseado em scores de depressão, ansiedade e solidão
- **Integração com Cloudinary** para hospedagem e otimização de imagens
- **Interface responsiva** para desktop e mobile
- **Sistema de adoção** com acompanhamento

### Funcionalidades

- ✅ **97 pets cadastrados** com perfis terapêuticos
- ✅ **Imagens otimizadas** via Cloudinary
- ✅ **Sistema de matching** por necessidades emocionais
- ✅ **Painéis especializados** (Adotante, Doador, Mediador)
- ✅ **Autenticação** e perfis de usuário

## 🔧 Configuração Avançada

### Banco de Dados
O sistema usa SQLite e recria o banco automaticamente. Para manter dados persistentes, modifique `thunderpets-api/server.js` linha 67-72.

### Imagens Cloudinary
- Pasta padrão: `ThunderPets/`
- Formatos aceitos: JPG, PNG, JPEG
- Otimização automática ativada

### Portas
- API: 3001
- Angular: 4200 (ou próxima disponível)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 📞 Suporte

Para dúvidas ou sugestões:
- Abra uma issue no GitHub
- Email: suporte@thunderpets.com

---

**ThunderPets** - Transformando vidas através da conexão entre humanos e animais 🐾❤️
