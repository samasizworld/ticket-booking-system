# 🎟 Ticket Booking System – Take Home Assignment

## Overview

This repository contains an end-to-end **ticket booking system** built as part of a take-home assignment.

The goal of this project is to demonstrate:
- Correctness under concurrency
- Scalable system design thinking
- Clean, readable TypeScript code
- A simple but usable UI

The system allows users to browse tickets, reserve multiple tickets, and simulate payment — while **strictly preventing double-booking**, even under race conditions.

---

## 📁 Folder Structure

This is the project folder structure for the Ticket Booking System:

```
.
├── README.md
├── docker-compose.yml
├── tbs-backend
│ ├── README.md
│ ├── eslint.config.mjs
│ ├── nest-cli.json
│ ├── package-lock.json
│ ├── package.json
│ ├── src
│ │ ├── app.controller.spec.ts
│ │ ├── app.controller.ts
│ │ ├── app.module.ts
│ │ ├── app.service.ts
│ │ ├── main.ts
│ │ ├── migration
│ │ └── ticket
│ ├── test
│ │ ├── app.e2e-spec.ts
│ │ └── jest-e2e.json
│ ├── tsconfig.build.json
│ └── tsconfig.json
└── tbs-frontend
├── README.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│ ├── file.svg
│ ├── globe.svg
│ ├── next.svg
│ ├── vercel.svg
│ └── window.svg
├── src
│ └── app
└── tsconfig.json

```

### Notes

- `tbs-backend` → NestJS backend written in TypeScript  
  - Contains modules, controllers, services, migrations, and tests  
- `tbs-frontend` → Next.js frontend written in TypeScript  
  - Contains pages, components, styles, and public assets  
- `docker-compose.yml` → For database in docker container 
- Node modules and build artifacts are excluded for readability  

---


### Data Store
- PostgreSQL (transactional, row-level locking)

### Out of Scope (by design)
- Authentication / user management
- Real payment provider integration
- Multi-region deployment (discussed only)

---

## Functional Requirements

### Ticket Catalog & Pricing
| Tier | Price |
|----|----|
| VIP | $100 |
| Front Row | $50 |
| General Admission (GA) | $10 |

- Tickets are modeled as **individual records**, not counters
- Each ticket has a lifecycle: `available → reserved → sold`

---

### Ticket Browsing
- View all tickets
- Filter by tier using dropdown:
  - All
  - VIP
  - Front Row
  - GA
- Clear availability indicators

---

### Booking Flow
1. User selects one or more available tickets
2. User reserves tickets (atomic operation)
3. Payment is simulated
4. On confirmation → tickets are marked as sold
5. On cancellation → tickets are released back to available

---

### No Double-Booking (Critical)
- Two users **cannot** reserve the same ticket
- Race conditions are handled safely at the database level

---

### Global Users
- Users can book from any country
- Currency is displayed in **USD**
- All timestamps are stored in **UTC**

---

## Non-Functional Requirements

> The following are **design discussions**, not fully implemented infrastructure.

### Availability Target – 99.99%

To achieve four-nines availability in production:

- Stateless backend services behind a load balancer
- PostgreSQL in multi-AZ setup with automatic failover
- Read replicas for ticket browsing
- Health checks + autoscaling

---

### Scale Assumptions
- ~1,000,000 Daily Active Users
- ~50,000 concurrent users during peak

Design considerations:
- Horizontal scaling of backend services
- Connection pooling
- Cached reads for browsing
- Isolated booking endpoints

---

### Performance Target
- Booking request **p95 < 500ms**

Achieved by:
- Short-lived DB transactions
- Indexed ticket tables
- No external network calls in booking path
- Minimal payloads

---

## Concurrency & Consistency (Key Design)

### How Double-Booking Is Prevented

The backend uses **database transactions with row-level locking**:

1. Begin transaction
2. Select requested tickets using `SELECT ... FOR UPDATE`
3. Verify all tickets are `available`
4. Mark tickets as `reserved`
5. Commit transaction

If any ticket is already reserved or sold:
- The transaction fails safely
- No partial reservation occurs

This approach guarantees correctness even under heavy concurrent load.

> Inline comments in the backend code explain this logic explicitly.

---

## API Overview

### Fetch Tickets

GET /tickets


### Reserve Tickets

POST /tickets/reserve
{
"ticketIds": ["uuid-1", "uuid-2"]
}


### Confirm Payment

POST /tickets/confirm-payment
{
"paymentToken": "token",
"paymentStatus": "confirmed | cancelled"
}


---

## Running the Project Locally

docker compose up -d

### Backend Setup

```bash
cd tbs-backend
npm install


Create a .env.local file:

DB_URL=postgresql://tbs_user:tbs_password_123@localhost:5443/tbs_db


Run migrations / seed data (example):

npm run migration:generate
npm run migration:run
npm run seed


Start backend:
npm run start:dev

```

Backend runs at:
http://localhost:3000 


### Frontend Setup
cd tbs-frontend

```bash
npm install
npm run dev
```
Frontend runs at:
http://localhost:3001