# Hardware E-Commerce Platform

B2B/B2C hardware supply store with multi-language support (EN/ZH/ZH-TW/MS), WeChat/SMS auth, Stripe + WeChat Pay + Alipay checkout, and an admin dashboard.

**Stack:** React 19 + Vite · tRPC · Express · Drizzle ORM · MySQL · Alibaba Cloud OSS

---

## Prerequisites

- Node.js 20+
- pnpm 10+
- MySQL 8+ database

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Required
DATABASE_URL=mysql://user:password@host:3306/dbname
JWT_SECRET=your-secret

# WeChat OAuth (customer login)
WECHAT_APP_ID=
WECHAT_APP_SECRET=
OWNER_OPEN_ID=wechat:<openid>   # sets admin account

# Authing (SMS login)
AUTHING_APP_ID=
AUTHING_APP_SECRET=
AUTHING_DOMAIN=https://your-app.authing.cn

# Alibaba Cloud SMS
SMS_ACCESS_KEY_ID=
SMS_ACCESS_KEY_SECRET=
SMS_SIGN_NAME=五金商城
SMS_TEMPLATE_CODE=

# Alibaba Cloud OSS (product image uploads)
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=
OSS_BUCKET=
OSS_REGION=oss-cn-hangzhou
OSS_CDN_DOMAIN=                 # optional CDN domain

# Stripe
STRIPE_SECRET_KEY=

# WeChat Pay v3
WECHAT_PAY_MCH_ID=
WECHAT_PAY_APP_ID=
WECHAT_PAY_CERT_SERIAL=
WECHAT_PAY_PRIVATE_KEY=         # base64-encoded PEM
WECHAT_PAY_API_KEY_V3=
WECHAT_PAY_NOTIFY_URL=

# Alipay
ALIPAY_APP_ID=
ALIPAY_PRIVATE_KEY=             # base64-encoded PEM
ALIPAY_PUBLIC_KEY=              # base64-encoded PEM
ALIPAY_NOTIFY_URL=

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## Local Development

```bash
pnpm install

# Push schema + run migrations
pnpm db:push

# Seed demo data (categories + 16 products)
node server/seed.mjs

# Start dev server (hot reload, port 3000)
pnpm dev
```

---

## Production Build & Deploy

```bash
pnpm build
# Outputs:
#   dist/          — client bundle (served as static files)
#   dist/index.js  — server bundle

NODE_ENV=production node dist/index.js
```

The server trusts the `X-Forwarded-Proto` header for HTTPS detection when behind a proxy.

---

## Docker Deployment (Alibaba Cloud + 1Panel)

The repo ships with a `Dockerfile` (multi-stage Node 20 build) and `docker-compose.yml` (app + MySQL 8).

### Step 1 — Provision Alibaba Cloud ECS

1. Buy an ECS instance (Ubuntu 22.04 recommended, 2 vCPU / 4 GB minimum).
2. Open inbound ports in the Security Group: **80**, **443**, **8888** (1Panel), **3000** (app, or your chosen `PORT`).

### Step 2 — Install 1Panel

SSH into the server and run the official installer:

```bash
curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh | bash
```

Follow the prompts. When done, open `http://<your-server-ip>:8888` in a browser and log in.

### Step 3 — Upload the project

Option A — clone from Git inside the server:
```bash
git clone <your-repo-url> /opt/hardware_ecommerce
cd /opt/hardware_ecommerce
```

Option B — zip and upload via 1Panel **File Manager** → unzip to `/opt/hardware_ecommerce`.

### Step 4 — Create the `.env` file

```bash
cp /opt/hardware_ecommerce/.env.example /opt/hardware_ecommerce/.env
# (or create it from scratch — see Environment Variables section above)
```

Add the MySQL-specific vars that docker-compose needs:

```env
# MySQL container credentials (choose your own values)
MYSQL_ROOT_PASSWORD=strongrootpass
MYSQL_DATABASE=hardware_ecommerce
MYSQL_USER=appuser
MYSQL_PASSWORD=apppassword

# App port exposed on the host
PORT=3000

# All other vars from the Environment Variables section...
DATABASE_URL is set automatically by docker-compose — do NOT override it here
```

> **Note:** `DATABASE_URL` is injected by docker-compose using the `MYSQL_*` vars above, so leave it out of `.env`.

### Step 5 — Deploy via 1Panel Compose

1. In 1Panel sidebar go to **Apps → Compose** (or **容器 → Compose**).
2. Click **Create** → select **Upload** or **Custom**.
3. Paste the contents of `docker-compose.yml`, set the working directory to `/opt/hardware_ecommerce`, and click **Confirm**.
4. 1Panel will pull the MySQL image, build the app image, and start both containers.

Alternatively, deploy from the terminal:

```bash
cd /opt/hardware_ecommerce
docker compose up -d --build
```

Monitor logs:

```bash
docker compose logs -f app
```

### Step 6 — Run database migrations

Wait for the `db` container to be healthy (check `docker compose ps`), then:

```bash
# Run inside the app container
docker compose exec app sh -c "DATABASE_URL=$(grep DATABASE_URL /proc/1/environ | tr '\0' '\n' | grep DATABASE_URL | cut -d= -f2-) npx drizzle-kit migrate"
```

Or, simpler — run from the host with the composed DATABASE_URL:

```bash
export DATABASE_URL="mysql://appuser:apppassword@127.0.0.1:3306/hardware_ecommerce"
cd /opt/hardware_ecommerce
pnpm db:push
```

### Step 7 — Seed initial data

```bash
docker compose exec app node server/seed.mjs
```

Or from the host (requires Node + pnpm installed on the server):

```bash
DATABASE_URL="mysql://appuser:apppassword@127.0.0.1:3306/hardware_ecommerce" node server/seed.mjs
```

### Step 8 — Set up reverse proxy (HTTPS)

In 1Panel go to **Website → Nginx** (or use the built-in reverse proxy feature):

1. Add a new site pointing to `http://127.0.0.1:3000`.
2. Enable SSL via Let's Encrypt (1Panel has a one-click option).
3. Add the header `proxy_set_header X-Forwarded-Proto https;` so the app detects HTTPS correctly.

### Updating the app

```bash
cd /opt/hardware_ecommerce
git pull
docker compose up -d --build app
```

---

## Database Migrations

Drizzle Kit manages the schema at [drizzle/schema.ts](drizzle/schema.ts).

```bash
# Generate migration files + apply to DB
pnpm db:push
```

This runs `drizzle-kit generate` then `drizzle-kit migrate` in sequence. Migration SQL files are written to the `drizzle/` directory and committed to source control.

To inspect or run individual migrations manually:

```bash
# Generate only (no apply)
pnpm dlx drizzle-kit generate

# Apply pending migrations
pnpm dlx drizzle-kit migrate
```

---

## Seeding

```bash
node server/seed.mjs
```

Seeds 4 categories and 16 products (metal hardware, bearings, electromechanical, screws). Safe to re-run — uses `INSERT ... ON DUPLICATE KEY UPDATE`.

---

## Admin Access

The admin role is granted to the user whose `openId` matches `OWNER_OPEN_ID` in env. Set it to `wechat:<your-wechat-openid>` or the phone-based user ID created after first SMS login.

---

## Testing

```bash
pnpm test
```

Runs Vitest unit tests covering auth, product listing/filtering, cart, orders, and admin role guards.
