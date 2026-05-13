# Lulusin — Deployment & Operations Guide

End-to-end guide for working on the Lulusin LMS: local development, pushing to GitHub, pulling on the Tencent Cloud server, and deploying to **lulusin.hemitech.id**.

> Stack: pnpm workspaces · Node.js 24 · TypeScript 5.9 · React 19 + Vite · Express 5 · PostgreSQL + Drizzle ORM · PM2 + Nginx

---

## Table of Contents

1. [Placeholders used in this doc](#placeholders-used-in-this-doc)
2. [Running locally](#1-running-locally)
3. [Pushing changes to the GitHub repo](#2-pushing-changes-to-the-github-repo)
4. [Pulling latest on the Tencent Cloud server](#3-pulling-latest-on-the-tencent-cloud-server)
5. [Deploying to lulusin.hemitech.id](#4-deploying-to-lulusinhemitechid)
6. [Troubleshooting](#5-troubleshooting)

---

## Placeholders used in this doc

Replace these before running any commands:

| Placeholder       | Meaning                                              | Example                          |
| ----------------- | ---------------------------------------------------- | -------------------------------- |
| `<SERVER_IP>`     | Public IP of the Tencent Cloud instance              | `43.xxx.xxx.xxx`                 |
| `<SSH_USER>`      | SSH user on the server                               | `ubuntu` or `root`               |
| `<SSH_KEY>`       | Path to the private key used to authenticate         | `~/.ssh/lulusin_id_rsa`          |
| `<GH_ORG>`        | GitHub organisation or user that owns the repo       | `storify-id`                     |
| `<GH_REPO>`       | GitHub repository name                               | `lulusin`                        |
| `<DEPLOY_PATH>`   | Absolute path on the server where the repo lives     | `/var/www/lulusin`               |
| `<DB_URL>`        | Postgres connection string                           | `postgres://user:pw@host:5432/lulusin` |
| `<SESSION_SECRET>`| Random 32+ byte string for JWT signing               | output of `openssl rand -hex 32` |

---

## 1. Running locally

### 1.1 Prerequisites

- **Node.js 24** — verify with `node --version`
- **pnpm 9+** — install via `npm install -g pnpm` (the repo enforces pnpm; npm/yarn will fail)
- **PostgreSQL 14+** — local instance or hosted (Neon, Supabase, RDS, etc.)
- **Git**

### 1.2 Clone

```bash
git clone https://github.com/<GH_ORG>/<GH_REPO>.git lulusin
cd lulusin
```

### 1.3 Environment variables

**API server env** — create `artifacts/api-server/.env`:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/lulusin
SESSION_SECRET=<output of `openssl rand -hex 32`>
PORT=8080

# QRIS Interactive (qris.interactive.co.id) — for dynamic QRIS payment generation
QRIS_INTERACTIVE_API_KEY=<from QRIS Interactive merchant dashboard>
QRIS_INTERACTIVE_MID=<from QRIS Interactive merchant dashboard>
```

This file is **auto-loaded** by every script that needs it:
- API server start script (`--env-file=.env` in `artifacts/api-server/package.json`)
- Drizzle config (`process.loadEnvFile()` in `lib/db/drizzle.config.ts`)
- Scripts package (`tsx --env-file=...` in `scripts/package.json`)

→ no need to `export` or `$env:` before running commands.

**LMS env** — create `artifacts/lms/.env` for client-side EmailJS:

```bash
VITE_EMAILJS_PUBLIC_KEY=<EmailJS Account → API Keys>
VITE_EMAILJS_SERVICE_ID=<Email Services tab>
VITE_EMAILJS_VERIFY_TEMPLATE_ID=<verify-email template ID>
VITE_EMAILJS_RESET_TEMPLATE_ID=<reset-password template ID>
VITE_PUBLIC_APP_URL=http://localhost:5173
VITE_APP_NAME=Lulusin
```

> `SESSION_SECRET` — generate with `openssl rand -hex 32`. Never commit either `.env`.

### 1.4 Install dependencies

```bash
pnpm install
```

> Heads-up: `pnpm-workspace.yaml` enforces a 1-day minimum release age on npm packages as a supply-chain defence. Brand-new packages may need to be added to `minimumReleaseAgeExclude` — see the comment in that file before disabling.

### 1.5 Database setup

Push the Drizzle schema to your local Postgres (dev only — for prod use migrations):

```bash
pnpm --filter @workspace/db run push
```

#### Seeding (⚠ DESTRUCTIVE — read before running)

`pnpm --filter @workspace/scripts run seed` **truncates every table** (`users`, `packages`, `materials`, `questions`, `orders`, `enrollments`, etc.) and re-inserts default placeholder data. **Any customization made via psql or import scripts will be wiped.**

If you have a fresh DB and just want demo accounts + placeholder content:

```bash
pnpm --filter @workspace/scripts run seed
```

**If you want production-ready content (Belajarbro question bank + real bank account + thumbnails + maintenance flags)**, run the **full restore** after seed:

```bash
# 1. Re-seed (TRUNCATEs everything, re-inserts defaults)
pnpm --filter @workspace/scripts run seed

# 2. Re-import Belajarbro content (~2658 questions, 42 materials, 17 quizzes)
pnpm --filter @workspace/scripts run import-belajarbro

# 3. Apply post-seed customizations (thumbnails, maintenance, real bank account, cleanup placeholder PDFs)
$env:PGPASSWORD = "postgres"  # PowerShell — for bash, use: PGPASSWORD=postgres
Get-Content "scripts\sql\post-seed-restore.sql" -Raw | psql -h localhost -U postgres -d lulusin
```

Both step 2 and step 3 are **idempotent** — safe to re-run anytime.

> **Recommendation**: don't run `seed` casually. If you only need to clear a specific table, use targeted `DELETE` SQL or modify the relevant import script.

### 1.6 Start the dev servers

Open two terminals.

**Terminal A — API server (port 8080):**

```bash
pnpm --filter @workspace/api-server run dev
```

**Terminal B — Vite frontend (port 5173):**

```bash
pnpm --filter @workspace/lms run dev
```

Visit [http://localhost:5173](http://localhost:5173). Vite proxies `/api/*` to `http://localhost:8080`.

#### Port already in use?

If `EADDRINUSE :::8080` appears after a bad Ctrl+C, a stale `node.exe` is still holding the port:

```powershell
# Windows / PowerShell
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

```bash
# macOS / Linux
lsof -ti :8080 | xargs kill -9
```

### 1.7 Useful workspace commands

| Command                                                       | Purpose                                          |
| ------------------------------------------------------------- | ------------------------------------------------ |
| `pnpm run typecheck`                                          | Full typecheck across every package              |
| `pnpm run build`                                              | Typecheck + build all packages (prod artifacts)  |
| `pnpm --filter @workspace/api-spec run codegen`               | Regenerate API hooks + Zod from `openapi.yaml`   |
| `pnpm --filter @workspace/db run push`                        | Push schema changes to the DB (dev only)         |
| `pnpm --filter @workspace/scripts run import-belajarbro`      | Idempotent: re-import Belajarbro questions + materials |
| `pnpm --filter @workspace/scripts run seed`                   | ⚠ **DESTRUCTIVE** — wipes DB, reseeds defaults   |

> After any change to `lib/api-spec/openapi.yaml`, run codegen before touching route handlers.

#### Test accounts (after seed)

| Role | Email | Password | Notes |
| --- | --- | --- | --- |
| Admin | `admin@lulusin.id` | `admin123` | Full access to `/admin/*` |
| Tutor | `tutor@lulusin.id` | `tutor123` | Read-only orders, can edit materials |
| Student (enrolled) | `andi@student.id` | `student123` | Pre-enrolled in CPNS package — best for testing learning flow |
| Student | `siti@student.id`, `reza@student.id` | `student123` | No enrollment; must buy/order first |

---

## 2. Pushing changes to the GitHub repo

### 2.1 One-time setup

If you cloned with HTTPS, configure either a [Personal Access Token](https://github.com/settings/tokens) or SSH:

```bash
# Switch an existing clone to SSH
git remote set-url origin git@github.com:<GH_ORG>/<GH_REPO>.git
```

Set your identity (per-repo if you maintain multiple identities):

```bash
git config user.name  "Your Name"
git config user.email "you@storify.id"
```

### 2.2 Daily workflow

```bash
# 1. Pull latest main
git checkout main
git pull --rebase origin main

# 2. Create a feature branch
git checkout -b feat/<short-description>

# 3. Make changes, then verify
pnpm run typecheck
pnpm run build

# 4. Stage + commit
git status
git add <specific-files>           # avoid `git add .` to keep noise out
git commit -m "feat: short description of change"

# 5. Push
git push -u origin feat/<short-description>
```

Open a Pull Request on GitHub → review → merge to `main`.

### 2.3 Conventions

- **Branch naming:** `feat/...`, `fix/...`, `chore/...`, `docs/...`
- **Never commit:** `.env`, `node_modules/`, `dist/`, payment proofs, DB dumps
- **Before merging:** typecheck + build must pass locally; PRs trigger CI if configured

---

## 3. Pulling latest on the Tencent Cloud server

### 3.1 SSH into the server

```bash
ssh -i <SSH_KEY> <SSH_USER>@<SERVER_IP>
```

### 3.2 Pull and rebuild

```bash
cd <DEPLOY_PATH>

# Optional: stash any local edits (config tweaks, log files)
git status
git stash push -m "pre-deploy-$(date +%F-%H%M)"

# Fetch + fast-forward to origin/main
git fetch origin
git checkout main
git pull --ff-only origin main

# Install new deps (only if package.json / lockfile changed)
pnpm install --frozen-lockfile

# Apply DB migrations (only if schema changed)
pnpm --filter @workspace/db run push     # dev-style push; switch to drizzle-kit migrate for prod

# Build production artifacts
pnpm run build

# Restart the API process under PM2
pm2 restart lulusin-api --update-env

# Tail logs to confirm it came up clean
pm2 logs lulusin-api --lines 50
```

### 3.3 Rollback

```bash
cd <DEPLOY_PATH>
git log --oneline -n 5               # find the last-good SHA
git checkout <previous-sha>
pnpm install --frozen-lockfile
pnpm run build
pm2 restart lulusin-api
```

> The frontend is static after `pnpm run build` — Nginx serves it from `artifacts/lms/dist/public`. Rolling back the git SHA + rebuilding is sufficient.

---

## 4. Deploying to lulusin.hemitech.id

This section covers the **first-time setup** for the Tencent Cloud server. For subsequent deploys, use [Section 3](#3-pulling-latest-on-the-tencent-cloud-server).

### 4.1 Provision the server

Recommended Tencent Cloud CVM spec for a starter LMS:

- **OS:** Ubuntu 22.04 LTS (or 24.04)
- **Size:** 2 vCPU / 4 GB RAM minimum
- **Disk:** 40 GB SSD
- **Security group inbound rules:** allow `22` (SSH), `80` (HTTP), `443` (HTTPS) from `0.0.0.0/0`; restrict `5432` (Postgres) to the server itself or a VPC peer

### 4.2 Install system dependencies

```bash
ssh -i <SSH_KEY> <SSH_USER>@<SERVER_IP>

sudo apt update && sudo apt upgrade -y

# Node.js 24 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm + PM2
sudo npm install -g pnpm pm2

# PostgreSQL (skip if using managed DB)
sudo apt install -y postgresql postgresql-contrib

# Nginx + certbot for SSL
sudo apt install -y nginx certbot python3-certbot-nginx

# Git
sudo apt install -y git
```

### 4.3 Clone the repo

```bash
sudo mkdir -p <DEPLOY_PATH>
sudo chown -R <SSH_USER>:<SSH_USER> <DEPLOY_PATH>
cd <DEPLOY_PATH>

git clone https://github.com/<GH_ORG>/<GH_REPO>.git .
```

> Use a deploy key or fine-grained PAT for a private repo. Add the public key to GitHub → Settings → Deploy Keys (read-only is fine).

### 4.4 Production environment file

```bash
# <DEPLOY_PATH>/.env
NODE_ENV=production
PORT=8080
DATABASE_URL=<DB_URL>
SESSION_SECRET=<SESSION_SECRET>
```

`chmod 600 .env` so only the deploy user can read it.

### 4.5 Install, migrate, build

```bash
cd <DEPLOY_PATH>
pnpm install --frozen-lockfile
pnpm --filter @workspace/db run push      # first-time schema apply
pnpm run build
```

This produces:

- `artifacts/api-server/dist/index.mjs` — bundled Node API server
- `artifacts/lms/dist/public/` — static frontend assets

### 4.6 PM2 process

Create `<DEPLOY_PATH>/ecosystem.config.cjs`:

```js
module.exports = {
  apps: [
    {
      name: "lulusin-api",
      cwd: "/var/www/lulusin/artifacts/api-server",
      script: "dist/index.mjs",
      node_args: "--enable-source-maps",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "8080",
      },
      env_file: "/var/www/lulusin/.env",
      max_memory_restart: "512M",
      out_file: "/var/log/lulusin/api.out.log",
      error_file: "/var/log/lulusin/api.err.log",
      time: true,
    },
  ],
};
```

Then:

```bash
sudo mkdir -p /var/log/lulusin
sudo chown -R <SSH_USER>:<SSH_USER> /var/log/lulusin

pm2 start <DEPLOY_PATH>/ecosystem.config.cjs
pm2 save
pm2 startup systemd -u <SSH_USER> --hp /home/<SSH_USER>
# Run the command pm2 prints (it registers the systemd unit)
```

Verify: `pm2 status` should show `lulusin-api` as `online`.

### 4.7 Nginx for lulusin.hemitech.id

Create `/etc/nginx/sites-available/lulusin.hemitech.id`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name lulusin.hemitech.id;

    # Frontend (Vite build output)
    root /var/www/lulusin/artifacts/lms/dist/public;
    index index.html;

    # SPA fallback — wouter routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to PM2-managed Express
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # PDF / payment-proof uploads — adjust if you store files elsewhere
    client_max_body_size 20M;

    # Cache static assets
    location ~* \.(?:js|css|woff2?|ttf|otf|eot|ico|png|jpg|jpeg|gif|svg|webp)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
```

Enable + reload:

```bash
sudo ln -s /etc/nginx/sites-available/lulusin.hemitech.id /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4.8 DNS

In your DNS provider, create an **A record**:

```
lulusin.hemitech.id    A    <SERVER_IP>    TTL 300
```

Wait for propagation (`dig lulusin.hemitech.id +short` should return `<SERVER_IP>`).

### 4.9 HTTPS via Let's Encrypt

```bash
sudo certbot --nginx -d lulusin.hemitech.id --redirect --agree-tos -m admin@hemitech.id
```

Certbot updates the Nginx config to listen on `443` with auto-redirect from `80`, and installs a cron-based renewal. Test renewal:

```bash
sudo certbot renew --dry-run
```

### 4.10 Smoke test

```bash
curl -I https://lulusin.hemitech.id/                 # 200 OK, returns index.html
curl    https://lulusin.hemitech.id/api/health       # whatever your health endpoint returns
```

Open [https://lulusin.hemitech.id](https://lulusin.hemitech.id) and log in with the demo admin account (`admin@lulusin.id` / `admin123`) to verify end-to-end.

---

## 5. Troubleshooting

| Symptom                                           | Likely cause / fix                                                                                  |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `Use pnpm instead` on install                     | You ran `npm install`. Use `pnpm install` — the root `preinstall` script enforces it.               |
| `EACCES` on `pnpm install` on the server          | `<DEPLOY_PATH>` is owned by root. Run `sudo chown -R <SSH_USER>:<SSH_USER> <DEPLOY_PATH>`.          |
| API 502 from Nginx after deploy                   | PM2 process down or crashed. `pm2 status` + `pm2 logs lulusin-api`.                                 |
| Frontend loads but `/api/*` returns 404 HTML      | Vite/SPA fallback is catching `/api`. Confirm the `location /api/` block sits **above** the SPA `try_files`. |
| `DATABASE_URL` not picked up after restart        | Use `pm2 restart lulusin-api --update-env` so PM2 re-reads the env file.                            |
| Certbot can't issue a cert                        | DNS hasn't propagated yet, or port 80 is blocked in the Tencent Cloud security group.               |
| `pnpm install` rejects a brand-new package        | Supply-chain guard in `pnpm-workspace.yaml` (1-day minimum release age). Wait, or add to allowlist. |
| Schema drift between dev and prod                 | `db push` is dev-only. For prod, generate migrations with drizzle-kit and apply them deterministically. |
| **Custom data disappeared / package thumbnails gone / placeholder content back** | Someone ran `pnpm seed` — it `TRUNCATE`s every table. Re-run the **Section 1.5 full restore** (`import-belajarbro` + `post-seed-restore.sql`) to get back to production-ready state. |
| `EADDRINUSE :::8080` on dev start                 | Stale node process holding the port. See [Section 1.6 port troubleshooting](#port-already-in-use). |
| `Gagal kirim via EmailJS` on register / forgot-password | Check browser DevTools → Network → `/email/send` response body. Typical: wrong `VITE_EMAILJS_*` value in `artifacts/lms/.env`, or `localhost` not allowlisted in EmailJS Account → Security. Restart Vite after editing `.env`. |
| QRIS QR not generated on order (`QRIS provider unavailable`) | `QRIS_INTERACTIVE_API_KEY` / `QRIS_INTERACTIVE_MID` missing or wrong in `artifacts/api-server/.env`. Verify via admin page `/admin/payment-settings` ("QRIS Interactive" status badge). |

---

**Owner:** Storify DevOps · **Last updated:** 2026-05-12
