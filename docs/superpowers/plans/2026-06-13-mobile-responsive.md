# Mobile Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the RORU Marketing UI fully usable on phones (≥375px) while leaving the desktop layout pixel-perfect unchanged.

**Architecture:** All responsive changes use Tailwind's `md:` breakpoint (768px) — mobile-first styles apply below `md:`, desktop overrides apply at `md:` and above. The sidebar becomes a fixed slide-in drawer on mobile, controlled by `sidebarOpen` state in `page.tsx`. Dialogs become bottom sheets / full-screen on mobile.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS, TypeScript, lucide-react (already installed)

---

## File Map

| File | Change |
|------|--------|
| `app/page.tsx` | Add `sidebarOpen` state; hamburger button in header; auto-close sidebar on chat select/new |
| `components/Sidebar.tsx` | Accept `isOpen`/`onClose` props; mobile fixed overlay + backdrop |
| `components/MessageInput.tsx` | Mobile toolbar padding tweak |
| `components/SaveDialog.tsx` | Bottom-sheet on mobile |
| `components/GuideModal.tsx` | Full-screen on mobile |

---

## Task 1: Sidebar — mobile drawer behaviour

**Files:**
- Modify: `components/Sidebar.tsx`

- [ ] **Step 1: Add `isOpen` and `onClose` props**

Replace the Props interface and function signature:

```tsx
interface Props {
  chats: Chat[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  isOpen,
  onClose,
}: Props) {
```

- [ ] **Step 2: Add backdrop + responsive aside classes**

Replace the entire return block:

```tsx
  return (
    <>
      {/* Tap-outside backdrop — mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "w-[260px] flex flex-col bg-roru-sidebar h-full",
          // Mobile: fixed overlay, slides in/out
          "fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: static, always visible, no transform
          "md:static md:translate-x-0 md:z-auto"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-medium text-roru-text">RORU</span>
          <button
            onClick={onNewChat}
            title="New chat"
            className="p-1.5 rounded-md text-roru-muted hover:text-roru-text hover:bg-roru-surface transition-colors"
          >
            <SquarePenIcon size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          {chats.length === 0 && (
            <p className="px-3 py-4 text-xs text-roru-muted text-center">No chats yet</p>
          )}
          {chats
            .slice()
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={clsx(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate",
                  chat.id === activeChatId
                    ? "bg-roru-surface text-roru-text"
                    : "text-roru-muted hover:bg-roru-surface hover:text-roru-text"
                )}
              >
                {chat.title}
              </button>
            ))}
        </div>
      </aside>
    </>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "$(git rev-parse --show-toplevel)" && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors (or only pre-existing unrelated errors).

- [ ] **Step 4: Commit**

```bash
git add components/Sidebar.tsx
git commit -m "feat(mobile): sidebar slide-in drawer with backdrop"
```

---

## Task 2: page.tsx — sidebarOpen state + hamburger button

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add MenuIcon import**

In the imports section at the top of `app/page.tsx`, add `MenuIcon` to the lucide-react import:

```tsx
import { LogOutIcon, BookOpenIcon, MenuIcon } from "lucide-react";
```

- [ ] **Step 2: Add `sidebarOpen` state**

After the existing `const [guideOpen, setGuideOpen] = useState(false);` line, add:

```tsx
const [sidebarOpen, setSidebarOpen] = useState(false);
```

- [ ] **Step 3: Update Sidebar usage — pass new props and auto-close**

Replace the `<Sidebar ... />` block:

```tsx
<Sidebar
  chats={chats}
  activeChatId={activeChatId}
  onNewChat={() => { handleNewChat(); setSidebarOpen(false); }}
  onSelectChat={(id) => { handleSelectChat(id); setSidebarOpen(false); }}
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
/>
```

- [ ] **Step 4: Update header — add hamburger, fix justify**

Replace the `<header>` block:

```tsx
<header className="flex items-center px-4 py-2.5 border-b border-roru-border shrink-0">
  {/* Hamburger — mobile only */}
  <button
    onClick={() => setSidebarOpen(true)}
    className="md:hidden p-1.5 rounded-md text-roru-muted hover:text-roru-text hover:bg-roru-surface transition-colors"
    title="Open menu"
  >
    <MenuIcon size={16} />
  </button>

  {/* Right-side actions — always visible */}
  <div className="flex items-center gap-1 ml-auto">
    <button
      onClick={() => setGuideOpen(true)}
      title="Hướng dẫn sử dụng"
      className="flex items-center gap-1.5 text-xs text-roru-muted hover:text-roru-text transition-colors px-2 py-1 rounded-md hover:bg-roru-surface"
    >
      <BookOpenIcon size={13} />
      Hướng dẫn
    </button>
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-xs text-roru-muted hover:text-roru-text transition-colors px-2 py-1 rounded-md hover:bg-roru-surface"
    >
      <LogOutIcon size={13} />
      Logout
    </button>
  </div>
</header>
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx
git commit -m "feat(mobile): hamburger button + sidebarOpen state"
```

---

## Task 3: MessageInput — mobile toolbar padding

**Files:**
- Modify: `components/MessageInput.tsx`

- [ ] **Step 1: Reduce toolbar padding on mobile**

In `components/MessageInput.tsx`, find the bottom toolbar div:

```tsx
<div className="flex items-center justify-between px-3 pb-2.5">
```

Change to:

```tsx
<div className="flex items-center justify-between px-2 pb-2.5 md:px-3">
```

- [ ] **Step 2: Commit**

```bash
git add components/MessageInput.tsx
git commit -m "feat(mobile): tighten input toolbar padding on small screens"
```

---

## Task 4: SaveDialog — bottom sheet on mobile

**Files:**
- Modify: `components/SaveDialog.tsx`

- [ ] **Step 1: Make outer flex align to bottom on mobile**

Find the outer wrapper div:

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
```

Change to:

```tsx
<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center">
```

- [ ] **Step 2: Make inner card a bottom sheet on mobile**

Find the inner card div:

```tsx
<div className="w-full max-w-md bg-roru-surface border border-roru-border rounded-2xl p-6 shadow-2xl">
```

Change to:

```tsx
<div className="w-full max-w-full bg-roru-surface border border-roru-border rounded-t-2xl p-6 shadow-2xl md:max-w-md md:rounded-2xl">
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/SaveDialog.tsx
git commit -m "feat(mobile): save dialog as bottom sheet on mobile"
```

---

## Task 5: GuideModal — full-screen on mobile

**Files:**
- Modify: `components/GuideModal.tsx`

- [ ] **Step 1: Remove vertical margin on mobile**

Find the inner modal div:

```tsx
<div className="relative flex flex-col w-full max-w-5xl mx-auto my-4 rounded-xl overflow-hidden bg-roru-bg border border-roru-border shadow-2xl">
```

Change to:

```tsx
<div className="relative flex flex-col w-full max-w-5xl mx-auto my-0 rounded-none overflow-hidden bg-roru-bg border border-roru-border shadow-2xl md:my-4 md:rounded-xl">
```

- [ ] **Step 2: Commit**

```bash
git add components/GuideModal.tsx
git commit -m "feat(mobile): guide modal full-screen on mobile"
```

---

## Task 6: Push + verify live

- [ ] **Step 1: Push all commits**

```bash
git push origin main
```

- [ ] **Step 2: Wait for Vercel deployment (~60s) then verify**

Check deployment is live:

```bash
vercel ls 2>&1 | head -6
```

Expected: newest entry shows `● Ready` and age under 2 minutes.

- [ ] **Step 3: Desktop check — open site at 1280px wide**

Open https://roru-marketing-ui.vercel.app/ in a desktop browser. Confirm:
- Sidebar visible on the left at 260px
- No hamburger button in header
- "Hướng dẫn" and "Logout" in top-right
- Everything identical to before

- [ ] **Step 4: Mobile check — open DevTools, set viewport to 375px wide**

Confirm:
- Sidebar is hidden
- Hamburger icon appears top-left in header
- Tapping hamburger slides sidebar in from left
- Dark backdrop visible behind sidebar
- Tapping backdrop closes sidebar
- Chat area is full-width
- Input bar and model/effort selectors fit without overflow
- Sending a message works

- [ ] **Step 5: Modal checks at 375px**

- Tap "Save caption" on a message → dialog slides up as bottom sheet
- Tap "Hướng dẫn" → guide modal is full-screen (no top/bottom gap)
