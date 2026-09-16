# EstateHub Frontend

React CRM dashboard for **EstateHub** — manage agents, leads, and property listings.

## Stack
- React 18 + Vite
- React Router
- Axios (JWT bearer auth against the estatehub-backend API)

## Setup

```bash
cd estatehub-frontend
npm install
cp .env.example .env   # point VITE_API_URL at your backend
npm run dev              # http://localhost:5173
```

Make sure `estatehub-backend` is running first (default `http://localhost:5000`), and that `CLIENT_ORIGIN` in the backend's `.env` matches this app's URL for CORS.

## Pages
- **Login** — email/password sign-in against `/api/auth/login`
- **Dashboard** — totals for listings/leads and a pipeline-by-stage breakdown
- **Leads** — searchable, filterable CRM pipeline table with inline stage changes and a create/edit modal
- **Listings** — property table with status/type filters and a create/edit modal
- **Agents** — team directory; admins can remove agents

## Design
Warm paper background with a forest-green primary accent and clay-toned highlights, Fraunces for headings paired with Inter for body/data — aimed at feeling like trustworthy, established real-estate software rather than a generic SaaS template.

