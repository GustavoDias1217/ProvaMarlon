# 📝 Guia de Commit para GitHub

Este guia explica como fazer o commit inicial e subir o projeto para o GitHub.

## 🔍 Verificar Status Atual

```bash
cd /home/gustavodias/ProvaMarlon

# Ver status do git
git status

# Ver branch atual
git branch
```

## 📦 Adicionar Arquivos ao Commit

```bash
# Adicionar todos os arquivos criados
git add .

# Ou adicionar seletivamente
git add lambdas/
git add shared/
git add docs/
git add *.md
git add *.yml
git add *.json
git add *.sh
git add .gitignore
git add LICENSE
```

## ✅ Verificar Arquivos Adicionados

```bash
# Ver o que será commitado
git status

# Deve mostrar:
# On branch main (ou master)
# Changes to be committed:
#   new file:   lambdas/api-lambda/handler.js
#   new file:   lambdas/processador-lances/handler.js
#   new file:   shared/clients/dynamodb.js
#   ... (todos os arquivos)
```

## 💾 Fazer Commit

```bash
# Commit com mensagem descritiva
git commit -m "feat: implementar sistema completo de leilão online serverless

- Adicionar 2 Lambdas (API e Processador)
- Configurar infraestrutura AWS (DynamoDB, SQS, SNS)
- Implementar 5 endpoints REST
- Adicionar validação e tratamento de erros
- Criar documentação completa
- Configurar Dead Letter Queue
- Adicionar scripts de setup e testes

Tecnologias: AWS Lambda, DynamoDB, SQS, SNS, Serverless Framework
Arquitetura: Event-Driven, CQRS, Serverless"
```

## 🚀 Push para GitHub

### Se o repositório já existe no GitHub:

```bash
# Push para a branch principal
git push origin main

# Ou se for master
git push origin master

# Se precisar forçar (use com cuidado!)
git push -f origin main
```

### Se ainda não criou o repositório no GitHub:

1. **Criar repositório no GitHub:**
   - Acesse https://github.com/new
   - Nome: `leilao-online-serverless` ou `ProvaMarlon`
   - Descrição: "Sistema de Leilão Online Serverless com AWS Lambda, SQS, DynamoDB e SNS"
   - Público ou Privado (sua escolha)
   - **NÃO** marque "Initialize with README" (já temos um)
   - Clique em "Create repository"

2. **Conectar repositório local ao GitHub:**

```bash
# Se ainda não tem remote
git remote add origin https://github.com/GustavoDias1217/ProvaMarlon.git

# Ou se já existe, atualizar URL
git remote set-url origin https://github.com/GustavoDias1217/ProvaMarlon.git

# Verificar remote
git remote -v
```

3. **Fazer push inicial:**

```bash
# Push com upstream
git push -u origin main

# Ou se for master
git push -u origin master
```

## 🔐 Autenticação GitHub

### Opção 1: Personal Access Token (Recomendado)

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Marque:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
4. Copie o token gerado
5. Use no lugar da senha ao fazer push

### Opção 2: SSH Key

```bash
# Gerar chave SSH (se não tiver)
ssh-keygen -t ed25519 -C "seu-email@example.com"

# Adicionar ao ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copiar chave pública
cat ~/.ssh/id_ed25519.pub

# Adicionar no GitHub:
# Settings → SSH and GPG keys → New SSH key
# Cole a chave pública

# Trocar remote para SSH
git remote set-url origin git@github.com:GustavoDias1217/ProvaMarlon.git
```

## 📋 Checklist Antes do Commit

- [ ] Remover dados sensíveis (credenciais AWS, tokens, etc)
- [ ] Verificar `.gitignore` está funcionando
- [ ] Arquivo `.env` NÃO está sendo commitado
- [ ] `node_modules/` NÃO está sendo commitado
- [ ] `.serverless/` NÃO está sendo commitado
- [ ] Código está funcionando
- [ ] Documentação está atualizada
- [ ] README.md está completo

## 🎯 Commits Futuros (Boas Práticas)

### Formato de Mensagem

```
<tipo>: <descrição curta>

[corpo opcional - detalhes]

[rodapé opcional - breaking changes, issues]
```

### Tipos de Commit

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração de código
- `test:` Testes
- `chore:` Tarefas de build/config

### Exemplos

```bash
# Nova feature
git commit -m "feat: adicionar autenticação JWT"

# Correção de bug
git commit -m "fix: corrigir validação de data no leilão"

# Documentação
git commit -m "docs: atualizar guia de deploy"

# Refatoração
git commit -m "refactor: melhorar estrutura do validador de lances"

# Configuração
git commit -m "chore: atualizar dependências do projeto"
```

## 🌿 Branches Recomendadas

### Estrutura

```
main (ou master)     # Produção
  |
  ├─ develop        # Desenvolvimento
  |   |
  |   ├─ feature/autenticacao
  |   ├─ feature/pagamentos
  |   └─ feature/busca-avancada
  |
  ├─ staging        # Homologação
  |
  └─ hotfix/bug-critico
```

### Criar Nova Branch

```bash
# Criar e mudar para nova branch
git checkout -b develop

# Criar feature branch
git checkout -b feature/autenticacao

# Fazer commits na feature
git add .
git commit -m "feat: adicionar autenticação JWT"

# Voltar para develop
git checkout develop

# Merge da feature
git merge feature/autenticacao

# Push da branch
git push origin develop
```

## 🏷️ Tags (Versões)

```bash
# Criar tag de versão
git tag -a v1.0.0 -m "Release 1.0.0 - Sistema completo de leilão online"

# Push da tag
git push origin v1.0.0

# Push de todas as tags
git push origin --tags

# Listar tags
git tag -l
```

## 🔄 Atualizar do GitHub

```bash
# Buscar atualizações
git fetch origin

# Atualizar branch atual
git pull origin main

# Ver diferenças
git diff main origin/main
```

## 📊 Ver Histórico

```bash
# Ver commits
git log

# Ver commits de forma compacta
git log --oneline

# Ver commits com gráfico
git log --oneline --graph --all

# Ver últimos 10 commits
git log -10

# Ver mudanças em arquivo específico
git log -- lambdas/api-lambda/handler.js
```

## 🛡️ Verificações de Segurança

### Antes de Commitar

```bash
# Verificar se não há credenciais expostas
grep -r "AWS_ACCESS_KEY" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "AWS_SECRET" . --exclude-dir=node_modules --exclude-dir=.git

# Verificar .env não está no commit
git status | grep ".env"  # Não deve aparecer

# Verificar gitignore está funcionando
cat .gitignore
```

## 📝 .gitignore (Já Configurado)

Arquivo `.gitignore` já está configurado para ignorar:

```
node_modules/      # Dependências
.env               # Variáveis de ambiente
.env.local         # Env local
.serverless/       # Build serverless
.aws/              # Credenciais AWS
*.log              # Logs
.DS_Store          # MacOS
```

## 🚨 Troubleshooting

### Erro: "fatal: remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/GustavoDias1217/ProvaMarlon.git
```

### Erro: "Permission denied"

Configure Personal Access Token ou SSH key (ver acima)

### Erro: "Updates were rejected"

```bash
# Fazer pull primeiro
git pull origin main --rebase

# Resolver conflitos se houver
# Depois fazer push
git push origin main
```

### Desfazer Último Commit (Ainda Não Foi Push)

```bash
# Manter alterações
git reset --soft HEAD~1

# Descartar alterações
git reset --hard HEAD~1
```

## ✅ Comando Completo para Primeiro Commit

```bash
# Resumo completo:
cd /home/gustavodias/ProvaMarlon
git status
git add .
git commit -m "feat: implementar sistema completo de leilão online serverless

- Adicionar 2 Lambdas (API e Processador de Lances)
- Configurar infraestrutura AWS (DynamoDB, SQS, SNS, API Gateway)
- Implementar 5 endpoints REST completos
- Adicionar validação robusta de dados
- Criar documentação completa (3000+ linhas)
- Configurar Dead Letter Queue e retry
- Adicionar scripts de setup e testes
- Implementar padrões: Event-Driven, CQRS, Circuit Breaker

Total: 1200 linhas de código, 20+ arquivos
Tecnologias: AWS Lambda, DynamoDB, SQS, SNS, Serverless Framework"

git push -u origin main
```

## 🎉 Após o Push

Verifique no GitHub:
1. Todos os arquivos foram enviados
2. README.md está renderizado corretamente
3. Estrutura de pastas está correta
4. `.env` NÃO aparece no repositório

## 📱 GitHub Actions (CI/CD - Opcional)

Para configurar deploy automático, crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - name: Deploy
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: npm run deploy:prod
```

**Não esqueça de adicionar secrets no GitHub!**

---

## 🔗 Links Úteis

- [GitHub Docs](https://docs.github.com/)
- [Git Documentation](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Pronto para fazer seu primeiro commit!** 🚀

```bash
./git-commit.sh  # Execute este guia passo a passo
```
