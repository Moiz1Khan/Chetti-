# Deploy Chetti (Vite) to a VPS

The app is a **static SPA** after `npm run build`. Deploy `dist/` behind **Nginx** (or Docker). **Supabase** stays hosted; only the frontend bundle needs env vars at **build time**.

## 0. Prerequisites

- Ubuntu/Debian server with SSH access (prefer **SSH keys**, not passwords).
- A domain (optional) pointing to the server IP for HTTPS.
- **Supabase** project URL + anon key (same as `.env` locally).

**Security:** rotate any password you ever pasted in chat; never commit `.env`.

---

## 1. Build locally (Windows)

From the project root:

```powershell
# Copy .env.example → .env and fill VITE_* (or set env for this session)
npm ci
npm run build
```

Output: **`dist/`**

Set **`VITE_SITE_URL`** to your public URL (e.g. `https://your-domain.com`) so email links and widget embeds use the right origin.

---

## 2. Upload files to the server

Replace `USER`, `HOST`, and remote path.

**PowerShell (OpenSSH scp):**

```powershell
ssh USER@HOST "sudo mkdir -p /var/www/chetti && sudo chown $USER /var/www/chetti"
scp -r dist/* USER@HOST:/var/www/chetti/
```

**Or rsync (if installed):**

```bash
rsync -avz --delete dist/ USER@HOST:/var/www/chetti/
```

---

## 3. Nginx on the server

```bash
sudo apt update && sudo apt install -y nginx
sudo cp /path/to/deploy/nginx-site.conf.example /etc/nginx/sites-available/chetti
# Edit root + server_name, then:
sudo ln -sf /etc/nginx/sites-available/chetti /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Use **certbot** for HTTPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 4. Supabase Auth redirect URLs

In **Supabase Dashboard** → **Authentication** → **URL Configuration**:

- **Site URL:** `https://your-domain.com`
- **Redirect URLs:** add `https://your-domain.com/**` and `https://your-domain.com/auth/callback` if you use that path.

---

## 5. Docker (alternative)

On any machine with Docker:

```bash
docker build \
  --build-arg VITE_SUPABASE_URL="https://YOUR_PROJECT.supabase.co" \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_ANON_KEY" \
  --build-arg VITE_SITE_URL="https://your-domain.com" \
  -t chetti:latest .

docker run -d -p 80:80 --name chetti chetti:latest
```

Put the container behind Nginx or a firewall; use **HTTPS** in production.

---

## 6. Widget embed URL

After deploy, the **Share widget** snippet in the app should use your production origin (e.g. `https://your-domain.com/widget.js`). Re-copy embed code from the dashboard after `VITE_SITE_URL` / `site-url` is correct.

---

## 7. Edge Functions (Supabase)

Backend logic stays on **Supabase**; redeploy functions from your machine:

```bash
supabase functions deploy welcome-email
# ... other functions as needed
```

No need to copy `supabase/` to the VPS unless you run Supabase locally.
