
import math
import json
from typing import List, Optional, Literal, Dict
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import uvicorn
import random

app = FastAPI(title="Ow1 Studies & Researches - Options API", version="1.0.0")

# ---- Utility: standard normal CDF/PDF without scipy ----
SQRT_2PI = math.sqrt(2*math.pi)
def norm_pdf(x: float) -> float:
    return math.exp(-0.5*x*x) / SQRT_2PI

def norm_cdf(x: float) -> float:
    # Abramowitz-Stegun approximation for Phi(x)
    # Reflect for negative x for better precision
    k = 1.0 / (1.0 + 0.2316419 * abs(x))
    a1, a2, a3, a4, a5 = 0.319381530, -0.356563782, 1.781477937, -1.821255978, 1.330274429
    poly = ((((a5*k + a4)*k + a3)*k + a2)*k + a1)*k
    approx = 1.0 - (1.0/SQRT_2PI) * math.exp(-0.5*x*x) * poly
    return approx if x >= 0 else 1.0 - approx

# ---- Black-Scholes European pricing ----
def black_scholes(S: float, K: float, r: float, q: float, sigma: float, T: float, type_: Literal["call","put"]) -> float:
    if sigma <= 0 or T <= 0 or S <= 0 or K <= 0:
        return max(0.0, (S - K) if type_=="call" else (K - S))
    d1 = (math.log(S/K) + (r - q + 0.5*sigma*sigma)*T) / (sigma*math.sqrt(T))
    d2 = d1 - sigma*math.sqrt(T)
    if type_=="call":
        return S*math.exp(-q*T)*norm_cdf(d1) - K*math.exp(-r*T)*norm_cdf(d2)
    else:
        return K*math.exp(-r*T)*norm_cdf(-d2) - S*math.exp(-q*T)*norm_cdf(-d1)

def greeks_bs(S, K, r, q, sigma, T, type_):
    if sigma<=0 or T<=0:
        return {"delta": 1.0 if type_=="call" and S>K else (-1.0 if type_=="put" and S<K else 0.0),
                "gamma": 0.0, "vega": 0.0, "theta": 0.0, "rho": 0.0}
    d1 = (math.log(S/K) + (r - q + 0.5*sigma*sigma)*T) / (sigma*math.sqrt(T))
    d2 = d1 - sigma*math.sqrt(T)
    pdf = norm_pdf(d1)
    if type_=="call":
        delta = math.exp(-q*T)*norm_cdf(d1)
        theta = (-S*pdf*sigma*math.exp(-q*T)/(2*math.sqrt(T))) - r*K*math.exp(-r*T)*norm_cdf(d2) + q*S*math.exp(-q*T)*norm_cdf(d1)
        rho = K*T*math.exp(-r*T)*norm_cdf(d2)
    else:
        delta = -math.exp(-q*T)*norm_cdf(-d1)
        theta = (-S*pdf*sigma*math.exp(-q*T)/(2*math.sqrt(T))) + r*K*math.exp(-r*T)*norm_cdf(-d2) - q*S*math.exp(-q*T)*norm_cdf(-d1)
        rho = -K*T*math.exp(-r*T)*norm_cdf(-d2)
    gamma = math.exp(-q*T)*pdf/(S*sigma*math.sqrt(T))
    vega = S*math.exp(-q*T)*pdf*math.sqrt(T)
    return {"delta": delta, "gamma": gamma, "vega": vega, "theta": theta, "rho": rho}

# ---- Binomial (CRR) for American/European ----
def binomial_crr(S, K, r, q, sigma, T, N, type_, american=True):
    dt = T/N
    u = math.exp(sigma*math.sqrt(dt))
    d = 1/u
    disc = math.exp(-r*dt)
    p = (math.exp((r-q)*dt) - d) / (u - d)
    # terminal payoffs
    values = [0.0]*(N+1)
    for i in range(N+1):
        ST = S*(u**i)*(d**(N-i))
        values[i] = max(0.0, ST - K) if type_=="call" else max(0.0, K - ST)
    # backward induction
    for step in range(N-1, -1, -1):
        for i in range(step+1):
            cont = disc*(p*values[i+1] + (1-p)*values[i])
            if american:
                S_t = S*(u**i)*(d**(step-i))
                exc = max(0.0, S_t - K) if type_=="call" else max(0.0, K - S_t)
                values[i] = max(cont, exc)
            else:
                values[i] = cont
    return values[0]

# ---- Implied Vol via Brent's method ----
def implied_vol(price_target, S, K, r, q, T, type_, tol=1e-6, max_iter=120):
    # bracket sigma in [1e-6, 5.0]
    a, b = 1e-6, 5.0
    fa = black_scholes(S,K,r,q,a,T,type_) - price_target
    fb = black_scholes(S,K,r,q,b,T,type_) - price_target
    if fa*fb > 0:
        # not bracketed; fall back to simple secant starting at 0.2
        x0, x1 = 0.2, 0.5
        f0 = black_scholes(S,K,r,q,x0,T,type_) - price_target
        f1 = black_scholes(S,K,r,q,x1,T,type_) - price_target
        for _ in range(max_iter):
            if abs(f1 - f0) < 1e-12:
                break
            x2 = x1 - f1*(x1-x0)/(f1-f0)
            if x2<=0: x2 = 1e-6
            f2 = black_scholes(S,K,r,q,x2,T,type_) - price_target
            if abs(f2) < tol: return float(x2)
            x0, f0, x1, f1 = x1, f1, x2, f2
        return max(1e-6, min(5.0, float(x1)))
    # Brent
    lo, hi = a, b
    flo, fhi = fa, fb
    c, fc = lo, flo
    d = e = hi - lo
    for _ in range(max_iter):
        if fhi == 0: return float(hi)
        if flo*fhi > 0:
            lo, flo, c, fc = c, fc, lo, flo
        if abs(flo) < abs(fhi):
            lo, hi = hi, lo
            flo, fhi = fhi, flo
        m = 0.5*(lo - hi)
        if abs(m) < tol or fhi == 0:
            return float(hi)
        if abs(e) > tol and abs(fc) > abs(fhi):
            s = fhi/fc
            if lo == c:
                p = 2*m*s
                q = 1 - s
            else:
                q = fc/flo
                r = fhi/flo
                p = s*(2*m*q*(q - r) - (hi - c)*(r - 1))
                q = (q - 1)*(r - 1)*(s - 1)
            if p > 0: q = -q
            p = abs(p)
            accept = (2*p < min(3*m*q - abs(tol*q), abs(e*q)))
            if accept:
                e, d = d, p/q
            else:
                d = m
                e = m
        else:
            d = m
            e = m
        c, fc = hi, fhi
        if abs(d) > tol:
            hi += d
        else:
            hi += tol if m > 0 else -tol
        fhi = black_scholes(S,K,r,q,hi,T,type_) - price_target
    return float(hi)

class PriceRequest(BaseModel):
    S: float
    K: float
    r: float
    q: float = 0.0
    sigma: float
    T: float
    type: Literal["call","put"]
    model: Literal["bs_euro","binom_euro","binom_amer"] = "bs_euro"
    steps: int = 200

@app.post("/api/price")
def price(req: PriceRequest):
    if req.model == "bs_euro":
        price = black_scholes(req.S, req.K, req.r, req.q, req.sigma, req.T, req.type)
    elif req.model == "binom_euro":
        price = binomial_crr(req.S, req.K, req.r, req.q, req.sigma, req.T, req.steps, req.type, american=False)
    else:
        price = binomial_crr(req.S, req.K, req.r, req.q, req.sigma, req.T, req.steps, req.type, american=True)
    g = greeks_bs(req.S, req.K, req.r, req.q, req.sigma, req.T, req.type)
    return {"price": price, "greeks": g}

class IVRequest(BaseModel):
    S: float
    K: float
    r: float
    q: float = 0.0
    T: float
    type: Literal["call","put"]
    price: float

@app.post("/api/implied_vol")
def iv(req: IVRequest):
    try:
        sigma = implied_vol(req.price, req.S, req.K, req.r, req.q, req.T, req.type)
        return {"implied_vol": sigma}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/mock_chain")
def mock_chain(S: float = 100, r: float = 0.02, q: float = 0.0, sigma: float = 0.3, T_days: int = 30):
    # produce a simple synthetic option chain for UI demos
    T = max(1, T_days)/365.0
    strikes = [round(S*(0.6 + 0.05*i),2) for i in range(16)]  # 60% to 135% moneyness
    rows = []
    for K in strikes:
        cp = black_scholes(S,K,r,q,sigma,T,"call")
        pp = black_scholes(S,K,r,q,sigma,T,"put")
        rows.append({
            "strike": K,
            "call": round(cp, 4),
            "put": round(pp, 4),
            "iv_call": round(implied_vol(cp, S,K,r,q,T,"call"),4),
            "iv_put": round(implied_vol(pp, S,K,r,q,T,"put"),4),
        })
    return {"S": S, "T_days": T_days, "r": r, "q": q, "sigma": sigma, "chain": rows}

# Serve static frontend
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def root():
    return FileResponse("static/index.html")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=False)
