import time
from flask import Flask, jsonify, render_template
import yfinance as yf
from portfolio_data import PORTFOLIOS

app = Flask(__name__)

_cache: dict = {}
CACHE_TTL = 60  # seconds


def fetch_prices(tickers: list[str]) -> dict:
    key = ",".join(sorted(tickers))
    if key in _cache and time.time() - _cache[key]["ts"] < CACHE_TTL:
        return _cache[key]["data"]

    data = {}
    for ticker in tickers:
        try:
            t = yf.Ticker(ticker)
            info = t.fast_info
            price = info.last_price or 0
            prev  = info.previous_close or price
            change_pct = ((price - prev) / prev * 100) if prev else 0

            hist = t.history(period="1y")
            high_52w = float(hist["High"].max()) if not hist.empty else 0
            low_52w  = float(hist["Low"].min())  if not hist.empty else 0

            full = t.info
            data[ticker] = {
                "price":       round(price, 4),
                "change_pct":  round(change_pct, 2),
                "pe":          full.get("trailingPE"),
                "eps":         full.get("trailingEps"),
                "market_cap":  full.get("marketCap"),
                "beta":        full.get("beta"),
                "high_52w":    round(high_52w, 2),
                "low_52w":     round(low_52w, 2),
            }
        except Exception as e:
            data[ticker] = {"price": 0, "change_pct": 0, "error": str(e)}

    _cache[key] = {"ts": time.time(), "data": data}
    return data


def fetch_usdthb() -> float:
    key = "USDTHB"
    if key in _cache and time.time() - _cache[key]["ts"] < 300:
        return _cache[key]["data"]
    try:
        rate = yf.Ticker("THB=X").fast_info.last_price or 32.7
    except Exception:
        rate = 32.7
    _cache[key] = {"ts": time.time(), "data": rate}
    return rate


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/portfolio")
def api_portfolio():
    usdthb = fetch_usdthb()
    result = {"usdthb": round(usdthb, 2), "portfolios": {}}

    for port_id, port in PORTFOLIOS.items():
        tickers = [h["ticker"] for h in port["holdings"]]
        prices  = fetch_prices(tickers)

        total_cost_usd  = 0
        total_value_usd = 0
        holdings_out    = []

        for h in port["holdings"]:
            t    = h["ticker"]
            p    = prices.get(t, {})
            px   = p.get("price", 0)
            cost = h["qty"] * h["buy_price"]
            val  = h["qty"] * px
            gain = val - cost
            gain_pct = (gain / cost * 100) if cost else 0

            # Rebalance: target vs current weight (computed after full pass)
            holdings_out.append({
                "ticker":       t,
                "qty":          h["qty"],
                "buy_price":    h["buy_price"],
                "price":        px,
                "change_pct":   p.get("change_pct", 0),
                "cost_usd":     round(cost, 2),
                "value_usd":    round(val, 2),
                "value_thb":    round(val * usdthb, 0),
                "gain_usd":     round(gain, 2),
                "gain_thb":     round(gain * usdthb, 0),
                "gain_pct":     round(gain_pct, 2),
                "target_pct":   h["target_pct"],
                "pe":           p.get("pe"),
                "eps":          p.get("eps"),
                "beta":         p.get("beta"),
                "high_52w":     p.get("high_52w"),
                "low_52w":      p.get("low_52w"),
            })
            total_cost_usd  += cost
            total_value_usd += val

        # Add current_pct & rebalance_diff
        for h in holdings_out:
            cur_pct = (h["value_usd"] / total_value_usd * 100) if total_value_usd else 0
            h["current_pct"] = round(cur_pct, 2)
            h["rebalance_diff"] = round(h["target_pct"] - cur_pct, 2)

        total_gain_usd = total_value_usd - total_cost_usd
        total_gain_pct = (total_gain_usd / total_cost_usd * 100) if total_cost_usd else 0

        result["portfolios"][port_id] = {
            "name":            port["name"],
            "total_value_usd": round(total_value_usd, 2),
            "total_value_thb": round(total_value_usd * usdthb, 0),
            "total_cost_usd":  round(total_cost_usd, 2),
            "total_gain_usd":  round(total_gain_usd, 2),
            "total_gain_thb":  round(total_gain_usd * usdthb, 0),
            "total_gain_pct":  round(total_gain_pct, 2),
            "holdings":        holdings_out,
        }

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, port=5050)
