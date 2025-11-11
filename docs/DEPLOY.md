# 🚀 Guia de Deploy

Este guia detalha como fazer o deploy do Sistema de Leilão Online Serverless na AWS.

## Pré-requisitos

Antes de começar o deploy, certifique-se de ter:

- [x] Conta AWS ativa
- [x] AWS CLI instalado e configurado
- [x] Node.js 18.x ou superior
- [x] Serverless Framework CLI instalado
- [x] Credenciais AWS configuradas com permissões adequadas

## Configuração Inicial

### 1. Configurar AWS CLI

```bash
# Opção 1: Configuração interativa
aws configure

# Será solicitado:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Default region name (ex: us-east-1)
# - Default output format (json)

# Opção 2: Exportar variáveis de ambiente
export AWS_ACCESS_KEY_ID=sua_access_key_aqui
export AWS_SECRET_ACCESS_KEY=sua_secret_key_aqui
export AWS_REGION=us-east-1
```

### 2. Verificar Configuração

```bash
# Testar credenciais
aws sts get-caller-identity

# Deve retornar:
# {
#   "UserId": "AIDACKCEVSQ6C2EXAMPLE",
#   "Account": "123456789012",
#   "Arn": "arn:aws:iam::123456789012:user/seu-usuario"
# }
```

### 3. Instalar Dependências

```bash
cd /home/gustavodias/ProvaMarlon
npm install
```

## Deploy em Ambiente de Desenvolvimento

### Deploy Completo

```bash
# Opção 1: Usando npm script
npm run deploy:dev

# Opção 2: Usando serverless CLI diretamente
serverless deploy --stage dev --region us-east-1
```

### Saída Esperada

```
Deploying leilao-online-serverless to stage dev (us-east-1)

✔ Service deployed to stack leilao-online-serverless-dev (112s)

endpoints:
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/leiloes
  GET - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/leiloes
  GET - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/leiloes/{id}
  POST - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/lances
  GET - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/lances/{leilaoId}

functions:
  apiLambda: leilao-online-serverless-dev-apiLambda (5.2 MB)
  processadorLances: leilao-online-serverless-dev-processadorLances (5.2 MB)

Stack Outputs:
  ApiLambdaLambdaFunctionQualifiedArn: arn:aws:lambda:us-east-1:123456789012:function:leilao-online-serverless-dev-apiLambda:1
  ProcessadorLancesLambdaFunctionQualifiedArn: arn:aws:lambda:us-east-1:123456789012:function:leilao-online-serverless-dev-processadorLances:1
  ServiceEndpoint: https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev
  ServerlessDeploymentBucketName: leilao-online-serverless-dev-serverlessdeploymentbucket-abc123
```

**⚠️ IMPORTANTE:** Salve a URL do endpoint (`ServiceEndpoint`) - você precisará dela para fazer requisições!

## Deploy em Produção

### Preparação

1. **Revisar Configurações de Produção**

Edite `serverless.yml` para ambiente de produção:

```yaml
# Exemplo de configurações específicas para prod
custom:
  stages:
    prod:
      memorySize: 1024  # Mais memória para prod
      timeout: 60
```

2. **Configurar Domínio Customizado (Opcional)**

```bash
# Adicionar plugin de domínio customizado
npm install --save-dev serverless-domain-manager
```

Adicionar em `serverless.yml`:
```yaml
plugins:
  - serverless-domain-manager

custom:
  customDomain:
    domainName: api.seudominio.com
    stage: prod
    certificateName: '*.seudominio.com'
    createRoute53Record: true
```

### Deploy

```bash
# Deploy para produção
npm run deploy:prod

# Ou
serverless deploy --stage prod --region us-east-1
```

### Validação Pós-Deploy

```bash
# 1. Verificar stack CloudFormation
aws cloudformation describe-stacks \
  --stack-name leilao-online-serverless-prod \
  --region us-east-1

# 2. Verificar Lambdas
aws lambda list-functions \
  --region us-east-1 \
  | grep leilao-online

# 3. Verificar Tabelas DynamoDB
aws dynamodb list-tables --region us-east-1

# 4. Testar endpoint
curl https://seu-endpoint.com/prod/leiloes
```

## Deploy de Função Individual

Se você fez alteração em apenas uma Lambda:

```bash
# Deploy apenas da Lambda API
serverless deploy function -f apiLambda --stage dev

# Deploy apenas da Lambda Processador
serverless deploy function -f processadorLances --stage dev
```

**Vantagem:** Muito mais rápido (~10 segundos vs ~2 minutos)

## Múltiplos Ambientes

### Estratégia Recomendada

```
┌─────────────┐
│     dev     │ ← Desenvolvimento (branch: develop)
└─────────────┘
       ↓
┌─────────────┐
│   staging   │ ← Testes/QA (branch: staging)
└─────────────┘
       ↓
┌─────────────┐
│    prod     │ ← Produção (branch: main)
└─────────────┘
```

### Configurar Stages

Cada stage é isolado com seus próprios recursos:

```bash
# Dev
serverless deploy --stage dev

# Staging  
serverless deploy --stage staging

# Produção
serverless deploy --stage prod
```

**Recursos criados por stage:**
- `leiloes-dev`, `leiloes-staging`, `leiloes-prod`
- `lances-dev`, `lances-staging`, `lances-prod`
- Lambdas separadas
- Filas SQS separadas
- Tópicos SNS separados

## Monitoramento Pós-Deploy

### Ver Logs em Tempo Real

```bash
# Logs da API Lambda
serverless logs -f apiLambda -t --stage dev

# Logs do Processador
serverless logs -f processadorLances -t --stage dev
```

### Métricas no CloudWatch

```bash
# Abrir console CloudWatch
aws cloudwatch get-dashboard \
  --dashboard-name leilao-online-dev
```

### Alarmes Recomendados

Criar alarmes no CloudWatch:

1. **Erros nas Lambdas > 5%**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name lambda-api-errors \
  --alarm-description "Alerta quando erros > 5%" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

2. **Mensagens na DLQ > 0**
3. **Throttling nas Lambdas**
4. **Latência da API > 1s**

## Testes Pós-Deploy

### 1. Teste de Criação de Leilão

```bash
API_URL="https://seu-endpoint.com/dev"

# Criar leilão
curl -X POST $API_URL/leiloes \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Teste Deploy",
    "descricao": "Leilão de teste após deploy",
    "valorInicial": 100,
    "dataInicio": "2025-11-10T10:00:00Z",
    "dataFim": "2025-11-15T18:00:00Z"
  }'

# Esperar resposta com ID do leilão
```

### 2. Teste de Lance

```bash
# Usar ID do leilão criado acima
LEILAO_ID="uuid-do-leilao"

curl -X POST $API_URL/lances \
  -H "Content-Type: application/json" \
  -d '{
    "leilaoId": "'$LEILAO_ID'",
    "usuarioId": "teste-123",
    "valor": 150
  }'

# Esperar status 202 Accepted
```

### 3. Verificar Processamento

```bash
# Aguardar alguns segundos para processamento
sleep 5

# Listar lances
curl $API_URL/lances/$LEILAO_ID

# Verificar se lance foi processado (status: PROCESSADO)
```

### 4. Verificar DLQ (Dead Letter Queue)

```bash
# Verificar se há mensagens com erro
aws sqs get-queue-attributes \
  --queue-url https://sqs.us-east-1.amazonaws.com/123456/lances-dlq-dev \
  --attribute-names ApproximateNumberOfMessages

# Deve retornar 0 se tudo estiver OK
```

## Troubleshooting

### Erro: "User is not authorized"

```bash
# Verificar permissões IAM
aws iam get-user

# Adicionar políticas necessárias:
# - AWSLambdaFullAccess
# - AmazonDynamoDBFullAccess
# - AmazonSQSFullAccess
# - AmazonSNSFullAccess
# - IAMFullAccess
# - CloudFormationFullAccess
```

### Erro: "Rate exceeded"

```bash
# Aumentar limites no serverless.yml
provider:
  apiGateway:
    throttle:
      rateLimit: 1000
      burstLimit: 2000
```

### Erro: "Memory size exceeded"

```bash
# Aumentar memória da Lambda
functions:
  apiLambda:
    memorySize: 1024  # Aumentar de 512 para 1024 MB
```

### Lambda sempre em timeout

```bash
# Aumentar timeout
functions:
  apiLambda:
    timeout: 60  # Aumentar de 30 para 60 segundos
```

### Logs não aparecem

```bash
# Verificar CloudWatch Logs
aws logs describe-log-groups \
  --log-group-name-prefix /aws/lambda/leilao

# Dar permissões explícitas
iamRoleStatements:
  - Effect: Allow
    Action:
      - logs:CreateLogGroup
      - logs:CreateLogStream
      - logs:PutLogEvents
    Resource: "*"
```

## Rollback

Se algo der errado após deploy:

### Rollback Completo

```bash
# Voltar para versão anterior
serverless rollback --timestamp timestamp-do-deploy-anterior

# Exemplo:
serverless rollback --timestamp 1699617000000
```

### Rollback de Função Individual

```bash
# Listar versões
aws lambda list-versions-by-function \
  --function-name leilao-online-serverless-dev-apiLambda

# Publicar versão específica
aws lambda update-alias \
  --function-name leilao-online-serverless-dev-apiLambda \
  --name live \
  --function-version 3  # versão anterior
```

## Remoção Completa

Para remover todo o stack (CUIDADO: IRREVERSÍVEL!):

```bash
# Remover ambiente dev
npm run remove

# Ou especificar stage
serverless remove --stage dev

# Confirmar remoção
# - Lambdas serão deletadas
# - Tabelas DynamoDB serão deletadas (dados perdidos!)
# - Filas SQS serão deletadas
# - API Gateway será deletado
```

### Backup Antes de Remover

```bash
# Backup das tabelas DynamoDB
aws dynamodb create-backup \
  --table-name leiloes-dev \
  --backup-name leiloes-dev-backup-$(date +%Y%m%d)

aws dynamodb create-backup \
  --table-name lances-dev \
  --backup-name lances-dev-backup-$(date +%Y%m%d)
```

## CI/CD com GitHub Actions

### Configurar Secrets no GitHub

1. Ir em Settings → Secrets → Actions
2. Adicionar:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`

### Criar Workflow

Criar `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches:
      - main        # Deploy prod em push na main
      - develop     # Deploy dev em push na develop

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Deploy to AWS
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            npm run deploy:prod
          else
            npm run deploy:dev
          fi
```

## Custos e Otimização

### Estimar Custos

Use a [AWS Pricing Calculator](https://calculator.aws/):

1. Lambda: Invocações + Duração
2. DynamoDB: Leituras + Escritas
3. SQS: Mensagens
4. API Gateway: Requisições
5. CloudWatch: Logs

### Otimizações de Custo

1. **Usar PAY_PER_REQUEST no DynamoDB**
   - Pague apenas pelo que usar
   - Sem capacidade provisionada ociosa

2. **Batch Processing no SQS**
   - Processar múltiplas mensagens por invocação
   - Reduz invocações da Lambda

3. **Log Retention**
```yaml
# Reduzir retenção de logs
logRetentionInDays: 7  # ao invés de 30
```

4. **Dead Letter Queue**
   - Reduz tentativas infinitas
   - Economiza em invocações

## Checklist de Deploy

- [ ] Credenciais AWS configuradas
- [ ] Dependências instaladas (`npm install`)
- [ ] Configurações revisadas no `serverless.yml`
- [ ] Testes locais passando
- [ ] Deploy executado com sucesso
- [ ] Endpoints testados
- [ ] Logs verificados
- [ ] Métricas normais
- [ ] Alarmes configurados
- [ ] Documentação atualizada
- [ ] Backup configurado (para prod)

## Suporte

### Recursos Úteis

- [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)

### Problemas Comuns

- [Serverless Forum](https://forum.serverless.com/)
- [AWS re:Post](https://repost.aws/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/serverless)

---

**Última atualização:** Novembro 2025  
**Autor:** Gustavo Dias
