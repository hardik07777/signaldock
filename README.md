# ⚓ SignalDock

**SignalDock** is a production-inspired webhook delivery platform designed for reliable, asynchronous event processing at scale. It accepts webhook events through a Fastify API, persists them in PostgreSQL using Prisma, queues delivery jobs with BullMQ, and processes outbound webhooks through dedicated workers with automatic retries, exponential backoff, and dead-letter queue support.

> Reliable Webhook Delivery • Queue-Based Processing • Production-Ready Architecture

---

## ✨ Features

### 🚀 Webhook Ingestion
- Receive webhook events through REST APIs
- Input validation and persistent event storage
- Event status tracking

### ⚙️ Asynchronous Processing
- BullMQ-powered job queues
- Dedicated worker service
- Non-blocking request handling

### 🔄 Reliable Delivery
- Automatic retry mechanism
- Exponential backoff strategy
- Delivery attempt history
- Failure handling

### 📦 Dead Letter Queue
- Permanently failed events moved to DLQ
- Prevents endless retries
- Supports replaying failed events

### 📊 Monitoring
- Delivery status endpoints
- Attempt history
- Event lifecycle tracking
- Health check endpoint

---

# 🏗 Architecture

```text
                Incoming Webhook
                       │
                       ▼
            +----------------------+
            |    Fastify API       |
            +----------+-----------+
                       │
          Store Event in PostgreSQL
                       │
                       ▼
                BullMQ Queue
                       │
             Redis Message Broker
                       │
                       ▼
            +----------------------+
            |  Worker Service      |
            +----------+-----------+
                       │
              Deliver HTTP Request
                       │
          ┌────────────┴────────────┐
          │                         │
      Success                  Failure
          │                         │
          ▼                         ▼
   Mark Delivered          Retry with Backoff
                                     │
                            Max Retries Reached
                                     │
                                     ▼
                             Dead Letter Queue
```

---

# 🛠 Tech Stack

## Backend

- Node.js
- TypeScript
- Fastify

## Queue

- BullMQ
- Redis

## Database

- PostgreSQL
- Prisma ORM

## Infrastructure

- Docker
- Docker Compose

---

# 📁 Project Structure

```text
SignalDock
│
├── apps
│   ├── api
│   │   ├── routes
│   │   ├── controllers
│   │   ├── services
│   │   └── plugins
│   │
│   └── worker
│       ├── processors
│       ├── queues
│       └── jobs
│
├── packages
│   └── shared
│       ├── env
│       ├── queue
│       └── types
│
├── prisma
│   ├── schema.prisma
│   └── migrations
│
├── docker-compose.yml
└── README.md
```

---

# 🔄 Event Lifecycle

```text
Webhook Request
       │
       ▼
Validate Payload
       │
       ▼
Store Event
(PostgreSQL)
       │
       ▼
Enqueue Job
(BullMQ)
       │
       ▼
Worker Processes Event
       │
       ▼
Deliver Webhook
       │
 ┌─────┴─────┐
 │           │
 ▼           ▼
Success    Failure
 │           │
 ▼           ▼
Complete   Retry
               │
               ▼
      Dead Letter Queue
```

---

# 🌐 API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/v1/webhook-events` | Create a webhook event |
| GET | `/v1/webhook-events/:id` | Fetch event details |
| GET | `/health` | Service health check |

---

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/signaldock.git

cd signaldock
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment

Copy the appropriate environment file.

```bash
cp .env.example .env
```

For Docker:

```bash
cp .env.docker.example .env
```

---

## 4. Generate Prisma Client

```bash
npm run prisma:generate
```

---

## 5. Run Database Migrations

```bash
npm run prisma:migrate:dev
```

---

## 6. Start Development

Run locally

```bash
npm run dev
```

Or start using Docker Compose

```bash
docker compose up --build
```

To use a custom environment file:

```bash
SIGNALDOCK_ENV_FILE=.env docker compose up --build
```


---

# 🚀 Future Improvements

- Prometheus Metrics
- Grafana Dashboard
- Webhook Replay UI
- Webhook Signing
- Rate Limiting
- Multiple Queue Priorities
- Event Filtering
- Email Notifications
- Web Dashboard
- Authentication & API Keys

---

# 🤝 Contributing

Contributions are welcome!

Fork the repository, create a feature branch, and submit a pull request.

For major changes, please open an issue first to discuss your proposal.

---

# 👨‍💻 Author

**Hardik Goel**

GitHub: https://github.com/hardik07777

Portfolio: https://portfolio-hardik07.vercel.app/

LinkedIn: https://linkedin.com/in/hardik-goel

---

# ⭐ Support

If you found SignalDock useful, consider giving the repository a ⭐ on GitHub.
