# 🎯 Sistema de Leilão Online Serverless

Sistema completo de leilão online construído com arquitetura serverless na AWS, utilizando Lambda Functions, SQS, DynamoDB e SNS.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Deploy](#deploy)
- [Endpoints da API](#endpoints-da-api)
- [Testes](#testes)
- [Monitoramento](#monitoramento)

## 🎯 Visão Geral

Este projeto implementa um sistema completo de leilão online com as seguintes funcionalidades:

- ✅ Criação e gerenciamento de leilões
- ✅ Sistema de lances em tempo real
- ✅ Processamento assíncrono de lances via fila SQS
- ✅ Notificações automáticas via SNS
- ✅ Persistência de dados no DynamoDB
- ✅ API RESTful via API Gateway
- ✅ Arquitetura 100% serverless (sem servidores para gerenciar)

## 🏗️ Arquitetura

```
┌─────────────┐
│   Usuário   │
│  Frontend   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  API Gateway    │
│  (HTTP Proxy)   │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│   Lambda 1: API      │
│  - Valida dados      │
│  - Envia para SQS    │
│  - Retorna resposta  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│    SQS Queue         │
│  (Fila de Lances)    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│  Lambda 2: Processador   │
│  - Processa lances       │
│  - Atualiza DynamoDB     │
│  - Envia notificações    │
└──────┬───────────────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│  DynamoDB   │   │  SNS Topic  │
│  - Leilões  │   │(Notificações│
│  - Lances   │   │             │
│  - Usuários │   └─────────────┘
└─────────────┘
```

### Fluxo de Dados

1. **Usuário Frontend** envia requisição HTTP
2. **API Gateway** roteia para Lambda API
3. **Lambda API** valida dados e:
   - Para leitura: consulta DynamoDB diretamente
   - Para escrita: envia mensagem para fila SQS
4. **SQS** armazena mensagens temporariamente
5. **Lambda Processador** consome mensagens da fila
6. **Lambda Processador** atualiza **DynamoDB** e envia notificações via **SNS**
7. **SNS** distribui notificações para usuários (email, SMS, etc)

## 📁 Estrutura do Projeto

```
leilao-online-serverless/
│
├── lambdas/                          # Funções Lambda
│   ├── api-lambda/                   # Lambda 1: API Gateway Handler
│   │   └── handler.js                # Handler principal da API
│   │
│   └── processador-lances/           # Lambda 2: Processador de Lances
│       └── handler.js                # Handler de processamento assíncrono
│
├── shared/                           # Código compartilhado entre Lambdas
│   ├── clients/                      # Clientes AWS
│   │   ├── dynamodb.js               # Cliente DynamoDB
│   │   ├── sqs.js                    # Cliente SQS
│   │   └── sns.js                    # Cliente SNS
│   │
│   ├── models/                       # Modelos de dados
│   │   ├── Leilao.js                 # Modelo de Leilão
│   │   ├── Lance.js                  # Modelo de Lance
│   │   └── Usuario.js                # Modelo de Usuário
│   │
│   ├── validators/                   # Validadores
│   │   └── index.js                  # Validações de entrada
│   │
│   └── utils/                        # Utilitários
│       └── response.js               # Helper de respostas HTTP
│
├── docs/                             # Documentação adicional
│   ├── ARQUITETURA.md                # Detalhes da arquitetura
│   ├── API.md                        # Documentação da API
│   └── DEPLOY.md                     # Guia de deploy
│
├── serverless.yml                    # Configuração Serverless Framework
├── package.json                      # Dependências Node.js
├── .gitignore                        # Arquivos ignorados pelo Git
└── README.md                         # Este arquivo
```

## 🛠️ Tecnologias Utilizadas

### AWS Services
- **Lambda**: Funções serverless para lógica de negócio
- **API Gateway**: Gateway HTTP para expor APIs REST
- **SQS**: Fila de mensagens para processamento assíncrono
- **DynamoDB**: Banco de dados NoSQL gerenciado
- **SNS**: Serviço de notificações pub/sub
- **CloudWatch**: Logs e monitoramento
- **IAM**: Gerenciamento de permissões

### Framework e Bibliotecas
- **Serverless Framework**: Infraestrutura como código
- **Node.js 18.x**: Runtime JavaScript
- **AWS SDK**: Biblioteca para integração com AWS
- **UUID**: Geração de identificadores únicos

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 18.x ou superior)
- [NPM](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
- [AWS CLI](https://aws.amazon.com/cli/) configurado com credenciais
- [Serverless Framework](https://www.serverless.com/) CLI

```bash
# Instalar Serverless Framework globalmente
npm install -g serverless

# Verificar instalação
serverless --version
```

## 🚀 Instalação

1. **Clone o repositório** (ou navegue até a pasta do projeto)

```bash
cd /home/gustavodias/ProvaMarlon
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as credenciais AWS**

```bash
# Configure com suas credenciais AWS
aws configure

# Ou exporte variáveis de ambiente
export AWS_ACCESS_KEY_ID=sua_access_key
export AWS_SECRET_ACCESS_KEY=sua_secret_key
export AWS_REGION=us-east-1
```

## ⚙️ Configuração

### Variáveis de Ambiente

O projeto usa variáveis de ambiente definidas no `serverless.yml`. Principais configurações:

```yaml
# Região AWS
region: us-east-1

# Stage (dev, staging, prod)
stage: dev

# Tabelas DynamoDB
LEILOES_TABLE: leiloes-dev
LANCES_TABLE: lances-dev
USUARIOS_TABLE: usuarios-dev

# Fila SQS
LANCES_QUEUE_URL: (gerada automaticamente)

# Tópico SNS
NOTIFICATIONS_TOPIC_ARN: (gerado automaticamente)
```

### Personalizações

#### Alterar Região AWS

Edite `serverless.yml`:

```yaml
provider:
  region: sa-east-1  # São Paulo
```

#### Configurar CORS

No arquivo `shared/utils/response.js`, ajuste:

```javascript
'Access-Control-Allow-Origin': 'https://seudominio.com'
```

## 🚢 Deploy

### Deploy Completo

```bash
# Deploy em ambiente de desenvolvimento
npm run deploy:dev

# Deploy em produção
npm run deploy:prod
```

### Deploy com Serverless CLI

```bash
# Deploy padrão (stage dev)
serverless deploy

# Deploy em stage específico
serverless deploy --stage prod

# Deploy apenas de uma função
serverless deploy function -f apiLambda
```

### Saída do Deploy

Após o deploy, você verá informações importantes:

```
Service Information
service: leilao-online-serverless
stage: dev
region: us-east-1

endpoints:
  POST - https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/leiloes
  GET - https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/leiloes
  GET - https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/leiloes/{id}
  POST - https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/lances
  GET - https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/lances/{leilaoId}

functions:
  apiLambda: leilao-online-serverless-dev-apiLambda
  processadorLances: leilao-online-serverless-dev-processadorLances
```

## 📡 Endpoints da API

### Base URL
```
https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/dev
```

### Leilões

#### Criar Leilão
```http
POST /leiloes
Content-Type: application/json

{
  "titulo": "iPhone 14 Pro Max",
  "descricao": "iPhone 14 Pro Max 256GB, novo na caixa",
  "valorInicial": 3500.00,
  "dataInicio": "2025-11-10T10:00:00Z",
  "dataFim": "2025-11-17T18:00:00Z",
  "categoria": "ELETRONICOS"
}
```

#### Listar Leilões
```http
GET /leiloes
```

#### Buscar Leilão
```http
GET /leiloes/{id}
```

### Lances

#### Criar Lance
```http
POST /lances
Content-Type: application/json

{
  "leilaoId": "uuid-do-leilao",
  "usuarioId": "uuid-do-usuario",
  "valor": 3600.00
}
```

#### Listar Lances de um Leilão
```http
GET /lances/{leilaoId}
```

## 🧪 Testes

### Teste Local com Serverless Offline

```bash
# Instalar plugin
npm install --save-dev serverless-offline

# Executar localmente
serverless offline
```

### Teste Manual com cURL

```bash
# Criar leilão
curl -X POST https://sua-api.com/dev/leiloes \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Notebook Dell",
    "descricao": "Notebook Dell i7",
    "valorInicial": 2000,
    "dataInicio": "2025-11-10T10:00:00Z",
    "dataFim": "2025-11-17T18:00:00Z"
  }'

# Criar lance
curl -X POST https://sua-api.com/dev/lances \
  -H "Content-Type: application/json" \
  -d '{
    "leilaoId": "uuid-do-leilao",
    "usuarioId": "usuario-123",
    "valor": 2100
  }'
```

## 📊 Monitoramento

### Logs das Lambdas

```bash
# Ver logs em tempo real - API Lambda
npm run logs:api

# Ver logs em tempo real - Processador
npm run logs:processor

# Ou com serverless CLI
serverless logs -f apiLambda -t
serverless logs -f processadorLances -t
```

### CloudWatch Metrics

Acesse o console AWS CloudWatch para visualizar:
- Invocações das funções
- Duração de execução
- Erros e throttling
- Mensagens na fila SQS
- Dead Letter Queue

### X-Ray (Tracing)

Para habilitar rastreamento distribuído, adicione no `serverless.yml`:

```yaml
provider:
  tracing:
    lambda: true
    apiGateway: true
```

## 🔐 Segurança

### Implementações Necessárias (PLACEHOLDERS)

Os seguintes pontos de segurança precisam ser implementados:

1. **Autenticação e Autorização**
   - Implementar JWT ou AWS Cognito
   - Validar tokens em todas as requisições
   - Controlar acesso baseado em roles

2. **CORS**
   - Configurar origens permitidas em produção
   - Não usar `*` em ambiente de produção

3. **Rate Limiting**
   - Implementar throttling no API Gateway
   - Proteger contra DDoS

4. **Validação de Dados**
   - Sanitizar todas as entradas
   - Prevenir SQL/NoSQL injection

5. **Secrets Management**
   - Usar AWS Secrets Manager para credenciais
   - Não expor chaves em código

## 🗑️ Remoção

Para remover toda a infraestrutura:

```bash
# Remove todos os recursos AWS
npm run remove

# Ou
serverless remove
```

