# 📚 Documentação da API

## Base URL

```
https://{api-id}.execute-api.{region}.amazonaws.com/{stage}
```

Exemplo:
```
https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev
```

## Autenticação

⚠️ **PLACEHOLDER**: Atualmente a API não possui autenticação implementada. Para produção, implemente:

- JWT Tokens
- AWS Cognito
- API Keys no API Gateway
- OAuth 2.0

### Headers Necessários (após implementação)

```http
Authorization: Bearer {seu-token-jwt}
Content-Type: application/json
```

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 202 | Accepted - Requisição aceita para processamento assíncrono |
| 400 | Bad Request - Dados inválidos |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro no servidor |

## Formato de Resposta

### Sucesso

```json
{
  "success": true,
  "data": {
    // Dados da resposta
  },
  "timestamp": "2025-11-10T12:00:00.000Z"
}
```

### Erro

```json
{
  "success": false,
  "error": {
    "message": "Mensagem de erro",
    "details": ["Detalhes específicos do erro"],
    "timestamp": "2025-11-10T12:00:00.000Z"
  }
}
```

---

## 🎯 Endpoints - Leilões

### 1. Criar Leilão

Cria um novo leilão no sistema.

**Endpoint:** `POST /leiloes`

**Request Body:**

```json
{
  "titulo": "iPhone 14 Pro Max 256GB",
  "descricao": "iPhone 14 Pro Max 256GB, cor Deep Purple, novo na caixa lacrada com nota fiscal",
  "valorInicial": 3500.00,
  "dataInicio": "2025-11-10T10:00:00Z",
  "dataFim": "2025-11-17T18:00:00Z",
  "categoria": "ELETRONICOS",
  "imagens": [
    "https://exemplo.com/imagem1.jpg",
    "https://exemplo.com/imagem2.jpg"
  ]
}
```

**Campos:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| titulo | string | Sim | Título do leilão |
| descricao | string | Sim | Descrição detalhada |
| valorInicial | number | Sim | Valor inicial em reais (deve ser > 0) |
| dataInicio | string (ISO 8601) | Sim | Data/hora de início |
| dataFim | string (ISO 8601) | Sim | Data/hora de término (deve ser > dataInicio) |
| categoria | string | Não | Categoria do produto (padrão: "GERAL") |
| imagens | array | Não | URLs das imagens do produto |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "message": "Leilão criado com sucesso",
    "leilao": {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "titulo": "iPhone 14 Pro Max 256GB",
      "descricao": "iPhone 14 Pro Max 256GB, cor Deep Purple...",
      "valorInicial": 3500.00,
      "valorAtual": 3500.00,
      "dataInicio": "2025-11-10T10:00:00Z",
      "dataFim": "2025-11-17T18:00:00Z",
      "status": "ATIVO",
      "vendedorId": "vendedor-mock-123",
      "vencedorId": null,
      "totalLances": 0,
      "categoria": "ELETRONICOS",
      "imagens": [],
      "createdAt": "2025-11-10T09:30:00.000Z",
      "updatedAt": "2025-11-10T09:30:00.000Z"
    }
  },
  "timestamp": "2025-11-10T09:30:00.000Z"
}
```

**Erros Possíveis:**

- `400` - Dados inválidos (título vazio, valor negativo, datas inválidas)
- `500` - Erro ao salvar no banco de dados

---

### 2. Listar Leilões

Lista todos os leilões ativos ordenados por data de término.

**Endpoint:** `GET /leiloes`

**Query Parameters (futuros):**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| status | string | Filtrar por status (ATIVO, FINALIZADO, CANCELADO) |
| categoria | string | Filtrar por categoria |
| limit | number | Limite de resultados (paginação) |
| offset | number | Offset para paginação |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total": 5,
    "leiloes": [
      {
        "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "titulo": "iPhone 14 Pro Max 256GB",
        "valorInicial": 3500.00,
        "valorAtual": 3800.00,
        "dataFim": "2025-11-11T18:00:00Z",
        "status": "ATIVO",
        "totalLances": 5
      },
      // ... mais leilões
    ]
  },
  "timestamp": "2025-11-10T10:00:00.000Z"
}
```

---

### 3. Buscar Leilão por ID

Retorna os detalhes completos de um leilão específico.

**Endpoint:** `GET /leiloes/{id}`

**Path Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string (UUID) | ID do leilão |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "leilao": {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "titulo": "iPhone 14 Pro Max 256GB",
      "descricao": "Descrição completa...",
      "valorInicial": 3500.00,
      "valorAtual": 3800.00,
      "dataInicio": "2025-11-10T10:00:00Z",
      "dataFim": "2025-11-17T18:00:00Z",
      "status": "ATIVO",
      "vendedorId": "vendedor-123",
      "vencedorId": "usuario-456",
      "totalLances": 5,
      "categoria": "ELETRONICOS",
      "imagens": [],
      "createdAt": "2025-11-10T09:30:00.000Z",
      "updatedAt": "2025-11-10T12:00:00.000Z"
    }
  },
  "timestamp": "2025-11-10T12:30:00.000Z"
}
```

**Erros Possíveis:**

- `404` - Leilão não encontrado
- `500` - Erro ao consultar banco de dados

---

## 💰 Endpoints - Lances

### 4. Criar Lance

Cria um novo lance em um leilão. O lance é enviado para uma fila SQS para processamento assíncrono.

**Endpoint:** `POST /lances`

**Request Body:**

```json
{
  "leilaoId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "usuarioId": "550e8400-e29b-41d4-a716-446655440000",
  "valor": 3600.00,
  "tipoLance": "MANUAL"
}
```

**Campos:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| leilaoId | string (UUID) | Sim | ID do leilão |
| usuarioId | string (UUID) | Sim | ID do usuário (será obtido do token em produção) |
| valor | number | Sim | Valor do lance em reais |
| tipoLance | string | Não | MANUAL ou AUTOMATICO (padrão: MANUAL) |

**Response (202 Accepted):**

```json
{
  "success": true,
  "data": {
    "message": "Lance recebido e será processado em breve",
    "lanceId": "123e4567-e89b-12d3-a456-426614174000",
    "status": "PENDENTE"
  },
  "timestamp": "2025-11-10T12:00:00.000Z"
}
```

**⚠️ Importante:** O código de status `202 Accepted` indica que o lance foi aceito para processamento, mas ainda não foi processado. O processamento ocorre de forma assíncrona pela Lambda Processador.

**Validações:**

- Leilão deve existir
- Leilão deve estar ativo (status ATIVO e dentro do período)
- Lance deve ser maior que o valor atual do leilão
- Valor deve ser positivo

**Erros Possíveis:**

- `400` - Dados inválidos (valor negativo, campos obrigatórios faltando)
- `400` - Lance menor ou igual ao valor atual
- `400` - Leilão não está ativo
- `404` - Leilão não encontrado
- `500` - Erro ao enviar para fila SQS

---

### 5. Listar Lances de um Leilão

Lista todos os lances de um leilão específico, ordenados do mais recente para o mais antigo.

**Endpoint:** `GET /lances/{leilaoId}`

**Path Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| leilaoId | string (UUID) | ID do leilão |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "leilaoId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "total": 5,
    "lances": [
      {
        "id": "lance-001",
        "leilaoId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "usuarioId": "usuario-456",
        "usuarioNome": "João Silva",
        "valor": 3800.00,
        "status": "PROCESSADO",
        "tipoLance": "MANUAL",
        "timestamp": "2025-11-10T12:00:00.000Z",
        "createdAt": "2025-11-10T12:00:00.000Z"
      },
      {
        "id": "lance-002",
        "leilaoId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "usuarioId": "usuario-789",
        "usuarioNome": "Maria Santos",
        "valor": 3700.00,
        "status": "PROCESSADO",
        "tipoLance": "MANUAL",
        "timestamp": "2025-11-10T11:30:00.000Z",
        "createdAt": "2025-11-10T11:30:00.000Z"
      }
      // ... mais lances
    ]
  },
  "timestamp": "2025-11-10T12:30:00.000Z"
}
```

**Status de Lance:**

- `PENDENTE` - Lance aceito, aguardando processamento
- `PROCESSADO` - Lance processado com sucesso
- `VENCEDOR` - Lance vencedor do leilão
- `REJEITADO` - Lance rejeitado (leilão inativo, valor insuficiente, etc)

**Erros Possíveis:**

- `500` - Erro ao consultar banco de dados

---

## 🔄 Fluxo de Processamento de Lance

1. **Cliente envia POST /lances**
   - API valida dados básicos
   - Verifica se leilão existe e está ativo
   - Retorna `202 Accepted` imediatamente

2. **Mensagem enviada para SQS**
   - Lance é enfileirado para processamento
   - Cliente pode fazer outras requisições sem esperar

3. **Lambda Processador consome fila**
   - Valida regras de negócio completas
   - Atualiza valor do leilão no DynamoDB
   - Salva lance processado
   - Envia notificações via SNS

4. **Cliente consulta GET /lances/{leilaoId}**
   - Verifica se lance foi processado
   - Vê status atualizado (PROCESSADO ou REJEITADO)

## 📊 Exemplos de Uso

### Exemplo 1: Criar um leilão e dar um lance

```bash
# 1. Criar leilão
curl -X POST https://api.exemplo.com/dev/leiloes \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Notebook Gamer",
    "descricao": "Dell G15 RTX 3060",
    "valorInicial": 4000,
    "dataInicio": "2025-11-10T10:00:00Z",
    "dataFim": "2025-11-15T18:00:00Z"
  }'

# Response: { "success": true, "data": { "leilao": { "id": "abc-123" } } }

# 2. Dar um lance
curl -X POST https://api.exemplo.com/dev/lances \
  -H "Content-Type: application/json" \
  -d '{
    "leilaoId": "abc-123",
    "usuarioId": "usuario-456",
    "valor": 4200
  }'

# Response: { "success": true, "data": { "lanceId": "lance-001", "status": "PENDENTE" } }

# 3. Verificar lances
curl https://api.exemplo.com/dev/lances/abc-123

# Response: Lista com o lance processado
```

### Exemplo 2: Listar leilões ativos

```bash
curl https://api.exemplo.com/dev/leiloes

# Response: Lista de leilões ordenados por data de término
```

## 🚨 Tratamento de Erros

### Dead Letter Queue (DLQ)

Se um lance falhar após 3 tentativas de processamento, ele é movido para uma Dead Letter Queue (DLQ) para análise manual.

Para verificar mensagens na DLQ:

```bash
aws sqs receive-message \
  --queue-url https://sqs.us-east-1.amazonaws.com/123456789/lances-dlq-dev \
  --max-number-of-messages 10
```

## 🔐 Segurança (TODO)

### Implementar em Produção:

1. **Rate Limiting**
```yaml
# Em serverless.yml
apiGateway:
  throttle:
    rateLimit: 100
    burstLimit: 200
```

2. **Validação de Input**
```javascript
// Sanitizar entrada para prevenir injection
const titulo = sanitize(req.body.titulo);
```

3. **Autenticação JWT**
```javascript
// Verificar token em cada requisição
const user = await verifyJWT(event.headers.Authorization);
```

## 📞 Suporte

Para questões sobre a API:
- Verifique os logs no CloudWatch
- Abra uma issue no repositório
- Contate o time de desenvolvimento
