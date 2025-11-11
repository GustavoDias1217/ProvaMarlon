# 🏗️ Arquitetura do Sistema

## Visão Geral

O Sistema de Leilão Online foi projetado seguindo os princípios de arquitetura serverless, garantindo:

- ✅ **Alta escalabilidade** - Escala automaticamente com a demanda
- ✅ **Alta disponibilidade** - Multi-AZ por padrão
- ✅ **Baixa latência** - Processamento distribuído
- ✅ **Custo otimizado** - Pay-per-use, sem servidores ociosos
- ✅ **Manutenção simplificada** - Infraestrutura gerenciada pela AWS

## Diagrama de Arquitetura

```
┌───────────────────────────────────────────────────────────────┐
│                        CAMADA DE APRESENTAÇÃO                  │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Browser    │  │   Mobile     │  │   Desktop    │       │
│  │     Web      │  │     App      │  │     App      │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                  │                │
│         └─────────────────┴──────────────────┘                │
│                           │                                   │
└───────────────────────────┼───────────────────────────────────┘
                            │
                  ┌─────────▼──────────┐
                  │   HTTPS Request    │
                  └─────────┬──────────┘
                            │
┌───────────────────────────┼───────────────────────────────────┐
│                    CAMADA DE API                               │
│                           │                                    │
│                  ┌────────▼─────────┐                         │
│                  │   API Gateway    │                         │
│                  │  - REST API      │                         │
│                  │  - CORS          │                         │
│                  │  - Throttling    │                         │
│                  │  - Auth (TODO)   │                         │
│                  └────────┬─────────┘                         │
└───────────────────────────┼───────────────────────────────────┘
                            │
┌───────────────────────────┼───────────────────────────────────┐
│                   CAMADA DE APLICAÇÃO                          │
│                           │                                    │
│          ┌────────────────▼────────────────┐                  │
│          │                                 │                  │
│  ┌───────▼────────┐             ┌──────────▼──────────┐      │
│  │  Lambda API    │             │  Lambda Processador │      │
│  │  - Validação   │             │  - Regras negócio   │      │
│  │  - Roteamento  │             │  - Atualiza DB      │      │
│  │  - Publica SQS │             │  - Notificações     │      │
│  └───────┬────────┘             └──────────▲──────────┘      │
│          │                                  │                 │
│          │         ┌───────────────────────┘                 │
│          │         │                                          │
└──────────┼─────────┼──────────────────────────────────────────┘
           │         │
           │    ┌────▼─────┐
           │    │   SQS    │
           │    │  Queue   │
           │    └──────────┘
           │
┌──────────┼──────────────────────────────────────────────────┐
│          │         CAMADA DE DADOS                           │
│          │                                                   │
│    ┌─────▼──────┐          ┌─────────────┐                 │
│    │  DynamoDB  │          │     SNS     │                 │
│    │            │          │   Topic     │                 │
│    │ ┌────────┐ │          └──────┬──────┘                 │
│    │ │Leilões │ │                 │                        │
│    │ └────────┘ │          ┌──────▼──────────────┐         │
│    │ ┌────────┐ │          │   Subscriptions     │         │
│    │ │ Lances │ │          │  - Email            │         │
│    │ └────────┘ │          │  - SMS              │         │
│    │ ┌────────┐ │          │  - Lambda (webhook) │         │
│    │ │Usuários│ │          └─────────────────────┘         │
│    │ └────────┘ │                                           │
│    └────────────┘                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    CAMADA DE OBSERVABILIDADE                  │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ CloudWatch  │  │   X-Ray     │  │ CloudWatch  │         │
│  │    Logs     │  │  Tracing    │  │   Metrics   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└──────────────────────────────────────────────────────────────┘
```

## Componentes Principais

### 1. API Gateway

**Responsabilidade:** Gateway HTTP que expõe endpoints REST públicos

**Características:**
- Roteamento de requisições para Lambdas
- Transformação de requisição/resposta
- Validação básica de payload
- CORS habilitado
- Throttling e rate limiting
- Logs de acesso

**Endpoints Expostos:**
```
POST   /leiloes
GET    /leiloes
GET    /leiloes/{id}
POST   /lances
GET    /lances/{leilaoId}
```

**Configuração:**
```yaml
events:
  - http:
      path: /leiloes
      method: post
      cors: true
```

---

### 2. Lambda API (api-lambda)

**Responsabilidade:** Processar requisições HTTP síncronas

**Fluxo:**
1. Recebe evento do API Gateway
2. Faz parsing do body e path parameters
3. Valida dados de entrada
4. Para **leitura**: Consulta DynamoDB e retorna
5. Para **escrita**: Envia mensagem para SQS e retorna 202

**Características:**
- Runtime: Node.js 18.x
- Timeout: 30 segundos
- Memory: 512 MB
- Código: `/lambdas/api-lambda/handler.js`

**Principais Funções:**
- `criarLeilao()` - Cria leilão no DynamoDB
- `listarLeiloes()` - Lista leilões ativos
- `buscarLeilao()` - Busca leilão por ID
- `criarLance()` - Envia lance para SQS
- `listarLances()` - Lista lances de um leilão

**Dependências:**
- DynamoDB Client
- SQS Client
- Validators
- Response Utils

---

### 3. SQS Queue (lances-queue)

**Responsabilidade:** Fila de mensagens para processamento assíncrono de lances

**Características:**
- Visibility Timeout: 180 segundos
- Message Retention: 14 dias
- Long Polling: 20 segundos
- Dead Letter Queue: lances-dlq

**Por que usar fila?**
- ✅ Desacopla recebimento de processamento
- ✅ Garante processamento mesmo com picos de carga
- ✅ Retry automático em caso de falha
- ✅ Mantém ordem FIFO (opcional)
- ✅ Cliente não precisa esperar processamento

**Fluxo de Mensagem:**
```
API Lambda → SQS Queue → Lambda Processador → DynamoDB/SNS
                │
                └──→ DLQ (após 3 falhas)
```

---

### 4. Lambda Processador (processador-lances)

**Responsabilidade:** Processar lances da fila SQS

**Fluxo:**
1. Consome mensagens da fila SQS (batch de até 10)
2. Para cada lance:
   - Valida se leilão ainda está ativo
   - Valida se valor é maior que atual
   - Aplica regras de negócio
   - Atualiza leilão no DynamoDB
   - Salva lance no DynamoDB
   - Envia notificações via SNS
3. Remove mensagens processadas da fila
4. Mensagens com erro vão para DLQ

**Características:**
- Runtime: Node.js 18.x
- Timeout: 30 segundos
- Memory: 512 MB
- Batch Size: 10 mensagens
- Batch Window: 5 segundos
- Código: `/lambdas/processador-lances/handler.js`

**Tratamento de Erros:**
- Erros recuperáveis: Retry automático (até 3x)
- Erros não recuperáveis: Move para DLQ
- Logs detalhados para debugging

---

### 5. DynamoDB

**Responsabilidade:** Banco de dados NoSQL para persistência

**Tabelas:**

#### Tabela: leiloes-{stage}
- **Partition Key:** id (String)
- **GSI:** StatusDataFimIndex
  - Partition Key: status
  - Sort Key: dataFim
- **Billing:** PAY_PER_REQUEST
- **Streams:** Habilitado

**Atributos:**
```json
{
  "id": "uuid",
  "titulo": "string",
  "descricao": "string",
  "valorInicial": number,
  "valorAtual": number,
  "dataInicio": "ISO 8601",
  "dataFim": "ISO 8601",
  "status": "ATIVO|FINALIZADO|CANCELADO",
  "vendedorId": "uuid",
  "vencedorId": "uuid|null",
  "totalLances": number,
  "categoria": "string",
  "imagens": ["urls"],
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

#### Tabela: lances-{stage}
- **Partition Key:** id (String)
- **GSI:** LeilaoIdTimestampIndex
  - Partition Key: leilaoId
  - Sort Key: timestamp
- **Billing:** PAY_PER_REQUEST

**Atributos:**
```json
{
  "id": "uuid",
  "leilaoId": "uuid",
  "usuarioId": "uuid",
  "usuarioNome": "string",
  "valor": number,
  "status": "PENDENTE|PROCESSADO|VENCEDOR|REJEITADO",
  "tipoLance": "MANUAL|AUTOMATICO",
  "timestamp": "ISO 8601",
  "createdAt": "ISO 8601"
}
```

#### Tabela: usuarios-{stage}
- **Partition Key:** id (String)
- **GSI:** EmailIndex
  - Partition Key: email
- **Billing:** PAY_PER_REQUEST

**Atributos:**
```json
{
  "id": "uuid",
  "nome": "string",
  "email": "string",
  "telefone": "string",
  "tipo": "COMPRADOR|VENDEDOR|ADMIN",
  "ativo": boolean,
  "endereco": {},
  "preferencias": {},
  "totalLancesRealizados": number,
  "totalLeiloesVencidos": number,
  "totalLeiloesCriados": number,
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

**Por que DynamoDB?**
- ✅ Escalabilidade automática
- ✅ Latência de milissegundos
- ✅ Alta disponibilidade (99.99%)
- ✅ Sem gerenciamento de servidor
- ✅ Integração nativa com Lambda

---

### 6. SNS Topic (leilao-notifications)

**Responsabilidade:** Sistema de notificações pub/sub

**Subscribers (a configurar):**
- Email endpoints
- SMS endpoints
- Lambda functions (webhooks)
- SQS queues (para processamento adicional)

**Tipos de Notificação:**
- Novo lance realizado
- Lance rejeitado
- Leilão prestes a encerrar
- Leilão encerrado
- Vitória em leilão

**Formato de Mensagem:**
```json
{
  "default": "Mensagem padrão",
  "email": "Mensagem formatada para email",
  "sms": "Mensagem curta para SMS",
  "subject": "Assunto da notificação"
}
```

---

## Padrões de Arquitetura

### 1. Event-Driven Architecture

O sistema utiliza arquitetura orientada a eventos:

```
Evento → SQS → Lambda → DynamoDB → SNS → Notificações
```

**Benefícios:**
- Desacoplamento de componentes
- Processamento assíncrono
- Escalabilidade independente
- Resiliência a falhas

### 2. CQRS (Command Query Responsibility Segregation)

Separação entre comandos (escrita) e consultas (leitura):

**Comandos (Async):**
```
POST /lances → SQS → Lambda Processador → DynamoDB
```

**Consultas (Sync):**
```
GET /lances → Lambda API → DynamoDB → Response
```

### 3. Circuit Breaker (via SQS)

A fila SQS atua como circuit breaker:
- Se Lambda Processador falhar, mensagens ficam na fila
- Sistema continua aceitando lances
- Processamento retomado quando sistema se recuperar

### 4. Retry Pattern

Tentativas automáticas em caso de falha:
```
Falha → Retry 1 (após 1s) → Retry 2 (após 2s) → Retry 3 (após 4s) → DLQ
```

---

## Escalabilidade

### Lambda Auto-Scaling

Lambdas escalam automaticamente:
- **Concurrent Executions:** Até 1000 por região (padrão)
- **Scaling Rate:** +500 instâncias/minuto (região)
- **Cold Start:** Primeira invocação pode ter latência maior

### DynamoDB Auto-Scaling

Com PAY_PER_REQUEST:
- Escala automaticamente para qualquer carga
- Sem planejamento de capacidade necessário
- Cobra por requisição ($1.25/milhão leituras, $6.25/milhão escritas)

### SQS Throughput

- **Standard Queue:** Throughput ilimitado
- **Messages:** Até 256KB por mensagem
- **Batch Processing:** Até 10 mensagens por vez

---

## Segurança

### IAM Roles e Policies

Cada Lambda tem permissões específicas:

```yaml
# Lambda API pode:
- dynamodb:PutItem     # Criar leilões
- dynamodb:GetItem     # Buscar leilões
- dynamodb:Query       # Listar leilões
- sqs:SendMessage      # Enviar lances para fila

# Lambda Processador pode:
- sqs:ReceiveMessage   # Consumir fila
- sqs:DeleteMessage    # Remover mensagem processada
- dynamodb:*           # Todas operações DynamoDB
- sns:Publish          # Enviar notificações
```

### Princípio do Menor Privilégio

Cada componente tem apenas as permissões necessárias.

### Encryption at Rest

- DynamoDB: Criptografia automática
- SQS: Criptografia opcional (KMS)
- SNS: Criptografia em trânsito (HTTPS)

---

## Observabilidade

### CloudWatch Logs

Todos os componentes enviam logs:
```
/aws/lambda/leilao-online-serverless-dev-apiLambda
/aws/lambda/leilao-online-serverless-dev-processadorLances
```

### CloudWatch Metrics

Métricas automáticas:
- Lambda: Invocations, Duration, Errors, Throttles
- DynamoDB: ConsumedReadCapacity, ConsumedWriteCapacity
- SQS: NumberOfMessagesSent, NumberOfMessagesReceived
- API Gateway: Count, Latency, 4XXError, 5XXError

### X-Ray Tracing (opcional)

Rastreamento distribuído de requisições através de todos os componentes.

---

## Custos Estimados

### Exemplo: 10.000 lances/dia

**Lambda:**
- API: 10.000 invocações × 200ms = $0.33/mês
- Processador: 10.000 invocações × 500ms = $0.83/mês

**DynamoDB:**
- Leituras: ~50.000/dia = $1.88/mês
- Escritas: ~20.000/dia = $3.75/mês

**SQS:**
- 10.000 mensagens/dia = $0.02/mês

**API Gateway:**
- 10.000 requisições/dia = $3.50/mês

**SNS:**
- 10.000 notificações/dia = $0.50/mês

**Total estimado: ~$11/mês**

*(Custos reais podem variar)*

---

## Limitações e Considerações

### Limites AWS

- Lambda: 15 min timeout máximo
- SQS: 256 KB por mensagem
- DynamoDB: 400 KB por item
- API Gateway: 29 segundos timeout

### Trade-offs

**Processamento Assíncrono:**
- ✅ Maior throughput
- ✅ Melhor resiliência
- ❌ Cliente não recebe resposta imediata

**DynamoDB NoSQL:**
- ✅ Escalabilidade
- ✅ Performance
- ❌ Consultas complexas limitadas
- ❌ Sem JOINs nativos

---

## Evolução Futura

### Próximas Melhorias

1. **WebSocket API** - Atualizações em tempo real
2. **ElasticSearch** - Busca avançada
3. **S3** - Armazenamento de imagens
4. **CloudFront** - CDN para assets
5. **Cognito** - Autenticação de usuários
6. **Step Functions** - Orquestração de workflows complexos
7. **EventBridge** - Event bus para integrações

---

**Documentação mantida por:** Gustavo Dias  
**Última atualização:** Novembro 2025
