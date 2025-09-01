
# Ow1 Studies & Researches — Options Lab

Apple‑grade, Binance‑style options pricing UI + FastAPI backend. Includes:
- European & American pricing (Black–Scholes, Binomial CRR)
- Greeks (Δ Γ ν θ ρ)
- Implied volatility solver
- Synthetic option chain + chart
- Clean dark UI that mirrors a trading terminal layout
- Dockerized for one‑click deploy to **Google Cloud Run** (permanent URL, no ngrok)

> Educational demo only. No financial advice.

## Quickstart (local)
```bash
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py  # http://localhost:8080
```

## Deploy to Google Cloud Run (recommended)
Prereqs:
- A Google Cloud project with billing enabled
- gcloud CLI installed and authenticated
- Artifact Registry API and Cloud Run API enabled
- Your GitHub repo connected to Cloud Build (optional for CI/CD)

### One‑time setup
```bash
# Set your project and region
gcloud config set project YOUR_PROJECT_ID
gcloud config set run/region YOUR_REGION   # e.g., asia-south1 or us-central1

# Build and deploy from source using Cloud Buildpacks (no Docker needed)
gcloud run deploy ow1-options-lab \
  --source . \
  --allow-unauthenticated \
  --port 8080
```

This will output a **permanent HTTPS URL** like:
```
https://ow1-options-lab-xxxxxxxx-uc.a.run.app
```

### Deploy with Docker (optional)
```bash
# Build container
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT_ID/ow1/ow1-options-lab:latest

# Deploy image
gcloud run deploy ow1-options-lab \
  --image REGION-docker.pkg.dev/PROJECT_ID/ow1/ow1-options-lab:latest \
  --allow-unauthenticated \
  --port 8080
```

### GitHub CI/CD (optional)
- Create a new public GitHub repo and push this folder.
- In Google Cloud Console → Cloud Build → Triggers: **Connect repository**, pick your repo.
- Make a trigger that runs on `main` pushes:
  - Build: Cloud Buildpacks from source
  - Deploy: Cloud Run service `ow1-options-lab`, port `8080`
Now every push to `main` auto‑deploys, giving you a **stable, portfolio‑ready URL**.

## Project structure
```
.
├─ main.py               # FastAPI with pricing endpoints
├─ requirements.txt
├─ Dockerfile
└─ static/
   ├─ index.html         # React + Tailwind via CDN
   └─ ui.jsx             # SPA UI
```

## Notes
- No API keys; the option chain is synthetic for deterministic demos.
- You can wire real data (e.g., Binance) by adding a new `/api/market` route and calling their public endpoints from the backend. Keep rate limits and terms in mind.
- For “Apple‑grade” finesse, tweak Tailwind classes, spacing, easing, and add micro‑interactions.
- Branding: “Ow1 Studies & Researches” is integrated in header & footer.
- If you need a custom domain, map it in Cloud Run → Custom domains.

## License
MIT — do as you wish; attribution appreciated.
