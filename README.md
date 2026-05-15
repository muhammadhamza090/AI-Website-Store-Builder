# AI Ecommerce Website Builder (MVP)

A full-stack MVP that generates business-specific ecommerce website JSON from a brief and renders it as a live preview.

## Tech

- Next.js (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma ORM
- Anthropic Claude API
- LangGraph workflow for strategy, design, content, products, validation, and revision

## Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment variables

Copy `.env.example` to `.env` and set:

- `DATABASE_URL`
- `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY`
- `ANTHROPIC_MODEL` or `CLAUDE_MODEL` (optional)

Default model:

```env
CLAUDE_MODEL=claude-sonnet-4-20250514
```

3. Generate the Prisma client

```bash
npx prisma generate
```

4. Create the database schema

```bash
npx prisma migrate dev
```

5. Start the app

```bash
npm run dev
```

Open:

- Home: `http://localhost:3000`
- Generate: `http://localhost:3000/generate`
- Dashboard: `http://localhost:3000/dashboard`

## Demo generation

```bash
npm run generate:demo
```

This calls the local API to generate an example site and prints the preview URL.
