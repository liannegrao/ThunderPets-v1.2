# ThunderPets API 🚀

API REST completa para o sistema ThunderPets - Plataforma de adoção terapêutica de pets.

## 🚀 Instalação Rápida

```bash
# Entrar no diretório da API
cd thunderpets-api

# Instalar dependências
npm install

# Inicializar banco de dados (com dados de exemplo)
npm run init-db

# Iniciar servidor
npm start
# ou para desenvolvimento: npm run dev
```

A API ficará disponível em: `http://localhost:3001`

## 📋 Endpoints Disponíveis

### 🐾 Pets
```
GET    /api/pets           # Listar todos os pets
GET    /api/pets/:id       # Buscar pet específico
GET    /api/pets/matching  # Pets terapêuticos compatíveis
POST   /api/pets           # Cadastrar novo pet
PUT    /api/pets/:id       # Atualizar pet
DELETE /api/pets/:id       # Remover pet
```

### ❤️ Adoções
```
GET    /api/adoptions      # Listar adoções
GET    /api/adoptions/:id  # Buscar adoção
POST   /api/adoptions      # Solicitar adoção
PUT    /api/adoptions/:id  # Atualizar status (mediador)
```

### 🤝 Doações (Cuidado Terapêutico)
```
GET    /api/donations      # Listar solicitações
POST   /api/donations      # Nova solicitação terapêutica
PUT    /api/donations/:id  # Atualizar status
```

### 🎯 Mediadores (Ações Administrativas)
```
GET    /api/mediators/stats     # Estatísticas gerais
POST   /api/mediators/approve/:petId  # Aprovar pet
POST   /api/mediators/reject/:petId   # Rejeitar pet
POST   /api/mediators/adopt/:petId    # Marcar como adotado
```

**Header necessário para rotas de mediador:**
```
x-api-key: thunderpets-2024-mediator-secret
```

## 🧪 Exemplos de Uso (curl)

### 1. Listar Pets Disponíveis
```bash
curl http://localhost:3001/api/pets
```

### 2. Matching Terapêutico
```bash
curl "http://localhost:3001/api/pets/matching?situacao=depressao&energia=moderado&disponibilidade=metade-dia"
```

### 3. Aprovação por Mediador
```bash
curl -X POST http://localhost:3001/api/mediators/approve/1 \
  -H "x-api-key: thunderpets-2024-mediator-secret"
```

### 4. Solicitar Adoção
```bash
curl -X POST http://localhost:3001/api/adoptions \
  -H "Content-Type: application/json" \
  -d '{
    "pet_id": 2,
    "adotante_nome": "João Silva",
    "adotante_email": "joao@email.com",
    "adotante_telefone": "(11) 99999-9999",
    "motivacao": "Luto da perda de um ente querido"
  }'
```

## 🔒 Sistema de Autenticação

Para ações de mediador, use o header:
```
x-api-key: thunderpets-2024-mediator-secret
```

## 💾 Banco de Dados

Banco SQLite (`thunderpets.db`) com 3 tabelas:
- `pets`: Pets disponíveis (6 pets iniciais)
- `adocoes`: Processos de adoção
- `doacoes_terapeuticas`: Solicitações de cuidado terapêutico
- `usuarios`: Usuários do sistema

## 🖼️ Upload de Imagens

- **Diretório:** `./uploads/`
- **URL:** `http://localhost:3001/images/[nome-do-arquivo]`
- **Formatos suportados:** JPG, PNG, GIF (até 5MB)

## 📊 Dados Iniciais

**6 Pets exemplo:**
- **Cachorros:** Biscoito (Golden), Thor (Labrador), Buddy (Poodle), Luna (Beagle)
- **Gatos:** Purês, Sonecas

**Usuários exemplo:**
- Administrador (`admin@thunderpets.com`)
- Doador exemplo, Voluntário exemplo

## 🔧 Integração com Angular

Atualizar seu `src/app/services/pets.service.ts` para usar a API:

```typescript
// Mudar as chamadas de this.petsService.getAllPets()
// Para HTTP calls para http://localhost:3001/api/

private apiUrl = 'http://localhost:3001/api';

getAllPets(): Observable<Pet[]> {
  return this.http.get<Pet[]>(`${this.apiUrl}/pets`);
}
```

## ⚠️ Produção

**Para produção, implementar:**
- HTTPS obrigatório
- JWT autenticacao real
- Validação avançada de arquivos
- Rate limiting mais rigoroso
- Logs detalhados
- Backups automáticos
- CORS controlado

---

**🎯 ThunderPets API v1.0.0 - Sistema Completo de Adoção Terapêutica**
