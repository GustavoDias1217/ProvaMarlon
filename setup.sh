#!/bin/bash

# Script de Inicialização do Projeto
# Sistema de Leilão Online Serverless

echo "🎯 Iniciando configuração do Sistema de Leilão Online Serverless"
echo "================================================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar Node.js
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null
then
    echo -e "${RED}❌ Node.js não encontrado. Por favor, instale Node.js 18.x ou superior${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js encontrado: $NODE_VERSION${NC}"
echo ""

# Verificar NPM
echo "📦 Verificando NPM..."
if ! command -v npm &> /dev/null
then
    echo -e "${RED}❌ NPM não encontrado${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ NPM encontrado: $NPM_VERSION${NC}"
echo ""

# Verificar AWS CLI
echo "☁️  Verificando AWS CLI..."
if ! command -v aws &> /dev/null
then
    echo -e "${YELLOW}⚠ AWS CLI não encontrado. Instale com:${NC}"
    echo "   curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'"
    echo "   unzip awscliv2.zip"
    echo "   sudo ./aws/install"
else
    AWS_VERSION=$(aws --version)
    echo -e "${GREEN}✓ AWS CLI encontrado: $AWS_VERSION${NC}"
fi
echo ""

# Verificar Serverless Framework
echo "⚡ Verificando Serverless Framework..."
if ! command -v serverless &> /dev/null
then
    echo -e "${YELLOW}⚠ Serverless Framework não encontrado. Instalando globalmente...${NC}"
    npm install -g serverless
else
    SLS_VERSION=$(serverless -v)
    echo -e "${GREEN}✓ Serverless Framework encontrado: $SLS_VERSION${NC}"
fi
echo ""

# Instalar dependências do projeto
echo "📚 Instalando dependências do projeto..."
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependências instaladas com sucesso${NC}"
else
    echo -e "${RED}❌ Erro ao instalar dependências${NC}"
    exit 1
fi
echo ""

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "🔧 Criando arquivo .env..."
    cp .env.example .env
    echo -e "${GREEN}✓ Arquivo .env criado. Por favor, configure suas credenciais AWS${NC}"
    echo -e "${YELLOW}⚠ Edite o arquivo .env antes de fazer o deploy${NC}"
else
    echo -e "${GREEN}✓ Arquivo .env já existe${NC}"
fi
echo ""

# Verificar configuração AWS
echo "🔑 Verificando credenciais AWS..."
if aws sts get-caller-identity &> /dev/null; then
    echo -e "${GREEN}✓ Credenciais AWS configuradas${NC}"
    aws sts get-caller-identity
else
    echo -e "${YELLOW}⚠ Credenciais AWS não configuradas${NC}"
    echo "   Configure com: aws configure"
    echo "   Você precisará de:"
    echo "   - AWS Access Key ID"
    echo "   - AWS Secret Access Key"
    echo "   - Default region name (ex: us-east-1)"
fi
echo ""

# Resumo
echo "================================================================"
echo "✨ Configuração Inicial Completa!"
echo "================================================================"
echo ""
echo "📝 Próximos Passos:"
echo ""
echo "1. Configure suas credenciais AWS (se ainda não fez):"
echo "   ${GREEN}aws configure${NC}"
echo ""
echo "2. Revise o arquivo serverless.yml:"
echo "   - Região AWS (padrão: us-east-1)"
echo "   - Stage (padrão: dev)"
echo ""
echo "3. Faça o deploy para desenvolvimento:"
echo "   ${GREEN}npm run deploy:dev${NC}"
echo "   ou"
echo "   ${GREEN}serverless deploy${NC}"
echo ""
echo "4. Teste os endpoints criados"
echo ""
echo "📚 Documentação:"
echo "   - README.md - Visão geral do projeto"
echo "   - docs/API.md - Documentação da API"
echo "   - docs/ARQUITETURA.md - Detalhes da arquitetura"
echo "   - docs/DEPLOY.md - Guia completo de deploy"
echo "   - docs/ESTRUTURA.md - Estrutura de pastas"
echo ""
echo "🚀 Scripts disponíveis:"
echo "   ${GREEN}npm run deploy:dev${NC}     - Deploy em desenvolvimento"
echo "   ${GREEN}npm run deploy:prod${NC}    - Deploy em produção"
echo "   ${GREEN}npm run logs:api${NC}       - Ver logs da API Lambda"
echo "   ${GREEN}npm run logs:processor${NC} - Ver logs do Processador"
echo "   ${GREEN}npm run remove${NC}         - Remover infraestrutura"
echo ""
echo "================================================================"
echo "💡 Dica: Execute 'npm run deploy:dev' para fazer seu primeiro deploy"
echo "================================================================"
