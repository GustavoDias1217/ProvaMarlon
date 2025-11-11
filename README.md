# 🎯 Sistema de Leilão Online Serverless

Plataforma de leilões com processamento assíncrono, escalável e serverless na AWS.

## � Quick Start

```bash
./setup.sh                # Instala dependências
aws configure             # Configura credenciais AWS
npm run deploy:dev        # Deploy na AWS
```

## 💡 O que faz?

Sistema de leilões onde usuários criam leilões e dão lances. Processamento assíncrono via fila garante alta performance e zero perda de dados.

## 🏗️ Arquitetura

```
Cliente → API Gateway → Lambda API → SQS → Lambda Processador → DynamoDB + SNS
```

**Fluxo:**
1. Cliente faz requisição HTTP
2. Lambda API valida e envia para fila SQS (resposta instantânea)
3. Lambda Processador consome fila, atualiza DynamoDB e notifica via SNS

**Padrão:** Event-Driven + CQRS (writes assíncronos, reads síncronos)

## 📁 Estrutura

```
├── lambdas/              # 2 Lambdas (API + Processador)
├── shared/               # Código compartilhado (clients, models, validators)
├── docs/                 # Documentação detalhada
└── serverless.yml        # Infraestrutura as Code
```

## 🛠️ Stack

**AWS:** Lambda, API Gateway, SQS, DynamoDB, SNS, CloudWatch  
**Framework:** Serverless Framework + Node.js 18.x

## 📋 Pré-requisitos

- Node.js 18+
- AWS CLI configurado
- Serverless Framework (`npm install -g serverless`)

## 🚢 Deploy

```bash
npm run deploy:dev      # Desenvolvimento
npm run deploy:prod     # Produção
serverless remove       # Remove tudo
```

## 📡 API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/leiloes` | Criar leilão |
| GET | `/leiloes` | Listar leilões |
| GET | `/leiloes/{id}` | Buscar leilão |
| POST | `/lances` | Criar lance (async) |
| GET | `/lances/{leilaoId}` | Listar lances |


## 📊 Monitoramento

```bash
npm run logs:api           # Logs Lambda API
npm run logs:processor     # Logs Lambda Processador
```

Métricas disponíveis no CloudWatch Console.



## 🔐 Segurança (TODOs)

Placeholders marcados com `// PLACEHOLDER:` para:
- Autenticação JWT/Cognito
- CORS personalizado
- Rate limiting
- Secrets Manager

