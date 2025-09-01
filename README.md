# Ow1 Studies & Researches – Options Pricing Lab  

A full-stack **Options Pricing Web App** built with **FastAPI + React + TailwindCSS**, designed for portfolio demonstration.  
This project replicates a **trading-terminal style interface** (similar to Binance) where users can calculate option prices, Greeks, and visualize option chains with a clean, Apple-grade UI.  

🚀 **Live Demo**: [Your Cloud Run URL will appear here after deployment]  
📂 **Source Code**: [GitHub Repo Link]  

---

## ✨ Features  

- **Option Pricing Models**  
  - Black–Scholes (European)  
  - Binomial CRR (European & American)  

- **Greeks Calculation**  
  - Delta (Δ), Gamma (Γ), Vega (ν), Theta (Θ), Rho (ρ)  

- **Implied Volatility Estimation**  
  - Numerical solver using Brent/ Secant hybrid method  

- **Interactive Option Chain**  
  - Strike prices vs. premiums  
  - Dynamic charts and tables  

- **Modern UI/UX**  
  - Dark trading-terminal design  
  - Fully responsive layout  
  - Branding: **Ow1 Studies & Researches**  

---

## 🛠️ Tech Stack  

- **Backend**: FastAPI (Python), NumPy, SciPy  
- **Frontend**: React, TailwindCSS, Recharts  
- **Containerization**: Docker  
- **Deployment**: Google Cloud Run (serverless, scalable)  

---

## 📦 How to Run (Local)  

```bash
# Clone the repo
git clone https://github.com/yourusername/ow1-options-lab.git
cd ow1-options-lab

# Build docker image
docker build -t ow1-options-lab .

# Run locally
docker run -p 8080:8080 ow1-options-lab
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
