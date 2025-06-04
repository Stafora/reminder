# 📬 Reminder Service (Node.js, Express, Prisma, Redis, Docker)

A backend service built with **TypeScript**, **Express**, and **Prisma** for managing scheduled email reminders. Includes background jobs via **BullMQ**, email delivery with **Nodemailer**, Redis for queues, and full support for OpenAPI (Swagger).

## 🛠️ Tech Stack

- **Backend Framework:** Express.js (v5)
- **ORM:** Prisma
- **Queue:** BullMQ + Redis
- **Database:** PostgreSQL
- **Mailing:** Nodemailer
- **Validation:** Zod
- **Documentation:** Swagger (OpenAPI)
- **Testing:** Vitest, Supertest
- **Dev Tools:** Docker, ts-node-dev


## ⚙️ Requirements

- **Docker + Docker Compose**
- **Node.js v22.12.0** (for local dev without Docker, optional)
- **PostgreSQL & Redis** (via Docker)

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
https://github.com/Stafora/reminder.git
cd reminder
```

### 2️⃣ Setup environment variables

Create a `.env` file based on the `.env.example`:

```bash
cp .env.example .env
```

Update env with your values!!!

### 3️⃣ Start the service (Docker)

```bash
docker-compose up --build
```

This will:

- Spin up PostgreSQL + Redis
- Run migrations
- Start the Express app on `http://localhost:3000`

---

## 🔍 API Documentation

Swagger is available at:

```
http://localhost:3000/api/docs
```

It includes full schema validation powered by `zod-to-openapi`.

---

## 🧪 Testing

### Run unit and integration tests:

```bash
npm run test
```

Uses `vitest`, `supertest`, and mocks for Prisma & Nodemailer.

---

## ✅ Features

- ✅ REST API for creating, listing, and managing reminders
- ✅ Background job queue using Redis + BullMQ
- ✅ Email sending with Nodemailer (configurable SMTP)
- ✅ Swagger UI + OpenAPI docs
- ✅ Full testing setup: Unit, Integration
- ✅ Dockerized for local development

---

## 🐳 Docker Compose Services

| Service       | Port       |
|---------------|------------|
| Express App   | `3000`     |
| PostgreSQL    | `5432`     |
| Redis         | `6379`     |

