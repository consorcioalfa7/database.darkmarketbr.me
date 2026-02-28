# DarkToolsLabs DataBase

<div align="center">

![DarkToolsLabs DataBase](https://img.shields.io/badge/DarkToolsLabs-DataBase-10b981?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma)
![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)

**Sistema de gerenciamento de sites e BINs com IA integrada**

[Demo](https://database.darkmarketbr.me) • [Telegram](https://t.me/DarkToolsLabs) • [Discord](https://discord.gg/YcY3eFfe)

</div>

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológico](#-stack-tecnológico)
- [Instalação Local](#-instalação-local)
- [Deploy na Vercel](#-deploy-na-vercel)
- [Configuração do Banco de Dados](#-configuração-do-banco-de-dados)
- [Alimentação da Base de Dados](#-alimentação-da-base-de-dados)
- [Configuração da IA](#-configuração-da-ia)
- [PWA - Instalação Mobile](#-pwa---instalação-mobile)
- [API Reference](#-api-reference)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Visão Geral

DarkToolsLabs DataBase é um sistema completo para gerenciamento de sites, gateways de pagamento e BINs, com assistente IA integrado para análise de dados e consultas.

### Principais Casos de Uso

- 📊 **Gerenciamento de Sites**: Cadastro, edição e organização de sites por categoria, plataforma e gateway
- 💳 **Dicionário de BINs**: Base de conhecimento de BINs por comércio/plataforma
- 🤖 **Assistente IA**: Chat inteligente e análise automática de dados brutos
- 📱 **PWA**: Instalável como app nativo em dispositivos móveis

---

## ✨ Funcionalidades

### Gerenciamento de Sites
- ✅ CRUD completo (Criar, Ler, Atualizar, Deletar)
- ✅ Importação em massa via texto formatado
- ✅ Filtros por status, categoria e gateway
- ✅ Busca avançada (URL, categoria, gateway, BIN)
- ✅ Status de verificação (Verificado, Info Externa, Desativado)

### Dicionário de BINs
- ✅ CRUD completo de referências de BINs
- ✅ Importação em massa
- ✅ Cópia rápida com um clique
- ✅ Busca por nome ou número de BIN

### Assistente IA
- ✅ **Chat**: Converse naturalmente sobre a base de dados
- ✅ **Análise**: Extração automática de dados de texto não estruturado
- ✅ **Suporte Multi-Modelo**: ZAI (padrão) ou OpenRouter (Claude, GPT, Llama, Gemini)

### PWA (Progressive Web App)
- ✅ Instalável em iOS e Android
- ✅ Funciona offline (dados em cache)
- ✅ Notificações push (configurável)
- ✅ Interface otimizada para mobile

---

## 🛠️ Stack Tecnológico

| Categoria | Tecnologia |
|-----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Linguagem** | TypeScript 5 |
| **Estilização** | Tailwind CSS 4 |
| **Componentes** | shadcn/ui (Radix) |
| **Banco de Dados** | Prisma ORM (SQLite/PostgreSQL/MySQL) |
| **Runtime** | Bun |
| **IA** | Z-AI SDK / OpenRouter API |
| **Deploy** | Vercel |

---

## 💻 Instalação Local

### Pré-requisitos

- [Bun](https://bun.sh) >= 1.0.0
- Node.js >= 18 (para compatibilidade)
- Git

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/darktools-labs-db.git
cd darktools-labs-db

# 2. Instale as dependências
bun install

# 3. Configure as variáveis de ambiente
cp .env.example .env

# 4. Edite o arquivo .env com suas configurações
# DATABASE_URL="file:./db/custom.db"  # SQLite (padrão)

# 5. Execute as migrações do banco
bun run db:push

# 6. Inicie o servidor de desenvolvimento
bun run dev

# Acesse: http://localhost:3000
```

---

## 🚀 Deploy na Vercel

### Método 1: Via GitHub (Recomendado)

#### Passo 1: Preparar o Repositório

```bash
# Inicialize o git (se ainda não estiver)
git init

# Adicione o remote
git remote add origin https://github.com/seu-usuario/darktools-labs-db.git

# Commit inicial
git add .
git commit -m "Initial commit - DarkToolsLabs DataBase"

# Push para o GitHub
git push -u origin main
```

#### Passo 2: Conectar ao Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New..."** → **"Project"**
3. Selecione o repositório `darktools-labs-db`
4. Clique em **"Import"**

#### Passo 3: Configurar Variáveis de Ambiente

Na seção **"Environment Variables"**, adicione:

```env
# Obrigatório
DATABASE_URL=postgresql://user:password@host:5432/database

# Opcional - Para IA com OpenRouter
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# Opcional - Domínio customizado
NEXT_PUBLIC_DOMAIN=database.darkmarketbr.me
```

#### Passo 4: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. Acesse a URL gerada!

### Método 2: Via Vercel CLI

```bash
# Instale o Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy para produção
vercel --prod

# Configure variáveis de ambiente
vercel env add DATABASE_URL
vercel env add AI_PROVIDER
vercel env add OPENROUTER_API_KEY
```

### Domínio Customizado

1. No dashboard do Vercel, vá em **Settings** → **Domains**
2. Adicione: `database.darkmarketbr.me`
3. Configure os registros DNS:
   ```
   Tipo: A
   Nome: database
   Valor: 76.76.21.21
   
   -ou-
   
   Tipo: CNAME
   Nome: database
   Valor: cname.vercel-dns.com
   ```

---

## 🗄️ Configuração do Banco de Dados

### Opção 1: SQLite (Desenvolvimento)

```env
DATABASE_URL="file:./db/custom.db"
```

✅ Zero configuração
✅ Ideal para desenvolvimento local
❌ Não funciona na Vercel (arquivo não persiste)

### Opção 2: Supabase (Recomendado para Produção)

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **Project Settings** → **Database**
4. Copie a **Connection string** (URI)

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

✅ Plano gratuito generoso
✅ PostgreSQL completo
✅ Backup automático
✅ Dashboard de administração

### Opção 3: Neon (Serverless PostgreSQL)

1. Acesse [neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Copie a connection string

```env
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST].neon.tech/[DATABASE]?sslmode=require"
```

✅ Serverless (scale-to-zero)
✅ Branches de banco de dados
✅ Plano gratuito

### Opção 4: PlanetScale (MySQL Serverless)

1. Acesse [planetscale.com](https://planetscale.com)
2. Crie um novo banco
3. Obtenha as credenciais

```env
DATABASE_URL="mysql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslaccept=strict"
```

⚠️ Nota: PlanetScale não suporta foreign keys por padrão

### Opção 5: Railway

1. Acesse [railway.app](https://railway.app)
2. Crie um novo projeto → PostgreSQL
3. Copie a URL de conexão

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST].railway.app:[PORT]/railway"
```

---

## 📥 Alimentação da Base de Dados

### Método 1: Importação Manual via Interface

#### Sites
1. Clique em **"Importar Sites"**
2. Cole os dados no formato:
   ```
   www.site.com.br - CATEGORIA - PLATAFORMA - GATEWAY
   www.exemplo.com - INFORMÁTICA - NUVEM SHOP - PagBank
   ```
3. Clique em **"Processar e Gravar"**

#### BINs
1. Abra o **"Dicionário de BINs"**
2. Clique em **"Importar BINs"**
3. Cole no formato:
   ```
   Amazon - 553636, 498408, 552640
   Netflix - 546479, 548262, 407843
   ```
4. Clique em **"Processar e Gravar"**

### Método 2: Via API (curl)

```bash
# Importar sites
curl -X POST https://database.darkmarketbr.me/api/bulk-import \
  -H "Content-Type: application/json" \
  -d '{
    "sites": [
      {"url": "www.site1.com", "category": "INFORMÁTICA", "platform": "NUVEM SHOP", "gateway": "PagBank"},
      {"url": "www.site2.com", "category": "CELULARES", "platform": "SHOPIFY", "gateway": "PagarMe"}
    ]
  }'

# Importar BINs
curl -X POST https://database.darkmarketbr.me/api/bins-bulk-import \
  -H "Content-Type: application/json" \
  -d '{
    "bins": [
      {"name": "Amazon", "bins": "553636, 498408"},
      {"name": "Netflix", "bins": "546479, 548262"}
    ]
  }'
```

### Método 3: Via Script (Bun)

Crie um arquivo `scripts/seed.ts`:

```typescript
import { db } from '../src/lib/db';

async function seed() {
  // Criar sites
  const sites = await db.site.createMany({
    data: [
      { url: 'www.site1.com', category: 'INFORMÁTICA', platform: 'NUVEM SHOP', gateway: 'PagBank', status: 'Ativo (Verificado)' },
      { url: 'www.site2.com', category: 'CELULARES', platform: 'SHOPIFY', gateway: 'PagarMe', status: 'Ativo (Verificado)' },
    ],
    skipDuplicates: true,
  });

  // Criar BINs
  const bins = await db.knownBin.createMany({
    data: [
      { name: 'Amazon', bins: '553636, 498408, 552640' },
      { name: 'Netflix', bins: '546479, 548262, 407843' },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ ${sites.count} sites criados`);
  console.log(`✅ ${bins.count} BINs criados`);
}

seed()
  .catch(console.error)
  .finally(() => process.exit());
```

Execute:
```bash
bun run scripts/seed.ts
```

### Método 4: Importar de CSV

```bash
# Instale dependência
bun add csv-parser

# Crie scripts/import-csv.ts
```

```typescript
import fs from 'fs';
import csv from 'csv-parser';
import { db } from '../src/lib/db';

async function importCSV(file: string) {
  const results: any[] = [];
  
  return new Promise((resolve) => {
    fs.createReadStream(file)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        const sites = results.map(row => ({
          url: row.url,
          category: row.category || 'Outros',
          platform: row.platform || 'Desconhecida',
          gateway: row.gateway || 'Desconhecido',
          status: row.status || 'Ativo (Verificado)',
        }));
        
        await db.site.createMany({ data: sites, skipDuplicates: true });
        console.log(`✅ ${sites.length} sites importados`);
        resolve(true);
      });
  });
}

importCSV('data/sites.csv');
```

---

## 🤖 Configuração da IA

### Opção 1: Z-AI (Padrão - Gratuito)

Sem configuração necessária! Funciona out-of-the-box.

```env
AI_PROVIDER="zai"
```

### Opção 2: OpenRouter (Multi-Modelo)

#### Obter API Key

1. Acesse [openrouter.ai](https://openrouter.ai)
2. Crie uma conta
3. Vá em **Keys** → **Create Key**
4. Copie a chave

#### Configurar Variáveis

```env
AI_PROVIDER="openrouter"
OPENROUTER_API_KEY="sk-or-v1-xxxxxxxxxxxx"
```

#### Escolher Modelo

```env
# Melhor qualidade (mais caro)
OPENROUTER_MODEL="anthropic/claude-3.5-sonnet"

# Rápido e barato
OPENROUTER_MODEL="anthropic/claude-3-haiku"

# GPT-4o
OPENROUTER_MODEL="openai/gpt-4o"

# GPT-4o Mini (econômico)
OPENROUTER_MODEL="openai/gpt-4o-mini"

# Llama 3.1 (Open Source)
OPENROUTER_MODEL="meta-llama/llama-3.1-70b-instruct"

# Gemini Pro
OPENROUTER_MODEL="google/gemini-pro-1.5"
```

#### Modelos Recomendados por Uso

| Uso | Modelo | Custo |
|-----|--------|-------|
| **Análise de dados complexos** | `anthropic/claude-3.5-sonnet` | $$$ |
| **Chat geral** | `openai/gpt-4o-mini` | $ |
| **Alta velocidade** | `anthropic/claude-3-haiku` | $ |
| **Open source** | `meta-llama/llama-3.1-70b-instruct` | $$ |
| **Contexto longo** | `google/gemini-pro-1.5` | $$ |

### Verificar Configuração

```bash
# Verificar status da IA
curl https://database.darkmarketbr.me/api/ai

# Resposta esperada:
{
  "provider": "openrouter",
  "model": "anthropic/claude-3.5-sonnet",
  "configured": true
}
```

---

## 📱 PWA - Instalação Mobile

### iOS (iPhone/iPad)

1. Abra o Safari
2. Acesse `https://database.darkmarketbr.me`
3. Toque no botão **Compartilhar** (ícone de seta)
4. Role para baixo e toque em **"Adicionar à Tela de Início"**
5. Dê um nome e toque em **"Adicionar"**

### Android

1. Abra o Chrome
2. Acesse `https://database.darkmarketbr.me`
3. Toque no menu (três pontos) no canto superior
4. Toque em **"Adicionar à tela inicial"** ou **"Instalar app"**
5. Confirme a instalação

### Recursos do PWA

- ✅ Ícone na tela inicial
- ✅ Abre em tela cheia (sem barra do navegador)
- ✅ Funciona offline (dados em cache)
- ✅ Notificações push (quando habilitado)
- ✅ Splash screen personalizada

---

## 🔌 API Reference

### Sites

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/sites` | Lista todos os sites |
| `POST` | `/api/sites` | Cria um novo site |
| `GET` | `/api/sites/:id` | Obtém um site específico |
| `PUT` | `/api/sites/:id` | Atualiza um site |
| `DELETE` | `/api/sites/:id` | Remove um site |
| `POST` | `/api/bulk-import` | Importa múltiplos sites |

### BINs

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/bins` | Lista todos os BINs |
| `POST` | `/api/bins` | Cria uma nova referência |
| `GET` | `/api/bins/:id` | Obtém uma referência |
| `PUT` | `/api/bins/:id` | Atualiza uma referência |
| `DELETE` | `/api/bins/:id` | Remove uma referência |
| `POST` | `/api/bins-bulk-import` | Importa múltiplos BINs |

### IA

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/ai` | Status da configuração IA |
| `POST` | `/api/ai` | Chat ou análise |

#### Exemplo: Chat com IA

```bash
curl -X POST /api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "action": "chat",
    "messages": [
      {"role": "user", "content": "Quantos sites ativos temos?"}
    ]
  }'
```

#### Exemplo: Análise de Dados

```bash
curl -X POST /api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "action": "analyze",
    "data": "Cole qualquer texto com URLs, BINs, etc..."
  }'
```

---

## 📁 Estrutura do Projeto

```
darktools-labs-db/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── public/
│   ├── icons/                  # Ícones para PWA
│   ├── screenshots/            # Screenshots para loja
│   ├── manifest.json           # Manifest PWA
│   ├── sw.js                   # Service Worker
│   └── offline.html            # Página offline
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── sites/          # CRUD de sites
│   │   │   ├── bins/           # CRUD de BINs
│   │   │   ├── bulk-import/    # Importação sites
│   │   │   ├── bins-bulk-import/ # Importação BINs
│   │   │   └── ai/             # API de IA
│   │   ├── globals.css         # Estilos globais
│   │   ├── layout.tsx          # Layout raiz
│   │   └── page.tsx            # Página principal
│   ├── components/ui/          # Componentes shadcn/ui
│   └── lib/
│       └── db.ts               # Cliente Prisma
├── .env.example                # Exemplo de variáveis
├── vercel.json                 # Config Vercel
├── next.config.ts              # Config Next.js
├── tailwind.config.ts          # Config Tailwind
└── package.json
```

---

## 🔧 Troubleshooting

### Erro: "Cannot read properties of undefined (reading 'findMany')"

**Causa**: Prisma Client não foi gerado

**Solução**:
```bash
bun run db:generate
bun run db:push
```

### Erro: "Environment variable DATABASE_URL not found"

**Causa**: Variável de ambiente não configurada

**Solução**: Crie o arquivo `.env` com:
```env
DATABASE_URL="file:./db/custom.db"
```

### PWA não instala no iOS

**Causa**: Safari requer HTTPS

**Solução**: Use HTTPS em produção (Vercel fornece automaticamente)

### IA não responde

**Causa**: OpenRouter API Key inválida ou não configurada

**Solução**: Verifique as variáveis:
```bash
# Teste a API
curl https://database.darkmarketbr.me/api/ai
```

### Build falha na Vercel

**Causa**: Problema com Prisma em serverless

**Solução**: Adicione ao `vercel.json`:
```json
{
  "buildCommand": "prisma generate && next build"
}
```

---

## 📞 Suporte

- **Telegram**: [@DarkToolsLabs](https://t.me/DarkToolsLabs)
- **Discord**: [discord.gg/YcY3eFfe](https://discord.gg/YcY3eFfe)
- **DarkMarket**: [@DarkMarket_Oficial](https://t.me/DarkMarket_Oficial)

---

## 📄 Licença

Este projeto é de uso privado e exclusivo da DarkToolsLabs.

---

<div align="center">

**Powered by [@DarkMarket_Oficial](https://t.me/DarkMarket_Oficial)**

</div>
