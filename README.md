# अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट (ABSSD) Website

A professional, modern website for Akhil Bhartiya Swachta Sewa Dal Trust, built with React, Node.js, Express, and MongoDB.

## Project Structure

```
NGO/
├── Frontend/          # React + Vite + Tailwind CSS v4
└── Backend/           # Node.js + Express + MongoDB
 # अखिल भारतीय स्वच्छता सेवा दल ट्रस्ट (ABSSD) — Website & Admin

This repository contains the codebase for the ABSSD website and admin portal:

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + MongoDB (Mongoose)

This README documents how to run, develop, and deploy the project locally and lists important behaviors, environment variables and troubleshooting notes.

## Repository layout

```

/Frontend # React (Vite) app, Tailwind CSS, admin pages
/Backend # Express API, Mongoose models, controllers & jobs
README.md
start.sh
stop.sh
PROJECT.md

```

## Features (overview)

- Public website: Home, About, Services, Gallery, News, Contact
- Admin portal: user management, gallery & news management, membership exports (CSV / XLSX)
- User flows: registration, email verification, password reset (backend + frontend pages)
- Payments: payment attempts persistence and reconcile job (Razorpay integration)
- ID Cards: printable membership ID cards from the admin UI
- Admin utilities: export users (CSV/XLSX), filters, and print ID directly from users list

## Prerequisites

- Node.js >= 18
- npm (or yarn)
- MongoDB (local or cloud URI)
- Optional: `xlsx` package in Frontend for Excel export (if using Excel export)

## Environment variables

Create `.env` files in both `Frontend/` and `Backend/` as needed. Example entries:

Backend (`Backend/.env`)
```

PORT=5000
MONGODB_URI=mongodb://localhost:27017/abssd
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:5173
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your_smtp_user
EMAIL_SMTP_PASS=your_smtp_pass
RAZORPAY_KEY=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret

```

Frontend (`Frontend/.env`)
```

VITE_API_BASE_URL=http://localhost:5000/api

````

Notes:
- Keep secrets out of source control. Use `.env.example` as a template.
- If you use a cloud MongoDB provider (Atlas), set `MONGODB_URI` accordingly.

## Quick start — development

You can use the helper scripts or run servers manually.

Using helper scripts (recommended for local dev):

```bash
# from repo root
./start.sh

# to stop
./stop.sh
````

Manual (frontend + backend in separate terminals):

Frontend:

```bash
cd Frontend
npm install
# if you plan to use Excel export in-browser, install xlsx
npm install xlsx
npm run dev
# Default dev URL: http://localhost:5173
```

Backend:

```bash
cd Backend
npm install
# copy .env.example -> .env and update values
npm run dev   # uses nodemon in development
# or `npm start` for production
# Default API URL: http://localhost:5000
```

Open the frontend in your browser and sign in to the admin area to test admin flows.

## Admin flows & notes

- User listing supports filtering (position, referredBy limited to team leaders, membership type/status, role) and debounced search.
- Export users: CSV (built-in) and Excel (.xlsx) — Excel uses dynamic import of `xlsx` and works if the package is installed in `Frontend`.
- Print ID: Admin Users table includes a "Print ID" action; this opens the user details modal and prints the ID card in a popup window. Popups must be allowed.
- Press `Esc` to close the user details modal or the ID card preview.

## Important implementation details and known issues

- Reconcile job: The backend runs a reconcile job for payments. If you see transient errors on server start indicating the job ran before DB connection, move the reconcile start into the DB-connected callback (this is recommended for production deployments).
- Dynamic imports: Excel export uses a dynamic import so the frontend doesn't hard-depend on the `xlsx` package unless the user triggers an Excel export.
- ID card scaling: The ID card component contains logic to fit long names into two lines by computing a safe font-size at runtime using ResizeObserver. This relies on browser DOM (no server side rendering for the ID card print).

## API quick reference

Base URL: `${VITE_API_BASE_URL || http://localhost:5000}/api`

Selected endpoints (see controllers for more):

- `POST /api/auth/register` — create user
- `POST /api/auth/login` — login (returns JWT)
- `POST /api/auth/forgot-password` — request password reset
- `POST /api/auth/reset-password` — reset password with token
- `GET /api/users` — list users (admin)
- `GET /api/gallery` — list gallery
- `POST /api/gallery` — create gallery (admin)
- `GET /api/events` — list events
- `POST /api/contact` — submit contact

For full list see `Backend/controllers` and `Backend/routes` folders.

## Running tests & linters

- Frontend linting (ESLint):

```bash
cd Frontend
npm run lint
```

- Backend: unit tests are not included by default. Add Jest/Mocha if you plan to add test suites.

## Build & deploy

Frontend production build:

```bash
cd Frontend
npm run build
# serve the `dist` directory with any static server or integrate with your preferred hosting provider
```

Backend production:

```bash
cd Backend
npm install --production
NODE_ENV=production node server.js
```

Deployment notes:

- This project previously included Vercel configuration but can be deployed to any Node+Mongo hosting (Heroku, Railway, DigitalOcean App Platform, AWS, etc.).
- Ensure environment variables are configured on the host and that the reconcile job starts only after the DB connection is established.

## Troubleshooting

- "Popup blocked" when printing ID: allow popups for the domain or use the browser's Print dialog instead (open the ID card modal and click the Print button).
- Excel export says `xlsx` is missing: install the package in the `Frontend` folder: `npm install xlsx`.
- Backend reconcile job errors on startup: see "Important implementation details" above.
- CORS issues: ensure `FRONTEND_URL` in backend `.env` matches your frontend origin.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Implement changes and add tests where possible
4. Open a pull request describing the change and rationale

## Contact & support

For help or questions, reach out to project maintainers:

- Phone: +91 8860442044
- Email: info@abssd.org

## License

ISC 4. Submit a pull request
