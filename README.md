# mail-server

Independent Express API for TifinaghTrails contact and booking emails.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The API runs on `http://localhost:5174` by default.

## Endpoints

- `GET /api/health`
- `POST /api/contact`
- `POST /api/booking`

Keep the real `.env` file private. It contains SMTP credentials and is ignored by git.
