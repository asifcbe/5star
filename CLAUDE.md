# CLAUDE.md

5Star — e-commerce store for bags, jerkins & trolleys (fivestarbagsandsuitcases.in). MERN: React CRA (no TypeScript) frontend, Express/Mongoose backend, MongoDB Atlas. Cloned and re-themed from the sibling "One Clutch" project (`../../One Clutch/`, whose CLAUDE.md documents the shared architecture: auth, orders/payment integrity, variants, categories, settings/theme singletons, admin panel patterns). Default theme `gold-white`.

This folder (`5Star/5star/`) is the git repo → `github.com/asifcbe/5star`, branch `main`. The parent `5Star/` folder holds old non-repo copies (`backend/`, `frontend/`, `assets/`, root `.env`) — don't edit those.

## Commands

Backend (`backend/`): `npm run dev` (nodemon) · `npm start` · `npm run seed:categories` (idempotent, 9 categories) · `npm run seed:dummy` (clears + reseeds dummy catalogue).
Frontend (`frontend/`): `npm start` (:3000, proxies to :5003) · `npm run build` (the "does it compile" check).
No tests or linter beyond CRA defaults. `node server.js` has no hot reload — restart the backend after backend edits.

## Environment

- Backend port **5003**. Frontend `REACT_APP_API_URL` (baked in at build time) and `package.json` `proxy` both point at it.
- All backend config lives in `backend/.env` (gitignored). `config/db.js` loads it by absolute path (works from any cwd, e.g. pm2) and resolves Mongo as: `MONGO_URI` → `MONGODB_URI` + `MONGODB_USERNAME` + `MONGODB_PASSWORD` (Atlas onboarding format; creds injected and URL-encoded) → `localhost`. `/fivestar` db name appended if missing. Nothing reads a project-root `.env` anymore.
- Other backend keys: `PORT`, `JWT_SECRET`, `CLIENT_URL` (comma-separated CORS allow-list — must contain exact origins, incl. https + www in prod), `RAZORPAY_KEY_ID/SECRET`, `ADMIN_SEED_NAME/EMAIL/PASSWORD` (admin auto-created on boot if missing).
- Frontend `.env`: `REACT_APP_API_URL`, `REACT_APP_RAZORPAY_KEY_ID`. Auth persisted in localStorage key `fiveStarUser`.

## Admin responsive layout

`frontend/src/styles/admin.css` (imported by `AdminLayout`) owns admin responsiveness. At ≤768px the sidebar becomes an off-canvas drawer behind a sticky top bar. Admin tables never reflow: wrap every table in `<div className="admin-table-wrap">` so it keeps its columns (cells don't wrap) and scrolls sideways at all widths, phones included; add `admin-table-compact` for narrow tables that don't need the 680px minimum. Use `admin-cards` (auto-fill grid) rather than `grid-3` for card lists. Put layout-critical styles on classes (`admin-page-head`, `admin-page-title`, `admin-checks`, `admin-filters`, `admin-tiles`, `variant-row`, `admin-upload-row`), not inline styles, because media queries can't override inline styles.

## Images

- Uploads go to `backend/uploads/` (local disk, gitignored; DB stores `/uploads/...`). `getImageUrl()` in `frontend/src/utils/api.js` prefixes relative paths with the API URL.
- The `assets/` sample-image folder is **not in this repo**. `server.js` still serves `../assets` at `/assets` and `seedDummyData.js` references `/assets/...` images + logo — so **don't run `seed:dummy` in production** (broken images). Real products/logo are added via Admin.

## Production deployment (AWS EC2 Ubuntu)

- Layout: repo cloned at `~/5star` as user `ubuntu`. Backend run by pm2 as **`5star-api`** (`cd ~/5star/backend && pm2 start server.js --name 5star-api`; `pm2 save` + `pm2 startup` done/required). Never run pm2 with sudo (separate root daemon).
- nginx site `/etc/nginx/sites-available/5star`: serves `/var/www/5star` (copy of `frontend/build`), proxies `^/(api|uploads)/` → `127.0.0.1:5003`, `try_files $uri /index.html` for React Router, `client_max_body_size 20M`. HTTPS via certbot (`--nginx -d fivestarbagsandsuitcases.in -d www.fivestarbagsandsuitcases.in`).
- Prod values: `CLIENT_URL=https://fivestarbagsandsuitcases.in,https://www.fivestarbagsandsuitcases.in`, `REACT_APP_API_URL=https://fivestarbagsandsuitcases.in`.
- DNS at Hostinger (hPanel → Domains → DNS): A `@` → EC2 Elastic IP, CNAME `www` → apex. MongoDB Atlas Network Access must allow the Elastic IP (`/32`).
- Instance disk is small (~6.7 GB root, ~82% used). If short on space, grow the EBS volume (`growpart` + `resize2fs`) or build the frontend on the Mac and `scp` the build up. SSH key: `../../saliheen-key.pem`.
- Update flow: push from Mac → on server `cd ~/5star && git pull`; backend `npm ci --omit=dev && pm2 restart 5star-api`; frontend `npm ci && npm run build && sudo cp -r build/* /var/www/5star/`.
- Debug: `pm2 logs 5star-api --lines 30 --nostream` (pm2 "online" ≠ Mongo connected — look for `✅ MongoDB Connected`), `curl localhost:5003/api/health`, `sudo tail /var/log/nginx/error.log`.
