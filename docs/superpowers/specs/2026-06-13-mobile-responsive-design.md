# Mobile Responsive Design

**Date:** 2026-06-13
**Scope:** Make the RORU Marketing UI usable on phones. Desktop/laptop layout must remain pixel-perfect and unchanged.

---

## Constraints

- All desktop styles stay exactly as today — no regressions on `md:` and above.
- All responsive changes use Tailwind breakpoint prefixes (`md:`) so they apply only on mobile (below 768px).
- No new pages, no routing changes, no new dependencies.

---

## Section 1 — Layout & Sidebar

**State:** `page.tsx` adds `sidebarOpen: boolean` (default `false`).

**Sidebar on mobile:**
- Rendered as `fixed inset-y-0 left-0 z-40 w-[260px]` — taken out of the normal flex flow.
- Closed: `translate-x-[-100%]` (off-screen left). Open: `translate-x-0`.
- Transition: `transition-transform duration-200 ease-in-out`.
- A semi-transparent backdrop (`fixed inset-0 z-30 bg-black/40`) renders behind the sidebar when open. Tapping it closes the drawer.

**Sidebar on desktop (md: and above):**
- `static w-[260px]` — identical to current behavior. No transform, no backdrop.

**Auto-close triggers (mobile only):**
- Selecting a chat item.
- Tapping "New chat".
- Tapping the backdrop.

**Sidebar props added:**
- `isOpen: boolean`
- `onClose: () => void`

---

## Section 2 — Header & Hamburger

**Hamburger button:**
- `MenuIcon` (lucide-react, already installed).
- Placed on the left side of the header.
- Classes: `md:hidden` — invisible on desktop, shown on mobile.
- `onClick`: sets `sidebarOpen(true)`.

**Desktop header:** unchanged — no hamburger, same "Hướng dẫn" + "Logout" layout.

**Mobile header:** hamburger left, "Hướng dẫn" + "Logout" right.

---

## Section 3 — MessageInput

**Bottom toolbar adjustments (mobile only):**
- Add `flex-wrap` to the toolbar row so model/effort labels wrap gracefully on narrow screens.
- Reduce horizontal padding slightly on mobile (`px-2` instead of `px-3`).
- No functional or desktop visual change.

---

## Section 4 — SaveDialog & GuideModal

**Mobile:** Full-screen — `fixed inset-0 rounded-none overflow-y-auto` instead of a centered card.

**Desktop:** Unchanged — existing centered modal with `rounded-xl`, `max-w-lg` etc.

Implementation: add `md:` prefixes to the desktop-specific classes (rounded corners, max-width, centering padding). Mobile gets `inset-0` full-screen layout.

---

## Files Changed

| File | Change |
|------|--------|
| `app/page.tsx` | Add `sidebarOpen` state; pass props to `Sidebar`; add hamburger button to header |
| `components/Sidebar.tsx` | Accept `isOpen`/`onClose`; add mobile fixed/transform classes; add backdrop |
| `components/MessageInput.tsx` | Add `flex-wrap` + minor padding adjustment for mobile toolbar |
| `components/SaveDialog.tsx` | Full-screen on mobile via responsive classes |
| `components/GuideModal.tsx` | Full-screen on mobile via responsive classes |

---

## Testing Criteria

- At viewport ≥ 768px: UI is visually identical to current production.
- At viewport < 768px (e.g. 375px iPhone): sidebar is hidden by default, hamburger opens/closes it, chat area is full-width, input bar is usable, dialogs/modals are full-screen.
