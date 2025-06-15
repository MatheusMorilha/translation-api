# 🌐 Sistema de Tradução Assíncrona

Este projeto demonstra uma arquitetura de **microsserviços** para tradução de textos, utilizando **comunicação assíncrona** via **RabbitMQ** e persistência de dados com **MongoDB**. Ele é composto por uma **API REST** e um **serviço consumidor (Worker)**, orquestrados via **Docker Compose**.

---

## 🧩 Arquitetura do Projeto

O sistema é dividido nos seguintes componentes:

- **`translation-api`** (API REST):
  - Recebe requisições de tradução via HTTP.
  - Gera um `requestId` único.
  - Enfileira a solicitação no RabbitMQ.
  - Armazena o status inicial (`queued`) no MongoDB.
  - Retorna o `requestId` e o status inicial ao cliente.
  - Permite consultar o status e resultado da tradução pelo `requestId`.

- **`translation-worker`** (Serviço Consumidor):
  - Escuta a fila do RabbitMQ.
  - Atualiza o status para `processing`.
  - Simula a tradução do texto.
  - Atualiza o status para `completed` ou `failed`.
  - Salva o resultado no MongoDB.

- **`RabbitMQ`** (Broker de Mensagens):
  - Garante a comunicação assíncrona entre API e Worker.
  - As mensagens são persistidas para confiabilidade.

- **`MongoDB`** (Banco de Dados):
  - Armazena os dados da requisição:
    - Texto original
    - Idioma de destino
    - Texto traduzido
    - `requestId`
    - Status (`queued`, `processing`, `completed`, `failed`)
    - Timestamps (`createdAt`, `updatedAt`)

---

## 📁 Estrutura de Pastas

```
translation-system/          
├── translation-api/         
│   ├── src/
│   │   ├── config/rabbitmq.js
│   │   ├── controllers/translationController.js
│   │   ├── models/Translation.js
│   │   ├── routes/translationRoutes.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   ├── package.json
│   └── Dockerfile
├── translation-worker/      
│   ├── src/
│   │   ├── config/rabbitmq.js
│   │   ├── services/translationService.js
│   │   ├── worker.js
│   ├── .env
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

---

## 🔧 Pré-requisitos

- Docker Desktop (com Docker Engine e Docker Compose)

---

## ▶️ Como Rodar a Aplicação

### Subir os containers

```bash
cd translation-system
docker-compose up --build -d
```

### Verificar status dos containers

```bash
docker-compose ps
```

### Monitorar logs

```bash
docker-compose logs -f translation-api
docker-compose logs -f translation-worker
```

---

## 🧪 Como Testar a Aplicação

### 1. Enviar uma Requisição de Tradução

- **URL:** `http://localhost:3000/api/translations`  
- **Método:** `POST`  
- **Headers:** `Content-Type: application/json`  
- **Body:**

```json
{
  "originalText": "Olá, como está o dia hoje?",
  "targetLanguage": "en"
}
```

#### Curl:

```bash
curl -X POST      -H "Content-Type: application/json"      -d '{"originalText": "Olá, como está o dia hoje?", "targetLanguage": "en"}'      http://localhost:3000/api/translations
```

---

### 2. Consultar o Status da Tradução

- **URL:** `http://localhost:3000/api/translations/:requestId`  
- **Método:** `GET`

#### Curl:

```bash
curl http://localhost:3000/api/translations/UM_UUID_GERADO_AQUI
```

---

## ✅ Respostas Esperadas

- `queued`
- `processing`
- `completed`

---

## ⚠️ Observação

> A tradução é **simulada** com base em um **dicionário mock**.

---


---

## 📌 Exemplo de Requisição e Resposta

### 📤 Cadastro de uma Mensagem para Tradução

**Endpoint:** `POST /api/translations`  
**Requisição:**

```json
{
  "originalText": "Olá, como está o dia hoje?",
  "targetLanguage": "en"
}
```

**Resposta (imediata):**

```json
{
  "requestId": "8f14e45f-ea8a-4c89-a590-1de3dbf49caa",
  "status": "queued",
  "message": "Translation request received"
}
```

---

### ⚙️ Simulação do Fluxo Interno

#### MongoDB registra inicialmente:

```json
{
  "requestId": "8f14e45f-ea8a-4c89-a590-1de3dbf49caa",
  "originalText": "Olá, como está o dia hoje?",
  "targetLanguage": "en",
  "status": "queued",
  "createdAt": "2025-06-15T21:30:00.000Z",
  "updatedAt": "2025-06-15T21:30:00.000Z"
}
```

#### Worker atualiza para:

```json
{
  "status": "processing",
  "updatedAt": "2025-06-15T21:30:02.000Z"
}
```

#### Após simular a tradução:

```json
{
  "status": "completed",
  "translatedText": "Hello, how is the day today?",
  "updatedAt": "2025-06-15T21:30:04.000Z"
}
```

---

### 📥 Consulta do Resultado da Tradução

**Endpoint:** `GET /api/translations/8f14e45f-ea8a-4c89-a590-1de3dbf49caa`

**Resposta Final:**

```json
{
  "requestId": "8f14e45f-ea8a-4c89-a590-1de3dbf49caa",
  "originalText": "Olá, como está o dia hoje?",
  "translatedText": "Hello, how is the day today?",
  "targetLanguage": "en",
  "status": "completed",
  "createdAt": "2025-06-15T21:30:00.000Z",
  "updatedAt": "2025-06-15T21:30:04.000Z"
}
```


## 🧹 Parar e Limpar os Serviços

```bash
docker-compose down --volumes
```

---

## 📄 Licença

Este projeto é de uso educacional e pode ser modificado livremente para fins de aprendizado.
