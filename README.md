# ADTRIC Realty - Real Estate Website (MERN)

A real estate website with a public site, an enquiry system with CRM push, and an admin panel.

- **web/** - Next.js (App Router) frontend, deployed on Vercel
- **api/** - Express + Mongoose REST API, deployed on Render
- **Database** - MongoDB Atlas
- **Images** - Cloudflare R2 (S3-compatible), served through a public CDN host

All data comes from the Express API. The Next.js app has no API routes or Server Actions.

## Features

**Public site**
- Homepage with hero, Featured Projects (3) and an enquiry section
- `/projects` - filters (location, property type, min/max price), sort by price, pagination; filters and page live in the URL
- `/projects/[slug]` - server-loaded project details, gallery with lightbox, its own title and meta description, enquiry form with the project preselected
- Enquiry form - client and server validation, per-field errors, no page reload, success message

**API**
- Public: list/filter/paginate projects, locations, project options, project by slug, create enquiry
- Server validation (mobile must match `^[6-9]\d{9}$`)
- Duplicate protection: same mobile + same project within 24 hours returns "We have already received your enquiry."
- CRM push to `CRM_WEBHOOK_URL` with a 5 second timeout; the result is saved on the enquiry as `Sent` or `Failed`
- Rate limit on the enquiry endpoint (5 per minute per IP) and on admin login
- Email alert for each new enquiry (optional, via SMTP)

**Admin panel** (`/admin`)
- Login (bcrypt + JWT)
- Projects: list, add, edit, delete, replace cover, add/remove gallery images
- Enquiries: list with project filter and pagination, change status, see CRM status, retry a failed CRM push
- Light and dark mode

## Project structure

```
api/
  config/        database connection
  controllers/   request handlers
  middleware/    auth, upload, rate limits, error handler
  models/        Project, Enquiry, Admin
  routes/        public, enquiry and admin routes
  seed/          seed scripts + the pictures used by the seed
  utils/         R2 upload, CRM push, email, slug helper
  server.js
web/
  app/           pages (home, projects, project detail, admin)
  components/    UI components (admin ones in components/admin)
  lib/           API helpers and formatting
```

## Local setup

Requirements: Node.js 20+ and a MongoDB database (Atlas free tier works).

### 1. API

```bash
cd api
npm install
cp .env.example .env     # then fill in the values (see below)
npm run seed:admin       # creates the admin user
npm run seed:projects    # 6 real projects (all featured); uploads the pictures in seed/images/ to R2
npm run seed:images       # one-time: saves the 6 projects' pictures into seed/images/ (already done if the folders exist)
npm run dev              # http://localhost:5000
```

### 2. Web

```bash
cd web
npm install
cp .env.example .env.local
npm run dev              # http://localhost:3000
```

Open `/`, `/projects`, `/projects/palm-crest-residences` and `/admin/login`.

## Environment variables

### api/.env

| Variable | Purpose |
| --- | --- |
| `PORT` | Port for the API (default 5000) |
| `MONGO_URI` | MongoDB connection string, including the database name (e.g. `/adtric`) |
| `JWT_SECRET` | Long random string used to sign admin tokens |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used by `seed:admin` (password: 8+ characters; quote it if it contains `#`) |
| `CLIENT_URL` | Frontend origin allowed by CORS, no trailing slash |
| `CRM_WEBHOOK_URL` | CRM endpoint that receives each enquiry |
| `SMTP_SERVER`, `SMTP_PORT`, `SMTP_LOGIN`, `SMTP_KEY` | SMTP account for email alerts (optional) |
| `MAIL_FROM`, `MAIL_TO` | Sender (must be verified with the SMTP provider) and receiver of alerts |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | Cloudflare R2 credentials |
| `R2_PUBLIC_BASE_URL` | Public base URL of the bucket, no trailing slash |
| `R2_KEY_PREFIX` | Folder inside the bucket: `adtric/local`. This demo uses the same folder for local and production, so both show the same images (a real production setup would use a separate folder such as `adtric/prod`) |

### web/.env.local

| Variable | Purpose |
| --- | --- |
| `API_URL` | API base URL used by the server when rendering pages |
| `NEXT_PUBLIC_API_URL` | API base URL used by the browser (enquiry form, admin) |
| `IMAGE_HOST` | Hostname images are served from; allowed in `next/image` |

`NEXT_PUBLIC_*` values are baked in at build time, so redeploy after changing them.

## Seed scripts

- `npm run seed:admin` - creates the admin, or resets its password if it already exists.
- `npm run seed:projects` - **deletes all projects** and inserts 6 projects, uploading their pictures from `api/seed/images/<project>/` to R2 (`cover.*` is the cover, `gallery-N.*` the gallery). The seed does not depend on old R2 files. Run it once on an empty database, not on a database that already has real data.

## API reference

Responses use `{ "success": true, "data": ... }` or `{ "success": false, "message": "...", "errors": { field: message } }`.

### Public

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/projects` | Query: `location`, `propertyType`, `minPrice`, `maxPrice`, `featured`, `sort` (`price_asc` / `price_desc`), `page`, `limit` |
| GET | `/api/projects/locations` | Distinct locations for the filter |
| GET | `/api/projects/options/list` | `_id` + name of every project, for dropdowns |
| GET | `/api/projects/:slug` | One project |
| POST | `/api/enquiries` | Body: `name`, `mobile`, `email?`, `project`, `message?`. Returns 201, 400 (validation), 409 (duplicate in 24h), 429 (rate limit) |

### Admin (Bearer token, except login)

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/admin/login` | Returns a JWT valid for one day |
| GET | `/api/admin/projects` | Paginated, includes unpublished |
| GET / PUT / DELETE | `/api/admin/projects/:id` | `PUT` accepts multipart (cover + gallery) |
| POST | `/api/admin/projects` | Multipart: fields + `coverImage` + `gallery` |
| DELETE | `/api/admin/projects/:id/gallery` | Body: `{ "image": "<url>" }` |
| GET | `/api/admin/enquiries` | Paginated, optional `project` filter |
| PATCH | `/api/admin/enquiries/:id/status` | `New`, `Contacted`, `Site Visit Done`, `Closed` |
| POST | `/api/admin/enquiries/:id/retry-crm` | Pushes the enquiry to the CRM again |

## Design decisions

- **Server-rendered public pages** so project content and per-page metadata are in the HTML for search engines.
- **Filters in the URL** so a filtered list can be shared or bookmarked, and the back button works.
- **Validation on both sides.** The client gives instant feedback; the server is the source of truth.
- **CRM failures never block the user.** The enquiry is saved first; the CRM push result is stored and can be retried from the admin.
- **Images in R2**, not on the API server, because Render's disk is not persistent.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md).
