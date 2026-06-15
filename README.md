# Customer Requirement Management System

Full-stack starter for managing customers, requirements, users, roles, and audit history.

## Tech Stack

- React + Vite
- Spring Boot 3
- MySQL
- JWT authentication

## Roles

- `SUPER_ADMIN`: full access, including user and role administration
- `ADMIN`: manage customers and requirements, view audit trail
- `USER`: view customers and requirements, create/update requirements

## Project Layout

```text
customer-requirement-management-system/
  backend/      Spring Boot REST API
  frontend/     React application
  docker-compose.yml
```

## Run MySQL

```bash
docker compose up -d
```

## Run Backend

```bash
cd backend
mvn spring-boot:run
```

Default API URL: `http://localhost:8080/api`

Seeded account:

- Email: `superadmin@example.com`
- Password: `Admin@123`

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Default UI URL: `http://localhost:5173`

## Phase 2 Business Logic

Customer records include:

- Name
- Mobile
- Email
- Address
- Assigned User
- Created Date

Requirements are linked to customers with a many-to-one relationship. A customer can have multiple requirements, available through `GET /api/customers/{id}/requirements`.

## Phase 3 Inventory Module

Inventory can be uploaded from an Excel file at `POST /api/inventory/upload`.

Expected columns in the first sheet:

- Category
- Product
- Variant
- Quantity
- Price

Stock status is calculated automatically:

- `OUT_OF_STOCK`: quantity is `0` or blank
- `LOW_STOCK`: quantity is `1` through `10`
- `AVAILABLE`: quantity is greater than `10`

## Phase 4 Coupon & Collection Module

Coupon collection records include:

- Customer
- Coupon Available
- Coupon Number
- Coupon Value
- Product Value
- Additional Amount
- Collected Amount
- Collected By
- Collection Date

Additional Amount is calculated automatically by the backend:

```text
Additional Amount = Product Value - Coupon Value
```

## Phase 5 Audit Trail

Tracked actions include:

- Create Customer
- Update Customer
- Create Requirement
- Update Requirement
- Inventory Upload
- Status Change

Audit records store:

- Who performed the action
- What action happened
- When it happened
- Old Value
- New Value
- IP Address

## Notes

- Change `JWT_SECRET` before production use.
- `spring.jpa.hibernate.ddl-auto=update` is enabled for local development.
- Audit events are recorded for login, user, customer, and requirement changes.
