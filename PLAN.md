# RORU Marketing UI — Build Plan

Execute one phase at a time. After completing each phase: run checks, commit with the suggested message, push to GitHub. Do not start the next phase until all success criteria for the current phase pass.

---

## Phase 0 — Project Scaffolding

### Tasks
1. Initialize Next.js 15 App Router with TypeScript, Tailwind, ESLint
2. Install dependencies: `@anthropic-ai/sdk`, `octokit`, `iron-session`, `clsx`, `lucide-react`
3. Set up Tailwind with RORU color tokens (dark navy `#0a0e1a` background, warm accents)
4. Create folder structure:
   - `app/` — pages and routes
   - `app/api/` — API routes
   - `components/` — React components
   - `lib/` — server utilities, auth, anthropic client, github client
   - `lib/content-system/` — placeholder for Repo B knowledge files (Phase 4)
   - `types/` — TypeScript types
5. Create `.gitignore` (node_modules, .next, .env*, .DS_Store)
6. Create `.env.example` listing all required variables, no values
7. Create minimal `README.md`: setup steps, env vars list, deploy instructions

### Success Criteria
- `npm run dev` starts without errors
- Default Next.js page renders at `http://localhost:3000`
- `.env.example` lists all 7 environment variables
- `.gitignore` excludes `.env`, `.env.local`, `node_modules`, `.next`

### Commit & Push
```
git add .
git commit -m "phase 0: scaffold Next.js project with deps and folder structure"
git push
```

---

## Phase 1 — Authentication

### Tasks
1. Install and configure `iron-session` with cookie-based sessions
2. Create `lib/session.ts` with session config (uses `SESSION_SECRET` env)
3. Create `app/login/page.tsx`: simple centered form (username, password, submit button)
4. Create `app/api/auth/login/route.ts`: validates against `AUTH_USERNAME` and `AUTH_PASSWORD` env vars, sets session cookie
5. Create `app/api/auth/logout/route.ts`: clears session cookie
6. Create `middleware.ts`: redirect to `/login` if no valid session, except for `/login` and `/api/auth/*`
7. Add Logout button to layout (visible only when logged in)

### Success Criteria
- Visiting `/` without session redirects to `/login`
- Submitting wrong credentials shows error message
- Submitting `roru` / `roru` redirects to `/` and shows the (empty) chat UI
- Logout button clears session and redirects to `/login`
- API routes (other than auth) return 401 without valid session

### Commit & Push
```
git add .
git commit -m "phase 1: shared-account auth with iron-session"
git push
```

---

## Phase 2 — Chat UI (no AI yet)

### Tasks
1. Build `app/page.tsx` as the main chat interface (client component)
2. Create `components/Sidebar.tsx`: list of chats from localStorage, "New chat" button
3. Create `components/ChatArea.tsx`: scrollable message list with user/assistant message bubbles
4. Create `components/MessageInput.tsx`: textarea + image upload button + send button
5. Create `components/ModelSelector.tsx`: dropdown with three options:
   - Claude Sonnet 4.6 (`claude-sonnet-4-6`) — default
   - Claude Opus 4.6 (`claude-opus-4-6`)
   - Claude Opus 4.7 (`claude-opus-4-7`)
6. Store chat state in React state; persist to localStorage on every change
7. Each chat has: `id`, `title` (first user message truncated), `messages[]`, `model`, `createdAt`
8. Image upload reads file as base64 data URL, shows thumbnail in input area before sending
9. Send button does nothing yet (stub for Phase 3)

### Success Criteria
- Sidebar shows "New chat" button and existing chats from localStorage
- Clicking "New chat" creates a fresh chat
- Clicking a sidebar item loads that chat into main area
- Model selector defaults to Sonnet 4.6, change persists per-chat
- User can type, upload an image, see the image thumbnail, click send (no response yet)
- Refresh page: previously created chats still in sidebar

### Commit & Push
```
git add .
git commit -m "phase 2: chat UI with sidebar, model selector, localStorage history"
git push
```

---

## Phase 3 — Anthropic API Integration (streaming)

### Tasks
1. Create `lib/anthropic.ts`: server-side Anthropic client using `ANTHROPIC_API_KEY`
2. Create `app/api/chat/route.ts`:
   - Validate session
   - Accept `{ messages, model, systemPrompt }` from request
   - Call Anthropic Messages API with streaming
   - Return `ReadableStream` of text chunks (Server-Sent Events or plain stream)
3. In `MessageInput.tsx`: on send, POST to `/api/chat` with full message history
4. In `ChatArea.tsx`: handle streaming response, append chunks to in-progress assistant message
5. Handle images: convert base64 to Anthropic image content blocks before sending
6. Stub `systemPrompt` as a placeholder string for now (real one comes in Phase 4)
7. Show loading indicator while streaming
8. Handle errors: show user-friendly message if API fails

### Success Criteria
- Send a text message → streaming response appears character by character
- Send a message with an image → Claude sees and describes the image
- Switching model in dropdown changes which model receives next message
- Stop button (optional) or natural completion ends stream
- API errors show error bubble, not crash

### Commit & Push
```
git add .
git commit -m "phase 3: anthropic API integration with streaming"
git push
```

---

## Phase 4 — Embed Repo B Knowledge

### Tasks
1. Create build script `scripts/sync-content-system.ts`:
   - Clones Repo B (https://github.com/thtrgng/RORU-content-writer-.git) into `lib/content-system/` at build time
   - Reads all knowledge files, agent SKILL.md files, brief templates
   - Concatenates them into a single `lib/content-system/system-prompt.ts` exporting `SYSTEM_PROMPT` string
2. Update `package.json` `build` script to run `sync-content-system.ts` before `next build`
3. Update `lib/content-system/.gitignore` to exclude cloned files (we re-clone every build)
4. Update `app/api/chat/route.ts` to use real `SYSTEM_PROMPT` from `lib/content-system/system-prompt`
5. Test locally: run the sync script, verify `system-prompt.ts` contains expected content
6. Verify chat now follows RORU pipeline behavior (asks for post type, requests brief, suggests register)

### Success Criteria
- Running `npm run build` clones Repo B and generates `system-prompt.ts`
- Cloned files are git-ignored (only `system-prompt.ts` would be tracked, but it is also git-ignored as it is build artifact)
- Sending "hi" in chat triggers RORU's Phase 1 behavior (Image Router asks for post type)
- Uploading an image triggers Image Router's classification flow
- Pipeline progresses through all 4 agents in conversation

### Commit & Push
```
git add .
git commit -m "phase 4: embed Repo B knowledge into system prompt at build time"
git push
```

---

## Phase 5 — Save Caption to Repo B

### Tasks
1. Create `lib/github.ts`: Octokit client using `GITHUB_TOKEN`
2. Create `app/api/save-caption/route.ts`:
   - Validate session
   - Accept `{ pipelineOutput, finalPosted, note?, folderName }` from request
   - Create three files via GitHub API in Repo B:
     - `Posts/[folderName]/PIPELINE_OUTPUT.md`
     - `Posts/[folderName]/FINAL_POSTED.md`
     - `Posts/[folderName]/USER_INPUT.md` (only if `note` provided)
   - Use commit message: `caption: [folderName]`
   - Push to `main` branch
3. Add "Save caption" button to chat area that appears when assistant message contains a final caption
4. Save dialog: pre-filled folder name (editable), optional note textarea, Cancel/Save buttons
5. On save success: show confirmation toast, link to GitHub commit
6. On save error: show error with retry option

### Success Criteria
- Click "Save caption" → dialog opens with auto-detected folder name
- Click Save → new folder appears in Repo B's `Posts/` on GitHub within seconds
- Folder contains both PIPELINE_OUTPUT.md and FINAL_POSTED.md
- If note added → USER_INPUT.md also created
- Commit message matches `caption: YYYY-MM-DD_ten-mon` format
- Saving from two browsers (same user) doesn't cause conflicts (handle 409 by appending `-2`, `-3`)

### Commit & Push
```
git add .
git commit -m "phase 5: save caption to Repo B Posts/ via GitHub API"
git push
```

---

## Phase 6 — Deploy to Vercel

### Tasks
1. Create Vercel project, link to Repo A on GitHub
2. Add all 7 environment variables in Vercel dashboard:
   - `ANTHROPIC_API_KEY` (newly generated, not the leaked one)
   - `GITHUB_TOKEN` (Personal Access Token with `repo` scope for Repo B)
   - `GITHUB_REPO_OWNER` = `thtrgng`
   - `GITHUB_REPO_NAME` = `RORU-content-writer-`
   - `AUTH_USERNAME` = `roru`
   - `AUTH_PASSWORD` = `roru`
   - `SESSION_SECRET` = generate 32+ character random string
3. Configure build command to include `sync-content-system.ts` step
4. Deploy and verify build succeeds
5. Test deployed URL end-to-end:
   - Login with roru / roru
   - Send message, get streamed response
   - Upload image, get response with image context
   - Save caption, verify it appears in Repo B
6. Update README.md with production URL

### Success Criteria
- Vercel build succeeds with no errors
- Deployed URL serves the login page
- All 6 features (login, chat, image upload, model switch, save caption, logout) work in production
- Saving a caption from the deployed site creates a real commit in Repo B
- Build logs confirm Repo B knowledge was embedded

### Commit & Push
```
git add .
git commit -m "phase 6: production deployment to Vercel"
git push
```

---

## Phase 7 — End-to-End Testing & Handoff

### Tasks
1. Manual end-to-end test from a fresh browser:
   - Visit production URL
   - Login as roru / roru
   - Create a new chat
   - Upload an image of a real RORU dish
   - Walk through full pipeline (Router → Story Extractor → Caption Writer → QA Guard)
   - Receive final caption
   - Click Save, add a note
   - Verify Posts/ folder appears in Repo B with three files
   - Verify content of all three files is correct
   - Logout, verify session cleared
2. Write a one-page user guide for the non-technical teammate:
   - URL of the deployed site
   - Login credentials
   - How to start a new caption
   - How to save when done
   - What to do if something breaks
3. Update README.md with troubleshooting section

### Success Criteria
- Non-technical user can complete a full caption workflow without help
- New Posts/ entries from the website are indistinguishable in structure from ones created via Claude Code directly
- User guide is one page, no jargon, screenshots optional

### Commit & Push
```
git add .
git commit -m "phase 7: e2e test pass, user guide added"
git push
```

---

## Definition of Done

The project is complete when:

1. All 7 phases pass their success criteria
2. The production URL serves a working app
3. A caption created in the web UI appears correctly in Repo B's Posts/ folder
4. The teammate can use it without technical help
5. README.md contains setup, deploy, and troubleshooting docs
6. No secrets are committed to either repo

---

## Important Reminders

- Never commit `.env` or any file containing secrets
- The Anthropic API key originally pasted in chat must be revoked before deploying
- All env vars live only in Vercel and local `.env.local`
- Repo B should never be modified except for additions to `Posts/`
- After each phase: commit and push before moving on
