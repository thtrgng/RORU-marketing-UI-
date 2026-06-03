# RORU Marketing UI

## Business Requirements

- Build a web UI that wraps the RORU Content Writer system (Repo B) for non-technical RORU team members
- The UI mimics the Claude App interface: sidebar for chat history, main chat area, input box at bottom with image upload
- Users can chat with the system to write captions; system follows the multi-agent pipeline from Repo B (Image Router → Story Extractor → Caption Writer → QA Guard)
- Users can upload images, type briefs, get caption suggestions back
- Final captions can be saved, which pushes a new folder to Repo B's Posts/ directory via GitHub API
- Single shared login: id `roru`, password `roru`
- Model selector: user can choose Claude Sonnet 4.6, Claude Opus 4.6, or Claude Opus 4.7
- No multi-user accounts, no signup, no password reset

## Repository Boundary

- **This repo (Repo A — RORU-marketing-UI-)**: Next.js website source code only. UI components, auth, chat logic, API routes
- **Repo B (RORU-content-writer-)**: Knowledge files, agent SKILL.md files, brief templates, Posts/ folder
- Repo A reads Repo B knowledge files at build time (embedded into bundle)
- Repo A writes new Posts/ folders into Repo B at runtime via GitHub API
- Repo A does NOT modify any files in Repo B other than Posts/

## Technical Stack

- Next.js 15+ App Router, client-rendered chat interface
- TypeScript
- Tailwind CSS for styling
- shadcn/ui components where appropriate
- Anthropic SDK for chat completions (server-side route)
- Octokit for GitHub API writes
- iron-session for shared-account authentication
- No database, no ORM
- Deploy to Vercel

## Environment Variables

All secrets go through Vercel environment variables, never committed to repo:

- `ANTHROPIC_API_KEY` — Anthropic API key
- `GITHUB_TOKEN` — Personal Access Token with write access to Repo B
- `GITHUB_REPO_OWNER` — owner of Repo B (e.g. `thtrgng`)
- `GITHUB_REPO_NAME` — name of Repo B (e.g. `RORU-content-writer-`)
- `AUTH_USERNAME` — set to `roru`
- `AUTH_PASSWORD` — set to `roru`
- `SESSION_SECRET` — random 32+ char string for iron-session cookie encryption

## UI Layout (high-level)

```
┌─────────────┬──────────────────────────────────┐
│             │  Model selector (top right)      │
│  Sidebar    │                                  │
│             │  ┌────────────────────────────┐  │
│  - New chat │  │                            │  │
│  - History  │  │  Chat messages             │  │
│    (local)  │  │                            │  │
│             │  └────────────────────────────┘  │
│             │                                  │
│             │  ┌────────────────────────────┐  │
│             │  │ [Image] Type a message...  │  │
│             │  └────────────────────────────┘  │
└─────────────┴──────────────────────────────────┘
```

- Sidebar: list of past chats stored in browser localStorage
- Top right: model dropdown (Sonnet 4.6 default, Opus 4.6, Opus 4.7)
- Main: chat messages with markdown rendering, image thumbnails
- Bottom: input box with image upload button, send button
- Header: "RORU Marketing" logo + Logout button

## Branding

- Logo and brand: RORU
- Color palette pulled from Repo B's Brand Guidelines
- Background: dark navy / black (matches RORU brand)
- Accents: warm wood tones, restrained
- Typography: clean sans-serif (Inter)
- No emojis in UI labels or buttons (matches RORU brand voice rules)

## Pipeline Integration

When user sends a message, the API route at `/api/chat`:

1. Validates session (must be logged in)
2. Loads embedded knowledge files from `lib/content-system/` (built from Repo B)
3. Constructs system prompt: combines all 4 agent SKILL.md files + knowledge files
4. Sends to Anthropic API with chosen model, streaming response back
5. Streams response chunks to UI

When user clicks "Save caption":

1. Validates session
2. Calls `/api/save-caption` with: pipeline output, final caption, optional note
3. Server uses Octokit to create a new commit in Repo B:
   - Path: `Posts/[YYYY-MM-DD]_[ten-mon]/PIPELINE_OUTPUT.md`
   - Path: `Posts/[YYYY-MM-DD]_[ten-mon]/FINAL_POSTED.md`
   - Path: `Posts/[YYYY-MM-DD]_[ten-mon]/USER_INPUT.md` (only if note provided)
4. Returns success / failure to UI

## Authentication Flow

- `/login` page: simple form (id + password)
- POST `/api/auth/login` validates against `AUTH_USERNAME` / `AUTH_PASSWORD` env vars
- Sets encrypted iron-session cookie on success
- All other pages and API routes check session via middleware
- Logout clears cookie

## Coding Standards

1. Use latest stable versions of all libraries as of the build date
2. Keep it simple — no over-engineering, no unnecessary abstractions
3. No defensive programming for cases that cannot happen
4. Concise commit messages, concise README
5. No emojis in code, comments, commit messages, or UI text
6. TypeScript strict mode
7. Server actions for mutations where possible, API routes where streaming needed
8. Tailwind for styles, avoid inline styles
9. Component files small and focused

## Strategy

1. Write PLAN.md with phased success criteria (scaffolding, auth, chat UI, API integration, save flow, deployment, testing)
2. Execute the plan one phase at a time
3. After each phase: run tests, commit, push to GitHub
4. Final phase: deploy to Vercel and verify end-to-end with both repos connected
5. Only mark complete when a non-technical user can log in, chat, save a caption, and see it appear in Repo B's Posts/ folder
