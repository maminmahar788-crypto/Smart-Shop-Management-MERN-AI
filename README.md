# Smart Shop Management System (MERN + AI)

Local-first starter application for retail inventory, point-of-sale sales, expenses, PDF invoices, reports and AI-assisted shop insights. No deployment or GitHub push is required.

## Requirements
- Node.js LTS (Node 18+ recommended)
- MongoDB Community Server running locally
- Current browser
- Optional: OpenAI API key for LLM-powered AI answers. Rule-based insights work without a key.
- Optional: SMTP credentials for email; helper is included but automatic email triggers are not wired into the UI yet.

## Setup on Windows PowerShell

### Backend (terminal 1)
```powershell
cd server
Copy-Item .env.example .env
npm install
```
Edit `server/.env`, especially set a long random `JWT_SECRET`. Keep MongoDB local unless you know how to secure a remote database. Optional AI settings: `OPENAI_API_KEY`, `OPENAI_MODEL`.

Start MongoDB, then insert demo admin and sample products:
```powershell
npm run seed
```
Demo login: `admin@shop.local` / `ShopAdmin123!`

Start the API:
```powershell
npm run dev
```
Health check: http://localhost:5000/api/health

### Frontend (terminal 2, from project root)
```powershell
cd client
Copy-Item .env.example .env
npm install
npm run dev
```
Open http://localhost:5173

## Included
- JWT login and role middleware (admin, manager, cashier)
- Product create/list/search/archive, SKU uniqueness and low-stock thresholds
- POS checkout, stock deduction, recorded sales and PDF invoices
- Sales history and top-products report
- Expense entry and monthly summary
- AI endpoint with rule-based fallback; OpenAI API used only when configured
- Manual inventory adjustment API for admin/manager
- Optional SMTP email service helper

## Limitations and safety
This is a runnable starter/MVP, not audited production software. Test with demo data before using real business records. Taxes, returns/refunds, supplier/customer CRUD, purchase orders, barcode scanning, complete stock movement audit logs, and full accounting are not implemented. Gross profit is an estimate based on saved sale prices and product cost prices; operating expenses are tracked separately. SMTP settings/helper exist, but automatic notification triggers are not wired into the UI. AI output is advisory; verify recommendations and do not send sensitive customer data to external AI without appropriate consent and safeguards. The demo password is public in this README; replace it before any non-demo use.

## API routes
- `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST /api/products`, `PUT/DELETE /api/products/:id`
- `POST /api/inventory/adjust`
- `GET/POST /api/sales`, `GET /api/sales/:id/pdf`
- `GET/POST /api/expenses`
- `GET /api/reports/summary`, `GET /api/reports/top-products`
- `GET /api/ai/insights?question=...`
