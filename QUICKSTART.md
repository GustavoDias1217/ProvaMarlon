# 🚀 Quick Start - Sistema de Leilão Online

Guia rápido para colocar o sistema no ar em 5 minutos!

## ⚡ Instalação Rápida

```bash
# 1. Navegar para o projeto
cd /home/gustavodias/ProvaMarlon

# 2. Executar script de setup (recomendado)
./setup.sh

# OU instalar manualmente:
npm install

# 3. Configurar AWS CLI
aws configure
# Fornecer: Access Key ID, Secret Access Key, Region (us-east-1)

# 4. Deploy!
npm run deploy:dev
```

## 📋 Checklist Pré-Deploy

- [ ] Node.js 18+ instalado
- [ ] AWS CLI configurado
- [ ] Serverless Framework instalado (`npm install -g serverless`)
- [ ] Credenciais AWS válidas
- [ ] Dependências instaladas (`npm install`)

## 🎯 Comandos Essenciais

```bash
# Deploy
npm run deploy:dev          # Deploy desenvolvimento
npm run deploy:prod         # Deploy produção

# Logs
npm run logs:api            # Logs da API
npm run logs:processor      # Logs do processador

# Remover
npm run remove              # Remove toda infraestrutura
```

## 🧪 Teste Rápido

Após o deploy, teste a API:

```bash
# Salvar URL do endpoint (aparece após deploy)
export API_URL="https://seu-endpoint.com/dev"

# Criar leilão
curl -X POST $API_URL/leiloes \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "iPhone 14",
    "descricao": "Novo na caixa",
    "valorInicial": 3500,
    "dataInicio": "2025-11-10T10:00:00Z",
    "dataFim": "2025-11-17T18:00:00Z"
  }'

# Listar leilões
curl $API_URL/leiloes
```

## 📁 Estrutura do Projeto

```
ProvaMarlon/
├── lambdas/                    # Funções Lambda
│   ├── api-lambda/            # Lambda 1: API REST
│   └── processador-lances/    # Lambda 2: Processamento
├── shared/                     # Código compartilhado
│   ├── clients/               # Clientes AWS (DynamoDB, SQS, SNS)
│   ├── models/                # Modelos (Leilao, Lance, Usuario)
│   ├── validators/            # Validadores
│   └── utils/                 # Utilitários
├── docs/                       # Documentação completa
│   ├── API.md                 # Endpoints da API
│   ├── ARQUITETURA.md         # Detalhes da arquitetura
│   ├── DEPLOY.md              # Guia de deploy completo
│   ├── ESTRUTURA.md           # Estrutura detalhada
│   └── TESTES.md              # Exemplos de testes
├── serverless.yml             # Configuração infraestrutura
├── package.json               # Dependências
└── README.md                  # Documentação principal
```

## 🏗️ Arquitetura (Simplificada)

```
Cliente → API Gateway → Lambda API → SQS → Lambda Processador
                            ↓              ↓
                        DynamoDB       DynamoDB + SNS
```

## 📡 Endpoints Disponíveis

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/leiloes` | Criar leilão |
| GET | `/leiloes` | Listar leilões |
| GET | `/leiloes/{id}` | Buscar leilão |
| POST | `/lances` | Criar lance |
| GET | `/lances/{leilaoId}` | Listar lances |

## 🔍 Onde Estão os PLACEHOLDERS?

Os seguintes pontos precisam de configuração/implementação:

### 1. Autenticação (JWT/Cognito)
- `lambdas/api-lambda/handler.js` - linhas com `// PLACEHOLDER: Adicione autenticação`

### 2. CORS
- `shared/utils/response.js` - Configurar domínios permitidos

### 3. Região AWS
- `serverless.yml` - linha `region: us-east-1`

### 4. Credenciais AWS
- Configurar via `aws configure` ou variáveis de ambiente

### 5. Regras de Negócio Extras
- `lambdas/processador-lances/handler.js` - Incremento mínimo, limite de lances, etc

## 🛠️ Tecnologias Utilizadas

- **AWS Lambda** - Funções serverless
- **API Gateway** - Endpoints HTTP REST
- **DynamoDB** - Banco de dados NoSQL
- **SQS** - Fila de mensagens
- **SNS** - Notificações
- **Serverless Framework** - IaC (Infrastructure as Code)
- **Node.js 18** - Runtime

## 📊 Recursos AWS Criados

Após o deploy, os seguintes recursos são criados:

✅ 2 Lambda Functions  
✅ 3 Tabelas DynamoDB  
✅ 1 Fila SQS (+ 1 DLQ)  
✅ 1 Tópico SNS  
✅ 1 API Gateway REST  
✅ 1 CloudFormation Stack  
✅ Logs no CloudWatch  

## 💰 Estimativa de Custos

Para 10.000 requisições/dia:
- Lambda: ~$1/mês
- DynamoDB: ~$6/mês
- SQS: ~$0.02/mês
- API Gateway: ~$3.50/mês
- SNS: ~$0.50/mês

**Total estimado: ~$11/mês**

## 🐛 Troubleshooting

### Erro: "User is not authorized"
```bash
# Verificar credenciais
aws sts get-caller-identity

# Reconfigurar se necessário
aws configure
```

### Erro: "Timeout"
```bash
# Aumentar timeout no serverless.yml
functions:
  apiLambda:
    timeout: 60  # segundos
```

### Lambda não processa lances
```bash
# Verificar logs
npm run logs:processor

# Verificar DLQ
aws sqs receive-message --queue-url https://sqs.../lances-dlq-dev
```

## 📚 Documentação Completa

- **README.md** - Visão geral e instalação
- **docs/API.md** - Documentação detalhada da API
- **docs/ARQUITETURA.md** - Arquitetura e componentes
- **docs/DEPLOY.md** - Guia completo de deploy
- **docs/ESTRUTURA.md** - Estrutura de pastas
- **docs/TESTES.md** - Exemplos de testes

## 🎓 Próximos Passos

1. **Autenticação**
   - Integrar AWS Cognito
   - Implementar JWT tokens

2. **Frontend**
   - Criar interface web (React/Vue)
   - WebSockets para tempo real

3. **Pagamentos**
   - Integrar Stripe/PayPal
   - Sistema de caução

4. **Notificações Avançadas**
   - Email templates
   - Push notifications

5. **CI/CD**
   - GitHub Actions
   - Testes automatizados

## 💡 Dicas

1. **Use stages diferentes** para dev/staging/prod
2. **Monitore CloudWatch** para identificar problemas
3. **Configure alarmes** para erros críticos
4. **Faça backup** das tabelas DynamoDB antes de mudanças
5. **Use variables** no serverless.yml para configurações

## 🤝 Suporte

- Issues no GitHub
- AWS Documentation
- Serverless Forum
- Stack Overflow

---

## 🎉 Pronto para Começar!

```bash
# Execute agora:
./setup.sh

# Depois:
npm run deploy:dev

# E teste:
curl $API_URL/leiloes
```

**Boa sorte com seu projeto de leilão online! 🚀**

---

**Criado por:** Gustavo Dias  
**Data:** Novembro 2025  
**Versão:** 1.0.0
