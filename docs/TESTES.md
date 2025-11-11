# 🧪 Exemplos de Requisições para Testes

Este arquivo contém exemplos práticos de requisições HTTP para testar a API do Sistema de Leilão Online.

## Configuração

Primeiro, defina a URL base da sua API:

```bash
# Substitua pelo endpoint gerado após o deploy
export API_URL="https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev"
```

## 1. Criar Leilão

### Exemplo 1: Leilão de Eletrônicos

```bash
curl -X POST $API_URL/leiloes \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "iPhone 14 Pro Max 256GB Deep Purple",
    "descricao": "iPhone 14 Pro Max 256GB, cor Deep Purple, novo na caixa lacrada com todos os acessórios e nota fiscal. Garantia de 1 ano Apple.",
    "valorInicial": 3500.00,
    "dataInicio": "2025-11-10T10:00:00Z",
    "dataFim": "2025-11-17T18:00:00Z",
    "categoria": "ELETRONICOS",
    "imagens": [
      "https://example.com/iphone-1.jpg",
      "https://example.com/iphone-2.jpg"
    ]
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "message": "Leilão criado com sucesso",
    "leilao": {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "titulo": "iPhone 14 Pro Max 256GB Deep Purple",
      "valorInicial": 3500.00,
      "valorAtual": 3500.00,
      "status": "ATIVO",
      ...
    }
  }
}
```

### Exemplo 2: Leilão de Veículo

```bash
curl -X POST $API_URL/leiloes \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Honda Civic 2020 Automático",
    "descricao": "Honda Civic EXL 2.0 2020, automático, completo, revisões em dia, único dono, 45.000 km rodados.",
    "valorInicial": 85000.00,
    "dataInicio": "2025-11-11T08:00:00Z",
    "dataFim": "2025-11-20T20:00:00Z",
    "categoria": "VEICULOS"
  }'
```

### Exemplo 3: Leilão de Imóvel

```bash
curl -X POST $API_URL/leiloes \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Apartamento 2 quartos Centro SP",
    "descricao": "Apartamento de 65m², 2 quartos, 1 vaga, região central de São Paulo, próximo ao metrô.",
    "valorInicial": 350000.00,
    "dataInicio": "2025-11-12T09:00:00Z",
    "dataFim": "2025-12-01T18:00:00Z",
    "categoria": "IMOVEIS"
  }'
```

## 2. Listar Leilões

```bash
# Listar todos os leilões ativos
curl $API_URL/leiloes

# Com formato JSON legível
curl $API_URL/leiloes | jq .
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "leiloes": [
      {
        "id": "abc-123",
        "titulo": "iPhone 14 Pro Max",
        "valorAtual": 3500.00,
        "totalLances": 0,
        "dataFim": "2025-11-17T18:00:00Z",
        "status": "ATIVO"
      },
      ...
    ]
  }
}
```

## 3. Buscar Leilão Específico

```bash
# Substitua {LEILAO_ID} pelo ID retornado na criação
LEILAO_ID="f47ac10b-58cc-4372-a567-0e02b2c3d479"

curl $API_URL/leiloes/$LEILAO_ID | jq .
```

## 4. Criar Lance

### Lance Inicial

```bash
# Primeiro lance no leilão
curl -X POST $API_URL/lances \
  -H "Content-Type: application/json" \
  -d '{
    "leilaoId": "'$LEILAO_ID'",
    "usuarioId": "usuario-001",
    "usuarioNome": "João Silva",
    "valor": 3600.00
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "message": "Lance recebido e será processado em breve",
    "lanceId": "lance-001",
    "status": "PENDENTE"
  },
  "timestamp": "2025-11-10T12:00:00.000Z"
}
```

### Lance Subsequente

```bash
# Segundo lance (deve ser maior que o anterior)
curl -X POST $API_URL/lances \
  -H "Content-Type: application/json" \
  -d '{
    "leilaoId": "'$LEILAO_ID'",
    "usuarioId": "usuario-002",
    "usuarioNome": "Maria Santos",
    "valor": 3700.00
  }'
```

### Lance Inválido (para testar validação)

```bash
# Lance menor que o atual - deve ser rejeitado
curl -X POST $API_URL/lances \
  -H "Content-Type: application/json" \
  -d '{
    "leilaoId": "'$LEILAO_ID'",
    "usuarioId": "usuario-003",
    "valor": 3500.00
  }'
```

**Resposta esperada (erro):**
```json
{
  "success": false,
  "error": {
    "message": "Lance deve ser maior que o valor atual: R$ 3700"
  }
}
```

## 5. Listar Lances de um Leilão

```bash
# Ver todos os lances de um leilão
curl $API_URL/lances/$LEILAO_ID | jq .
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "leilaoId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "total": 2,
    "lances": [
      {
        "id": "lance-002",
        "usuarioNome": "Maria Santos",
        "valor": 3700.00,
        "status": "PROCESSADO",
        "timestamp": "2025-11-10T12:05:00Z"
      },
      {
        "id": "lance-001",
        "usuarioNome": "João Silva",
        "valor": 3600.00,
        "status": "PROCESSADO",
        "timestamp": "2025-11-10T12:00:00Z"
      }
    ]
  }
}
```

## 6. Cenário Completo de Teste

Script bash completo para testar todo o fluxo:

```bash
#!/bin/bash

# Configuração
API_URL="https://seu-endpoint.com/dev"

echo "🎯 Testando Sistema de Leilão Online"
echo "===================================="
echo ""

# 1. Criar Leilão
echo "1️⃣ Criando leilão..."
LEILAO_RESPONSE=$(curl -s -X POST $API_URL/leiloes \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Notebook Gamer Dell G15",
    "descricao": "Dell G15 RTX 3060, i7, 16GB RAM, 512GB SSD",
    "valorInicial": 4000.00,
    "dataInicio": "2025-11-10T10:00:00Z",
    "dataFim": "2025-11-17T18:00:00Z",
    "categoria": "ELETRONICOS"
  }')

LEILAO_ID=$(echo $LEILAO_RESPONSE | jq -r '.data.leilao.id')
echo "✅ Leilão criado: $LEILAO_ID"
echo ""

# Aguardar um pouco
sleep 2

# 2. Listar Leilões
echo "2️⃣ Listando leilões..."
curl -s $API_URL/leiloes | jq '.data.total'
echo ""

# 3. Buscar Leilão Específico
echo "3️⃣ Buscando leilão específico..."
curl -s $API_URL/leiloes/$LEILAO_ID | jq '.data.leilao.titulo'
echo ""

# 4. Criar Primeiro Lance
echo "4️⃣ Criando primeiro lance (R$ 4200)..."
curl -s -X POST $API_URL/lances \
  -H "Content-Type: application/json" \
  -d '{
    "leilaoId": "'$LEILAO_ID'",
    "usuarioId": "usuario-001",
    "usuarioNome": "João Silva",
    "valor": 4200.00
  }' | jq '.data.status'
echo ""

# Aguardar processamento
echo "⏳ Aguardando processamento..."
sleep 5

# 5. Criar Segundo Lance
echo "5️⃣ Criando segundo lance (R$ 4500)..."
curl -s -X POST $API_URL/lances \
  -H "Content-Type: application/json" \
  -d '{
    "leilaoId": "'$LEILAO_ID'",
    "usuarioId": "usuario-002",
    "usuarioNome": "Maria Santos",
    "valor": 4500.00
  }' | jq '.data.status'
echo ""

# Aguardar processamento
sleep 5

# 6. Listar Lances
echo "6️⃣ Listando lances do leilão..."
curl -s $API_URL/lances/$LEILAO_ID | jq '.data.lances[] | "\(.usuarioNome): R$ \(.valor)"'
echo ""

# 7. Verificar Leilão Atualizado
echo "7️⃣ Verificando valor atual do leilão..."
curl -s $API_URL/leiloes/$LEILAO_ID | jq '.data.leilao | "Valor Atual: R$ \(.valorAtual), Total de Lances: \(.totalLances)"'
echo ""

echo "===================================="
echo "✨ Teste completo finalizado!"
```

## 7. Testes de Validação

### Teste 1: Criar leilão sem título

```bash
curl -X POST $API_URL/leiloes \
  -H "Content-Type: application/json" \
  -d '{
    "descricao": "Descrição sem título",
    "valorInicial": 1000
  }'
```

**Erro esperado:** `400 Bad Request - "Título é obrigatório"`

### Teste 2: Criar leilão com valor negativo

```bash
curl -X POST $API_URL/leiloes \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Teste",
    "descricao": "Teste",
    "valorInicial": -100,
    "dataInicio": "2025-11-10T10:00:00Z",
    "dataFim": "2025-11-17T18:00:00Z"
  }'
```

**Erro esperado:** `400 Bad Request - "Valor inicial deve ser um número positivo"`

### Teste 3: Criar lance em leilão inexistente

```bash
curl -X POST $API_URL/lances \
  -H "Content-Type: application/json" \
  -d '{
    "leilaoId": "leilao-inexistente",
    "usuarioId": "usuario-001",
    "valor": 1000
  }'
```

**Erro esperado:** `404 Not Found - "Leilão não encontrado"`

## 8. Monitoramento

### Ver logs em tempo real

```bash
# Logs da API Lambda
serverless logs -f apiLambda -t

# Logs do Processador
serverless logs -f processadorLances -t
```

### Verificar fila SQS

```bash
# Ver estatísticas da fila
aws sqs get-queue-attributes \
  --queue-url https://sqs.us-east-1.amazonaws.com/123456/lances-queue-dev \
  --attribute-names All
```

### Verificar Dead Letter Queue

```bash
# Ver mensagens com erro
aws sqs receive-message \
  --queue-url https://sqs.us-east-1.amazonaws.com/123456/lances-dlq-dev \
  --max-number-of-messages 10
```

## 9. Testes de Carga

### Criar múltiplos lances

```bash
#!/bin/bash

API_URL="https://seu-endpoint.com/dev"
LEILAO_ID="seu-leilao-id"

# Criar 10 lances em sequência
for i in {1..10}
do
  VALOR=$((4000 + i * 100))
  echo "Criando lance $i: R$ $VALOR"
  
  curl -X POST $API_URL/lances \
    -H "Content-Type: application/json" \
    -d '{
      "leilaoId": "'$LEILAO_ID'",
      "usuarioId": "usuario-'$i'",
      "usuarioNome": "Usuário '$i'",
      "valor": '$VALOR'
    }'
  
  sleep 1
done
```

## 10. Limpeza

### Remover toda infraestrutura

```bash
# CUIDADO: Isso remove TODOS os recursos e dados!
serverless remove
```

## Ferramentas Úteis

### HTTPie (alternativa ao curl)

```bash
# Instalar
pip install httpie

# Usar
http POST $API_URL/leiloes \
  titulo="Teste" \
  descricao="Descrição" \
  valorInicial:=1000 \
  dataInicio="2025-11-10T10:00:00Z" \
  dataFim="2025-11-17T18:00:00Z"
```

### Postman Collection

Importe estes endpoints no Postman:

- Base URL: `{{API_URL}}`
- Endpoints:
  - POST `/leiloes`
  - GET `/leiloes`
  - GET `/leiloes/:id`
  - POST `/lances`
  - GET `/lances/:leilaoId`

### jq (parser JSON)

```bash
# Instalar
sudo apt-get install jq

# Usar
curl $API_URL/leiloes | jq '.data.leiloes[0]'
```

---

**Dica:** Salve o LEILAO_ID em uma variável para reutilizar nos testes!

```bash
export LEILAO_ID=$(curl -s -X POST $API_URL/leiloes -H "Content-Type: application/json" -d '{"titulo":"Teste",...}' | jq -r '.data.leilao.id')
```
