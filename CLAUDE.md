# Shivoham Universal Sol

Next.js 16 (Turbopack) + React Three Fiber demo site. **Client-facing demo — it must be runnable at all times.** Never leave the repo or the dev environment in a broken state.

Sessions here are started fresh often to save context. Assume no memory of prior runs: re-read this file, check what's already running, and don't assume a server, port, or browser tab is in the state you left it.

---

## 1. Dev server: check before you start, stop when you're done

**The dev server is pinned to `http://localhost:3002`** (`next dev -p 3002`). It is deterministic on purpose — assume that port, don't go hunting.

> **The trap:** Next 16 detects a duplicate `next dev` by **directory, not by port.** A second instance in this repo dies instantly *no matter what port it lands on*. `autoPort` cannot save you — it just produces a doomed server on a random port. This looks like "the preview server died instantly" and is expensive to re-diagnose. `.claude/launch.json` therefore sets `autoPort: false` so the failure is loud and honest.

**Before starting anything, look:**

```bash
curl -s -o /dev/null -w "%{http_code}\n" --max-time 2 http://localhost:3002
```

Then act, without asking:

- **A server is up and serving this project** → use it. `preview_start` the **`attached`** config in `.claude/launch.json` (it has a `url` and no command, so it binds to the running server instead of spawning a rival). Never start a second one.
- **A server is up but stale/broken** (serving errors, wrong bundle) → kill it and start your own. Next prints the offending PID in its own error message; use it. Killing a dev server loses no work — it's a process, not data. Don't ask permission for this.
- **Nothing is running** → `preview_start` the `web` config.

Port `3000` is often occupied by an **unrelated** node process. Leave it alone; it is not this project.

**When you're done, stop what you started.** Use `preview_stop` for servers you launched via `preview_start`. Leave a server running only if the user is actively using it or asked you to. Never leave an orphan competing for the port.

**Never run `next build` while a dev server is running.** They share `.next/`, and the production build overwrites the dev tree. The page then serves SSR HTML with no client bundle: static markup renders, Framer Motion elements stay frozen at their `initial` opacity, and the R3F canvas never mounts. It looks like a rendering bug and is not one. If you need a type check, use `npx tsc --noEmit` — never a full build. Recovery is `rm -rf .next` with the server stopped.

---

## 2. Use common sense; don't escalate to the user

Resolve ordinary environment problems yourself. Port taken, stale process, dead tab, missing build artifact — investigate and fix. Only stop for decisions that are genuinely the user's: product/design intent, or destroying real work.

Killing a dev server, clearing `.next`, restarting a browser tab, choosing a port — all yours to decide.

---

## 3. Browser verification: use the Chrome extension

The user installed **Claude in Chrome** (`mcp__claude-in-chrome__*`) specifically so visual changes can be verified. **Use it. Don't forget it exists mid-session.**

The built-in Browser pane (`mcp__Claude_Browser__*`) **does not composite frames in this environment** — `computer{action:"screenshot"}` times out with "the Browser pane is not displayed." Anything driven by `requestAnimationFrame` — the R3F canvas, every Framer Motion animation — never runs there. It is useless for verifying this site's hero. Don't retry it hoping for a different result.

So: **for anything visual on this project, go straight to the Chrome extension.** Load its tools in one batched `ToolSearch` call:

```
ToolSearch: select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__read_console_messages
```

If the extension is unavailable, say so and ask — do not silently fall back to the Browser pane and then claim something was verified.

**Never claim a visual change is "verified" without an actual rendered screenshot.** Type-checking, a clean build, and arithmetic are not visual verification. If you couldn't see it, say plainly: "I changed X; I could not render it." Passing analysis off as confirmation is worse than admitting the gap.

---

## 4. Token discipline — no thought spirals

This is a demo on a deadline. Budget effort to the size of the problem.

- **Three failed attempts at the same thing = stop.** Report what failed and what you'd try next. Do not loop.
- **Don't re-verify what a tool already confirmed.** Edit and Write error on failure; a silent success means it worked. Don't read files back.
- **Diagnose before theorizing.** One targeted command beats a paragraph of hypotheses. If a symptom doesn't fit your theory, get data — don't reason harder.
- **Suspect your own tooling first.** If something breaks right after you ran an environment command, that command is the prime suspect. Check it before auditing application code.
- **Match effort to stakes.** A cosmetic alignment tweak gets a small fix, not a full investigation.

---

## 5. This hero, specifically

`src/components/hero/` — read `TarotDeck3D.tsx`'s comments before touching layout. They document real invariants, not decoration:

- **`WAVE_LAYER > PI * WAVE_DEPTH`** must hold. Break it and `pz` folds back on itself; painter order stops tracking card index and hover starts flipping between neighbours. There is no visual symptom until you interact.
- The invisible `hit` InstancedMesh owns all pointer events and is driven by the **resting** pose — no float, no focus-pull. This kills a hover feedback loop. Don't route pointer events to the visible mesh.
- Desktop is a sine wave (`wavePose`), mobile is a hand fan (`arcPose`), split at `max-width: 767px`.

Symptom-to-cause, so it isn't re-derived from scratch:

| Symptom | Cause | Fix |
|---|---|---|
| Headline invisible, gold rule + "SCROLL TO GATHER" visible, canvas black | Client bundle never loaded — `.next/` clobbered, page served SSR-only and never hydrated. Framer Motion elements are stuck at their SSR'd `initial` opacity. **Not a CSS or 3D bug.** | Stop the dev server, `rm -rf .next`, restart |
| Preview/dev server dies instantly on start | A `next dev` is already running **in this directory** (detection is directory-based, not port-based) | Use the `attached` launch config |
| Screenshot times out — "Browser pane is not displayed" | Browser pane isn't compositing; nothing rAF-driven runs | Use the Chrome extension |
| Cards render but hover flips between neighbours | `WAVE_LAYER > PI * WAVE_DEPTH` invariant broken — `pz` folded | Restore the ratio in `TarotDeck3D.tsx` |
