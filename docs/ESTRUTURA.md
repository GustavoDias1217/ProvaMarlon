# 📊 Estrutura de Pastas do Projeto

Visualização em árvore da organização completa dos arquivos:

```
leilao-online-serverless/
│
├── 📄 .gitignore                          # Arquivos ignorados pelo Git
├── 📄 .env.example                        # Template de variáveis de ambiente
├── 📄 package.json                        # Dependências e scripts NPM
├── 📄 serverless.yml                      # Configuração da infraestrutura AWS
├── 📄 README.md                           # Documentação principal
│
├── 📁 lambdas/                            # ⚡ Funções Lambda
│   │
│   ├── 📁 api-lambda/                     # Lambda 1: API Gateway Handler
│   │   └── 📄 handler.js                  # Handler principal
│   │       ├── criarLeilao()              # POST /leiloes
│   │       ├── listarLeiloes()            # GET /leiloes
│   │       ├── buscarLeilao()             # GET /leiloes/{id}
│   │       ├── criarLance()               # POST /lances
│   │       └── listarLances()             # GET /lances/{leilaoId}
│   │
│   └── 📁 processador-lances/             # Lambda 2: Processador Assíncrono
│       └── 📄 handler.js                  # Handler de processamento
│           ├── handler()                  # Handler principal (SQS)
│           ├── processarLance()           # Processa lance individual
│           ├── enviarNotificacoes()       # Envia via SNS
│           └── notificarRejeicaoLance()   # Notifica rejeição
│
├── 📁 shared/                             # 🔧 Código compartilhado
│   │
│   ├── 📁 clients/                        # Clientes AWS
│   │   ├── 📄 dynamodb.js                 # Cliente DynamoDB
│   │   │   ├── create()
│   │   │   ├── getById()
│   │   │   ├── update()
│   │   │   ├── queryByIndex()
│   │   │   ├── scan()
│   │   │   └── delete()
│   │   │
│   │   ├── 📄 sqs.js                      # Cliente SQS
│   │   │   ├── sendMessage()
│   │   │   └── sendMessageBatch()
│   │   │
│   │   └── 📄 sns.js                      # Cliente SNS
│   │       ├── publish()
│   │       ├── publishMultiProtocol()
│   │       └── subscribe()
│   │
│   ├── 📁 models/                         # Modelos de dados
│   │   ├── 📄 Leilao.js                   # Modelo de Leilão
│   │   │   ├── constructor()
│   │   │   ├── toItem()
│   │   │   ├── isAtivo()
│   │   │   └── atualizarValor()
│   │   │
│   │   ├── 📄 Lance.js                    # Modelo de Lance
│   │   │   ├── constructor()
│   │   │   ├── toItem()
│   │   │   ├── marcarComoProcessado()
│   │   │   ├── marcarComoVencedor()
│   │   │   └── marcarComoRejeitado()
│   │   │
│   │   └── 📄 Usuario.js                  # Modelo de Usuário
│   │       ├── constructor()
│   │       ├── toItem()
│   │       ├── incrementarLances()
│   │       └── incrementarVitorias()
│   │
│   ├── 📁 validators/                     # Validadores
│   │   └── 📄 index.js                    # Validações de entrada
│   │       ├── validateLeilao()
│   │       ├── validateLance()
│   │       └── validateUsuario()
│   │
│   └── 📁 utils/                          # Utilitários
│       └── 📄 response.js                 # Helper de respostas HTTP
│           ├── successResponse()
│           └── errorResponse()
│
└── 📁 docs/                               # 📚 Documentação
    ├── 📄 API.md                          # Documentação da API REST
    ├── 📄 ARQUITETURA.md                  # Detalhes da arquitetura
    └── 📄 DEPLOY.md                       # Guia completo de deploy
```

## Mapeamento de Responsabilidades

### 🎯 API Lambda (`lambdas/api-lambda/handler.js`)

**Entrada:** Eventos HTTP do API Gateway  
**Saída:** Respostas HTTP (JSON) ou mensagens SQS

| Rota | Método | Função | Ação |
|------|--------|--------|------|
| `/leiloes` | POST | `criarLeilao()` | Cria leilão no DynamoDB |
| `/leiloes` | GET | `listarLeiloes()` | Lista leilões ativos |
| `/leiloes/{id}` | GET | `buscarLeilao()` | Busca leilão específico |
| `/lances` | POST | `criarLance()` | Envia lance para SQS |
| `/lances/{leilaoId}` | GET | `listarLances()` | Lista lances do leilão |

### ⚙️ Processador Lambda (`lambdas/processador-lances/handler.js`)

**Entrada:** Mensagens da fila SQS  
**Saída:** Atualizações no DynamoDB + Notificações SNS

| Função | Responsabilidade |
|--------|------------------|
| `handler()` | Recebe batch de mensagens SQS |
| `processarLance()` | Valida e processa lance individual |
| `enviarNotificacoes()` | Publica notificação no SNS |
| `notificarRejeicaoLance()` | Notifica lance rejeitado |

### 🔧 Módulos Compartilhados (`shared/`)

#### Clients (Clientes AWS)

| Cliente | Serviço | Métodos Principais |
|---------|---------|-------------------|
| `dynamodb.js` | DynamoDB | create, getById, update, query, scan, delete |
| `sqs.js` | SQS | sendMessage, sendMessageBatch |
| `sns.js` | SNS | publish, publishMultiProtocol, subscribe |

#### Models (Modelos de Dados)

| Modelo | Representa | Tabela DynamoDB |
|--------|------------|----------------|
| `Leilao.js` | Leilão | `leiloes-{stage}` |
| `Lance.js` | Lance | `lances-{stage}` |
| `Usuario.js` | Usuário | `usuarios-{stage}` |

#### Validators (Validadores)

| Validador | Valida |
|-----------|--------|
| `validateLeilao()` | Título, descrição, valores, datas |
| `validateLance()` | IDs, valor positivo |
| `validateUsuario()` | Nome, email válido |

#### Utils (Utilitários)

| Utilitário | Propósito |
|------------|-----------|
| `successResponse()` | Formata resposta HTTP de sucesso |
| `errorResponse()` | Formata resposta HTTP de erro |

## Fluxo de Dados Entre Componentes

### Fluxo 1: Criar Leilão (Síncrono)

```
Cliente
  │
  │ POST /leiloes
  ▼
API Gateway
  │
  │ Event
  ▼
api-lambda/handler.js
  │ criarLeilao()
  │
  ├──→ shared/validators/index.js
  │    validateLeilao()
  │
  ├──→ shared/models/Leilao.js
  │    new Leilao()
  │
  └──→ shared/clients/dynamodb.js
       create()
         │
         ▼
      DynamoDB
       leiloes-dev
```

### Fluxo 2: Criar Lance (Assíncrono)

```
Cliente
  │
  │ POST /lances
  ▼
API Gateway
  │
  │ Event
  ▼
api-lambda/handler.js
  │ criarLance()
  │
  ├──→ shared/validators/index.js
  │    validateLance()
  │
  ├──→ shared/models/Lance.js
  │    new Lance()
  │
  └──→ shared/clients/sqs.js
       sendMessage()
         │
         ▼
      SQS Queue
         │
         │ (Trigger)
         ▼
processador-lances/handler.js
  │ handler()
  │ processarLance()
  │
  ├──→ shared/clients/dynamodb.js
  │    create() + update()
  │      │
  │      ▼
  │   DynamoDB
  │
  └──→ shared/clients/sns.js
       publish()
         │
         ▼
      SNS Topic
         │
         ▼
    Notificações
    (Email/SMS)
```

## Tamanho dos Arquivos

| Arquivo | Linhas | Descrição |
|---------|--------|-----------|
| `handler.js` (API) | ~250 | Handler com 5 rotas + validações |
| `handler.js` (Proc) | ~200 | Processamento + notificações |
| `dynamodb.js` | ~120 | CRUD completo DynamoDB |
| `sqs.js` | ~70 | Cliente SQS simplificado |
| `sns.js` | ~90 | Cliente SNS com multi-protocolo |
| `Leilao.js` | ~80 | Modelo + métodos auxiliares |
| `Lance.js` | ~60 | Modelo + status |
| `Usuario.js` | ~70 | Modelo + estatísticas |
| `validators/index.js` | ~80 | 3 validadores completos |
| `response.js` | ~40 | Formatadores HTTP |

**Total: ~1100 linhas de código**

## Convenções de Nomenclatura

### Arquivos
- **Lambdas:** `handler.js` (padrão Serverless)
- **Models:** PascalCase (`Leilao.js`, `Lance.js`)
- **Clients:** lowercase (`dynamodb.js`, `sqs.js`)
- **Utils:** lowercase (`response.js`)

### Funções
- **Handlers:** `exports.handler`
- **Públicas:** camelCase (`criarLeilao`, `processarLance`)
- **Privadas:** camelCase com _ (`_formatAttributes`)

### Classes
- **Models:** PascalCase (`class Leilao`)
- **Métodos:** camelCase (`atualizarValor()`)

### Variáveis
- **Constantes:** UPPER_SNAKE_CASE (`LEILOES_TABLE`)
- **Variáveis:** camelCase (`leilaoObj`, `lanceData`)

## Dependências Entre Módulos

```
handler.js (API)
├── depends on → shared/utils/response.js
├── depends on → shared/clients/dynamodb.js
├── depends on → shared/clients/sqs.js
├── depends on → shared/models/Leilao.js
├── depends on → shared/models/Lance.js
└── depends on → shared/validators/index.js

handler.js (Processador)
├── depends on → shared/clients/dynamodb.js
├── depends on → shared/clients/sns.js
├── depends on → shared/models/Leilao.js
└── depends on → shared/models/Lance.js

All clients
└── depends on → aws-sdk

All models
└── depends on → uuid
```

## Pontos de Extensão (PLACEHOLDERS)

Locais marcados com `// PLACEHOLDER:` indicam onde adicionar:

1. **Autenticação** (`api-lambda/handler.js`)
   - Validar JWT tokens
   - Extrair usuário do token

2. **Autorização** (`api-lambda/handler.js`)
   - Verificar permissões
   - Validar ownership

3. **Paginação** (`api-lambda/handler.js`)
   - Implementar limit/offset
   - Cursor-based pagination

4. **Regras de Negócio** (`processador-lances/handler.js`)
   - Incremento mínimo
   - Lance automático
   - Limite por usuário

5. **Notificações Avançadas** (`processador-lances/handler.js`)
   - Templates personalizados
   - Múltiplos destinatários
   - Webhooks

---

**Esta estrutura foi projetada para:**
- ✅ Fácil navegação
- ✅ Separação de responsabilidades
- ✅ Reutilização de código
- ✅ Testes unitários
- ✅ Escalabilidade
