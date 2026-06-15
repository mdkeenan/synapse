# Upstream Maintenance

> **Purpose:** Keep Synapse current with [LibreChat](https://github.com/danny-avila/LibreChat) while preserving deployment-specific configuration and future branding changes.  
> **Snapshot date:** 2026-06-14 (based on live `git` comparison with upstream `main`).

---

## Current upstream remote

| Remote | URL | Role today |
|--------|-----|------------|
| **`origin`** | `https://github.com/mdkeenan/synapse.git` | Synapse fork — fetch/push target |
| **`upstream`** | *(not configured)* | **Should be added** — canonical LibreChat source |

**Recommended setup:**

```bash
git remote add upstream https://github.com/danny-avila/LibreChat.git
git fetch upstream
```

**Canonical upstream repository:** [https://github.com/danny-avila/LibreChat](https://github.com/danny-avila/LibreChat)  
**Upstream default branch:** `main`  
**Tracked release in this repo:** `v0.8.6` (`package.json`)

### Sync status (2026-06-14)

| Metric | Value |
|--------|-------|
| Local `main` HEAD | `1a0bd5fee` |
| Upstream `main` | `9efe4878e` |
| Merge base | `8154a31d` |
| **Behind upstream** | **19 commits** |
| **Ahead of upstream** | **5 commits** (all `librechat.yaml`) |
| Files changed vs upstream | ~205 files (mostly `packages/`, `client/`, `api/`) |

Synapse-specific commits on `main`:

```
1a0bd5fee Update librechat.yaml
f6f1f0b48 Update librechat.yaml
afa1a6e2a Update librechat.yaml
167ff4aef Update version from 1.3.5 to 1.3.12
b9c977dc5 Add Perplexity API configuration to librechat.yaml
```

**Only diverged file vs merge base:** `librechat.yaml`.

---

## Current branch strategy

| Branch | Tracks | Usage |
|--------|--------|-------|
| **`main`** | `origin/main` | Single long-lived branch; all Synapse work lands here |
| Feature branches | — | Not used in current history |
| Upstream tracking | — | No dedicated `upstream/main` or sync branch yet |

**Observed workflow:**

- `main` carries both LibreChat history (~4,500 commits) and Synapse config commits.
- `git pull origin main` is the day-to-day update path (`config/deployed-update.js` also pulls **`origin`**, not upstream).
- `librechat.yaml` is listed in `.gitignore` but **is tracked** in git (added before ignore rule or via force-add). This creates friction on every upstream merge.

**Recommended branch model:**

```
upstream/main          ← read-only mirror of danny-avila/LibreChat main (fetch only)
synapse/main           ← your integration branch (current main, renamed conceptually)
synapse/config         ← optional: only deployment YAML + env templates
sync/upstream-YYYY-MM  ← short-lived branches for each upstream merge/rebase
```

Keep **`main`** as the integration branch if you prefer simplicity; the important part is **never mixing upstream merges with config edits in the same commit**.

---

## Areas likely to conflict with upstream updates

Conflict risk is ranked by how often LibreChat changes the file and whether Synapse customizes it.

### Critical (expect conflicts every sync)

| Area | Paths | Why |
|------|-------|-----|
| **Deployment config** | `librechat.yaml` | Synapse has 5 local commits; upstream also edits this file. Highest conflict probability. |
| **Lockfile** | `package-lock.json` | Touches almost every dependency bump. Regenerate rather than hand-merge when possible. |
| **Shared packages** | `packages/api/**`, `packages/data-provider/**`, `packages/data-schemas/**`, `packages/client/**` | ~85 files changed in latest 19-commit gap; core feature velocity. |
| **Frontend app** | `client/src/**`, `client/vite.config.ts`, `client/index.html` | UI, PWA, routing, hooks — ~54 files in recent gap. |
| **Express shell** | `api/server/**`, `api/strategies/**`, `api/app/**` | Route wiring and provider integrations — ~51 files in recent gap. |

### High (conflicts when Synapse adds branding or fork-specific code)

| Area | Paths | Why |
|------|-------|-----|
| **Startup / title** | `api/server/routes/config.js`, `client/src/hooks/Config/useAppStartup.ts`, `client/src/routes/Layouts/Startup.tsx` | `APP_TITLE` fallbacks and config payload shape change often. |
| **Auth & email** | `api/server/services/AuthService.js`, `api/server/utils/emails/*.handlebars` | Template and auth flow updates. |
| **English copy** | `client/src/locales/en/translation.json` | Large file; upstream adds keys constantly. Synapse string edits collide. |
| **PWA / manifest** | `client/vite.config.ts`, `client/scripts/post-build.cjs` | Workbox and manifest blocks change with Vite upgrades. |
| **Env template** | `.env.example` | New variables every release. |
| **Compose / Docker** | `docker-compose.yml`, `deploy-compose.yml`, `Dockerfile`, `Dockerfile.multi` | Image tags and service wiring. |
| **Example YAML** | `librechat.example.yaml` | Schema/version bumps (e.g. `1.3.5` → `1.3.12`). |

### Medium (occasional conflicts)

| Area | Paths | Why |
|------|-------|-----|
| **E2E** | `e2e/**` | New specs and config when features ship. |
| **MCP / agents** | `packages/api/src/mcp/**`, `packages/api/src/agents/**`, `api/server/routes/mcp.js` | Active development zones. |
| **Config scripts** | `config/update.js`, `config/smart-reinstall.js` | Install/build workflow changes. |
| **Helm** | `helm/librechat/**` | If you deploy via Helm and customize charts. |

### Low (Synapse has not customized yet)

| Area | Notes |
|------|-------|
| `client/public/assets/logo.svg` | Replace-only asset; rarely conflicts unless upstream swaps logo layout. |
| `docs/` | Synapse-only; no upstream overlap. |
| `.env` | Gitignored; no merge conflicts. |

---

## Recommended customization isolation strategy

**Goal:** Keep Synapse differences in layers that upstream never touches, so `git merge upstream/main` stays mechanical.

### Layer 1 — Runtime config (no code merges)

| Mechanism | Location | Git strategy |
|-----------|----------|--------------|
| Environment variables | `.env` (local / deploy secrets) | **Never commit** — use `.env.example` as reference only |
| App config | `librechat.yaml` | **Stop tracking in git** — deploy via volume, secret store, or `synapse/config/` repo |
| Skills | `skill/` | Gitignored content OK; mount at deploy time |
| Uploads / images | `uploads/`, `images/` | Gitignored volumes |

**Action for this repo:** Remove `librechat.yaml` from version control and keep a template:

```bash
git rm --cached librechat.yaml
cp librechat.yaml synapse/librechat.synapse.yaml   # or docs template
# commit template only; real file stays local / on server
```

Respect the existing `.gitignore` entry for `librechat.yaml`.

### Layer 2 — Branding via config (minimal code)

Prefer mechanisms already supported by LibreChat (see [SYNAPSE_CUSTOMIZATION_MAP.md](./SYNAPSE_CUSTOMIZATION_MAP.md)):

- `APP_TITLE`, `CUSTOM_FOOTER`, `HELP_AND_FAQ_URL`
- `librechat.yaml` → `interface.customWelcome`, terms, privacy
- Static assets under `client/public/assets/` (logo, favicons)

Avoid editing `Chat/Footer.tsx`, `About.tsx`, or `vite.config.ts` until necessary — those files change upstream often.

### Layer 3 — Isolated code overrides (when config is not enough)

If code changes are required, isolate them:

| Approach | Description |
|----------|-------------|
| **`synapse/` directory** | Brand assets, example configs, patch notes, optional small Node script to copy assets into `client/public/assets/` at build time |
| **Single commit discipline** | One commit (or PR) per Synapse concern atop upstream — e.g. `synapse: branding fallbacks` — easy to revert/reapply |
| **Avoid `/api` edits** | Put new backend logic in `packages/api`; keep `api/server` as thin wrappers per project conventions |
| **Optional fork package** | `packages/synapse/` for Synapse-only TS (theme tokens, config helpers) imported from one client entry point |

Do **not** scatter Synapse edits across upstream hot paths (`useNewConvo.ts`, `config.js`, `package-lock.json`).

### Layer 4 — Deployment overlay

| File | Synapse-specific change |
|------|-------------------------|
| `deploy-compose.yml` / `docker-compose.yml` | Pin Synapse env files, volumes, image tags |
| `config/deployed-update.js` | Today pulls **`origin/main`**; extend to `git fetch upstream` + merge, or document manual sync before pull |
| CI (if added) | Build from `upstream` + apply Synapse config artifact |

---

## Minimizing merge conflicts when syncing releases

### 1. Add and use an `upstream` remote

```bash
git remote add upstream https://github.com/danny-avila/LibreChat.git
git fetch upstream
```

Verify:

```bash
git log --oneline HEAD..upstream/main   # commits to merge
git log --oneline upstream/main..HEAD   # Synapse-only commits
```

### 2. Untrack deployment config

Before the next sync, move Synapse YAML out of git history going forward:

1. Save current `librechat.yaml` outside the repo (or in a secrets manager).
2. `git rm --cached librechat.yaml` and commit.
3. Maintain `synapse/librechat.synapse.yaml` (or extend `librechat.example.yaml` with Synapse comments only).

After this, upstream merges will not fight over `librechat.yaml`.

### 3. Prefer merge or rebase on a sync branch

**Merge workflow (safer for shared `main`):**

```bash
git fetch upstream
git checkout -b sync/upstream-2026-06-14 upstream/main
git checkout main
git merge sync/upstream-2026-06-14
# resolve conflicts; run tests
git push origin main
```

**Rebase workflow (linear history; use only if Synapse commits are few and unpushed):**

```bash
git fetch upstream
git rebase upstream/main
# replay Synapse commits (ideally just config template commits)
git push origin main --force-with-lease   # only if you accept rewriting shared history
```

Given only **5 config commits**, rebasing onto upstream is feasible once `librechat.yaml` is untracked (Synapse commits may become empty and drop away).

### 4. Resolve `package-lock.json` deliberately

When lockfile conflicts:

```bash
git checkout upstream/main -- package-lock.json
npm ci
npm run build
# verify, then commit
```

Or use upstream’s `npm run smart-reinstall` after merging.

### 5. Sync on tagged releases, not every upstream commit

| When | Action |
|------|--------|
| **Routine** | Monthly or per LibreChat semver tag (`v0.8.x`) |
| **Security / critical fix** | Cherry-pick or fast-forward sooner |
| **Before sync** | Read [LibreChat releases](https://github.com/danny-avila/LibreChat/releases) and `librechat.example.yaml` version bump |

```bash
git fetch upstream --tags
git merge v0.8.7   # example: merge tag instead of floating main
```

### 6. Keep Synapse diffs in documented, grep-able commits

```bash
git log upstream/main..HEAD --oneline
```

Should show only intentional Synapse work (branding commit, synapse config template, deploy scripts). If this list grows, refactor into Layer 1–3 isolation.

### 7. Post-sync verification checklist

```bash
npm run smart-reinstall
npm run build
cd api && npx jest --passWithNoTests --testPathPattern=config   # example smoke
cd client && npm run test:ci                                  # if time permits
```

Manual smoke:

- Login / startup config (`GET /api/config` → `appTitle`)
- New chat + agent run
- MCP server list (if used)
- PWA manifest loads (`/manifest.webmanifest`)

### 8. Reapply Synapse config after merge

Because runtime config lives outside git:

1. Restore `librechat.yaml` on the server from backup or template merge.
2. Merge new keys from `librechat.example.yaml` (upstream adds fields frequently — your jump `1.3.5` → `1.3.12` is an example).
3. Set `.env` / `APP_TITLE` / Synapse branding vars.
4. Redeploy or restart backend.

### 9. Do not customize hot files unless required

From recent upstream activity, these areas had heavy churn (19 commits):

- Context usage / billing UI
- Anthropic native provider
- Web search favicon streaming
- Outbound proxy handling
- Agent handlers

Future Synapse branding should **not** land in those files if env/assets can achieve the same result.

### 10. Document each sync

After every upstream merge, add a short note (changelog or git tag):

```
synapse-sync-2026-06-14
  upstream: 9efe4878e (LibreChat main)
  behind: 0 / ahead: N synapse commits
  librechat.example.yaml version: 1.3.x
  manual: merged new YAML keys into production librechat.yaml
```

---

## Anti-patterns to avoid

| Anti-pattern | Why it hurts |
|--------------|--------------|
| Committing `librechat.yaml` with secrets/endpoints | Conflicts every sync; leaks config |
| Editing `client/src/locales/*` for brand name | 30+ locale files; upstream adds keys constantly |
| Long-lived drift (100+ commits behind) | `packages/` API breaks; merges become project-sized |
| Mixing upstream merge + Synapse feature in one commit | Hard to bisect and replay |
| Using `config/deployed-update.js` alone for LibreChat core updates | Pulls **Synapse origin**, not **LibreChat upstream** |
| Forking `@librechat/agents` early | External package — subscribe to npm version bumps instead |

---

## Quick reference commands

```bash
# One-time
git remote add upstream https://github.com/danny-avila/LibreChat.git

# Check drift
git fetch upstream
git log --oneline HEAD..upstream/main | wc -l    # behind count
git log --oneline upstream/main..HEAD            # Synapse-only commits
git diff --stat HEAD upstream/main

# Sync (merge)
git checkout main
git merge upstream/main

# Lockfile reset
git checkout upstream/main -- package-lock.json && npm ci

# List files Synapse changed vs upstream
git diff --name-only upstream/main...HEAD
```

---

## Related documentation

- [SYNAPSE_REPOSITORY_ANALYSIS.md](./SYNAPSE_REPOSITORY_ANALYSIS.md) — architecture and workspace layout  
- [SYNAPSE_CUSTOMIZATION_MAP.md](./SYNAPSE_CUSTOMIZATION_MAP.md) — every branding touchpoint and preferred isolation layer  
- [LibreChat updating docs](https://www.librechat.ai/docs/local/npm#updating) — upstream install/update scripts (`config/update.js`)
