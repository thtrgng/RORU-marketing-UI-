# RORU Marketing UI

Web interface for the RORU caption writing assistant.

## Setup

```bash
npm install
cp .env.example .env.local
# fill in .env.local with real values
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `GITHUB_TOKEN` | PAT with write access to Repo B |
| `GITHUB_REPO_OWNER` | Repo B owner (e.g. `thtrgng`) |
| `GITHUB_REPO_NAME` | Repo B name (e.g. `RORU-content-writer-`) |
| `AUTH_USERNAME` | Login username (set to `roru`) |
| `AUTH_PASSWORD` | Login password (set to `roru`) |
| `SESSION_SECRET` | Random 32+ char string for cookie encryption |

## Deploy

Connect this repo to Vercel. Add all environment variables in the Vercel dashboard. Build command is `npm run build`.
