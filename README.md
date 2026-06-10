# Property Platform Backend

A production-ready backend system for a high-traffic property platform built with Node.js, TypeScript, PostgreSQL, Redis, and BullMQ.

## Tech Stack
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Cache & Queue:** Redis + BullMQ
- **CMS:** WordPress Headless + WPGraphQL
- **Deployment:** Docker, PM2, Nginx

## Features
- REST API for property enquiries
- Duplicate prevention via idempotency keys
- Async CRM sync via BullMQ queue
- Dead-letter queue for failed jobs
- WordPress/WPGraphQL integration with Redis caching
- Rate limiting & input validation
- HMAC webhook signature verification
- Production-ready error handling & logging

## Prerequisites
- Node.js v18+
- Docker Desktop
- Git

## Local Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd property-platform
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 4. Start Docker containers
```bash
docker compose up -d
```

### 5. Start the server
```bash
npm run dev
```

### 6. Test health check
```bash
curl http://localhost:3000/health
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| POST | /api/enquiry | Create enquiry |
| GET | /api/enquiry/:id | Get enquiry by ID |
| GET | /api/enquiries | Paginated enquiry list |
| POST | /api/webhook/crm | CRM webhook |
| GET | /api/wp/properties | Get WordPress properties |
| GET | /api/wp/properties/:slug | Get property by slug |
| POST | /api/wp/cache/invalidate | Invalidate WP cache |

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 3000) |
| DB_HOST | PostgreSQL host |
| DB_PORT | PostgreSQL port |
| DB_NAME | Database name |
| DB_USER | Database user |
| DB_PASS | Database password |
| REDIS_HOST | Redis host |
| REDIS_PORT | Redis port |
| REDIS_PASS | Redis password |
| WP_GRAPHQL_URL | WordPress GraphQL endpoint |
| JWT_SECRET | JWT signing secret |
| WEBHOOK_SECRET | HMAC webhook secret |

## Scripts

```bash
npm run dev      # Development with hot reload
npm run build    # Compile TypeScript
npm start        # Run compiled code
```

## Project Structure
```
src/
├── config/          # Database, Redis, Logger
├── controllers/     # Request handlers
├── middlewares/     # Auth, validation, rate limit, cache
├── queues/          # BullMQ workers
├── routes/          # API routes
└── services/        # WordPress service

> Note: WordPress/WPGraphQL integration tested locally on http://localhost:8080. 
> WPGraphQL endpoint: http://localhost:8080/graphql
```