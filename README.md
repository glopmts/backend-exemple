# Como Hospedar um Backend Node.js na Vercel

Este guia completo explica como hospedar um backend Node.js na Vercel de forma eficiente e sem complicações.

## Índice

- [Pré-requisitos](#pré-requisitos)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração do Vercel](#configuração-do-vercel)
- [Configuração do package.json](#configuração-do-packagejson)
- [Funções Serverless vs API Routes](#funções-serverless-vs-api-routes)
- [Tratamento de Requisições](#tratamento-de-requisições)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Implantação na Vercel](#implantação-na-vercel)
- [Solução de Problemas Comuns](#solução-de-problemas-comuns)
- [Melhores Práticas](#melhores-práticas)

## Pré-requisitos

- Node.js (versão 14.x ou superior)
- npm ou yarn
- Conta na Vercel (gratuita)
- Git (opcional, mas recomendado)

## Estrutura do Projeto

Uma estrutura organizada facilita a manutenção e escalabilidade do seu backend:

```
meu-backend-node/
├── api/                  # Diretório para funções serverless
│   └── index.js          # Ponto de entrada principal da API
├── src/                  # Código fonte da aplicação
│   ├── controllers/      # Controladores da aplicação
│   ├── models/           # Modelos de dados
│   ├── routes/           # Definições de rotas
│   ├── services/         # Serviços da aplicação
│   └── utils/            # Funções utilitárias
├── dist/                 # Código compilado (para TypeScript)
│   └── index.js          # Arquivo de saída compilado
├── package.json          # Dependências e scripts
├── vercel.json           # Configuração da Vercel
└── README.md             # Documentação
```

## Configuração do Vercel

O arquivo `vercel.json` é essencial para configurar como sua aplicação será implantada:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/public/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/index.js"
    }
  ],
  "build": {
    "env": {
      "PRISMA_GENERATE": "true"
    }
  }
}
```

### Explicação das configurações:

- **version**: Versão da configuração da Vercel
- **builds**: Define como construir sua aplicação
  - **src**: Caminho para o arquivo principal da aplicação
  - **use**: Runtime a ser utilizado (no caso, Node.js)
- **routes**: Define como as requisições serão roteadas
  - **src**: Padrão de URL a ser correspondido
  - **dest**: Para onde a requisição será direcionada

## Configuração do package.json

Seu `package.json` deve incluir scripts para desenvolvimento e build:

```json
{
  "name": "backend-exemple",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "clean": "rmdir /s /q dist || echo.",
    "prebuild": "npm run clean",
    "build": "mkdir dist && xcopy /E /I src dist\\ && copy package.json dist\\"
  },
  "keywords": [],
  "author": "glopmts",
  "license": "ISC",
  "type": "commonjs",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^5.1.0"
  },
  "devDependencies": {
    "mkdirp": "^3.0.1",
    "nodemon": "^3.1.10"
  }
}
```

Para projetos TypeScript, adicione:

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "ts-node-dev --respawn src/index.ts"
  },
  "devDependencies": {
    "typescript": "^5.0.4",
    "ts-node-dev": "^2.0.0",
    "@types/express": "^4.17.17"
  }
}
```

## Funções Serverless vs API Routes

A Vercel oferece duas abordagens principais:

### 1. Funções Serverless

Coloque seus arquivos na pasta `/api` para que sejam tratados como funções serverless:

```javascript
// api/hello.js
export default function handler(req, res) {
  res.status(200).json({ message: "Olá do serverless!" });
}
```

### 2. Express com um único ponto de entrada

```javascript
// src/index.js
const express = require("express");
const app = express();

app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Olá do Express!" });
});

// Importante: Exporte o app para uso com serverless
module.exports = app;

// Para desenvolvimento local
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}
```

## Tratamento de Requisições

A Vercel adiciona propriedades auxiliares ao objeto de requisição para facilitar o tratamento:

```javascript
export default async function handler(req, res) {
  // Acesso direto ao corpo da requisição
  const { body } = req;

  // Resposta
  return res.status(200).json({
    message: `Olá ${body.name}, você acabou de analisar o corpo da requisição!`,
  });
}
```

## Variáveis de Ambiente

Para configurar variáveis de ambiente:

1. No painel da Vercel: Projeto > Settings > Environment Variables
2. Localmente: Crie um arquivo `.env.local` (não comite este arquivo)

Para acessar:

```javascript
// Acesso à variável de ambiente
const apiKey = process.env.API_KEY;
```

## Implantação na Vercel

### Método 1: CLI da Vercel

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Faça login
vercel login

# Implante
vercel
```

### Método 2: GitHub Integration

1. Faça push do seu código para um repositório GitHub
2. Acesse o dashboard da Vercel
3. Clique em "New Project"
4. Selecione o repositório
5. Configure as opções de build
6. Clique em "Deploy"

## Solução de Problemas Comuns

### Erro 404 ou 500

Se você encontrar erros 404 ou 500:

1. **Verifique o arquivo de saída**: Certifique-se de que o caminho no `vercel.json` corresponde ao arquivo de saída real.

2. **Crie um arquivo de entrada separado**: Se você tem apenas um `app.js`, crie um arquivo `index.js` ou `server.js` que importe e exporte seu app:

```javascript
// server.js
const app = require("./app");
module.exports = app;
```

3. **Regenere o build após mudanças**: A Vercel não regenera automaticamente o build. Execute `npm run build` antes de cada deploy.

### CORS

Para habilitar CORS:

```javascript
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});
```

## Melhores Práticas

1. **Use primitivos da Vercel**: Aproveite os recursos nativos da plataforma

2. **Organize funções serverless**: Divida sua API em funções menores para melhor performance

3. **Otimize o cold start**: Minimize dependências e use técnicas de lazy loading

4. **Monitore o desempenho**: Use o painel da Vercel para monitorar o desempenho

5. **Implemente cache**: Use cabeçalhos de cache para conteúdo estático

6. **Utilize o sistema de build**: Configure corretamente o `vercel.json` para otimizar o processo de build

7. **Teste localmente**: Use `vercel dev` para testar seu ambiente localmente antes de implantar

---

Com este guia, você deve ser capaz de hospedar com sucesso seu backend Node.js na Vercel. Se encontrar problemas, consulte a [documentação oficial da Vercel](https://vercel.com/docs) ou abra uma issue neste repositório.
