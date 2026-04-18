import { useState, useMemo } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────

const TIERS = [
  {
    key: "poor", min: 0, max: 2, label: "Poor",
    risk: "High", riskPct: 100, stars: 1,
    color: "#E24B4A", bg: "#FCEBEB", text: "#791F1F",
    border: "#F7C1C1", riskColor: "#E24B4A",
    badge: { bg: "#FCEBEB", text: "#791F1F", label: "High risk" },
  },
  {
    key: "avg", min: 2, max: 4, label: "Average",
    risk: "Medium", riskPct: 60, stars: 2,
    color: "#EF9F27", bg: "#FAEEDA", text: "#633806",
    border: "#FAC775", riskColor: "#EF9F27",
    badge: { bg: "#FAEEDA", text: "#633806", label: "Medium risk" },
  },
  {
    key: "good", min: 4, max: 6, label: "Good",
    risk: "Low", riskPct: 28, stars: 4,
    color: "#639922", bg: "#EAF3DE", text: "#27500A",
    border: "#C0DD97", riskColor: "#639922",
    badge: { bg: "#EAF3DE", text: "#27500A", label: "Low risk" },
  },
  {
    key: "exc", min: 6, max: 999, label: "Excellent",
    risk: "Low", riskPct: 15, stars: 5,
    color: "#1D9E75", bg: "#E1F5EE", text: "#085041",
    border: "#9FE1CB", riskColor: "#1D9E75",
    badge: { bg: "#E1F5EE", text: "#085041", label: "Low risk" },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTier(netYield) {
  return TIERS.find((t) => netYield >= t.min && netYield < t.max) || TIERS[0];
}

function fmtINR(v) {
  v = Math.round(v);
  if (v >= 10000000) return "₹" + (v / 10000000).toFixed(2) + " Cr";
  if (v >= 100000)   return "₹" + (v / 100000).toFixed(2) + " L";
  return "₹" + v.toLocaleString("en-IN");
}

function fmtShort(v) {
  v = Math.round(v);
  if (v >= 10000000) return "₹" + (v / 10000000).toFixed(1) + " Cr";
  if (v >= 100000)   return "₹" + (v / 100000).toFixed(1) + " L";
  return "₹" + v.toLocaleString("en-IN");
}

function getInsight(netYield, pbRaw) {
  const y = parseFloat(netYield.toFixed(2));
  if (y <= 0) return "Costs exceed rental income. Reduce expenses or raise rent to generate positive returns.";
  const minR = Math.round(y + 6), maxR = Math.round(y + 8);
  const adjMin = Math.round(pbRaw * 0.7), adjMax = Math.round(pbRaw * 0.8);
  if (y < 2) return `At ${y.toFixed(2)}% net yield, returns lag behind fixed deposits. Renegotiate rent or reduce acquisition cost.`;
  if (y < 4) return `A ${y.toFixed(2)}% net yield is modest but workable. With appreciation, total return could reach ${minR}–${maxR}%. Recovery in ${adjMin}–${adjMax} years.`;
  if (y < 6) return `Solid ${y.toFixed(2)}% net yield — outpaces most debt instruments. Combined total return may reach ${minR}–${maxR}%. Recovery in ${adjMin}–${adjMax} years.`;
  return `Excellent ${y.toFixed(2)}% net yield — well above market average. Projected total return ${minR}–${maxR}%. Recovery in approximately ${adjMin}–${adjMax} years.`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Slider({ id, label, value, onChange, min, max, step, accentColor, display }) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <div style={{ marginBottom: "1.2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
        <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 500 }}>{display}</span>
      </div>
      <div style={{ position: "relative", height: 5, borderRadius: 3, background: "#e5e7eb", marginBottom: 5 }}>
        {/* filled track */}
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          borderRadius: 3, background: accentColor, width: `${pct}%`,
          transition: "width 0.1s",
        }} />
        {/* native range — invisible, sits on top */}
        <input
          type="range" id={id} min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            opacity: 0, cursor: "pointer", zIndex: 3,
          }}
        />
        {/* custom thumb */}
        <div style={{
          position: "absolute", top: "50%", transform: "translateY(-50%)",
          left: `calc(${pct}% - 7.5px)`,
          width: 15, height: 15, borderRadius: "50%",
          background: "#fff", border: `2px solid ${accentColor}`,
          pointerEvents: "none", transition: "left 0.1s", zIndex: 2,
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af" }}>
        <span>{fmtShort(min)}</span>
        <span>{fmtShort(max)}</span>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, accentColor }) {
  return (
    <div style={{ background: "#f9fafb", borderRadius: 12, padding: "1rem 1.1rem", position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: 0, left: 0, width: 3, height: "100%",
        borderRadius: "3px 0 0 3px", background: accentColor, transition: "background 0.3s",
      }} />
      <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 500, lineHeight: 1, transition: "color 0.3s" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>{sub}</div>
    </div>
  );
}

function FormulaCard({ name, expr, result, accentColor }) {
  return (
    <div style={{
      background: "#f9fafb", borderRadius: 10,
      padding: "0.8rem 1rem",
      borderLeft: `3px solid ${accentColor || "#e5e7eb"}`,
    }}>
      <div style={{ fontSize: 10, fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 11, fontFamily: "monospace", color: "#9ca3af", marginBottom: 5, lineHeight: 1.5 }}>{expr}</div>
      <div style={{ fontSize: 15, fontWeight: 500, color: "#111827" }}>{result}</div>
    </div>
  );
}

function ReturnBar({ label, pct, color, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: "#6b7280", width: 80, flexShrink: 0, textAlign: "right" }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 3, background: color, width: `${pct}%`, transition: "width 0.4s, background 0.4s" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 500, width: 40, textAlign: "right", color: "#374151" }}>{value}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RentalYieldCalculator() {
  const [price,  setPrice]  = useState(10000000);
  const [rent,   setRent]   = useState(35000);
  const [costs,  setCosts]  = useState(1000);

  const calc = useMemo(() => {
    const grossAnnual = rent * 12;
    const annualCosts = costs * 12;
    const netAnnual   = grossAnnual - annualCosts;
    const grossYield  = price > 0 ? (grossAnnual / price) * 100 : 0;
    const netYield    = price > 0 ? (netAnnual   / price) * 100 : 0;

    const pbRaw = netAnnual > 0 ? price / netAnnual : Infinity;
    let pbY = 0, pbM = 0;
    if (pbRaw !== Infinity) {
      pbY = Math.floor(pbRaw);
      pbM = Math.round((pbRaw - pbY) * 12);
      if (pbM === 12) { pbY++; pbM = 0; }
    }

    const tier  = getTier(Math.max(0, netYield));
    const minR  = Math.round(netYield + 6);
    const maxR  = Math.round(netYield + 8);

    return { grossAnnual, annualCosts, netAnnual, grossYield, netYield, pbRaw, pbY, pbM, tier, minR, maxR };
  }, [price, rent, costs]);

  const {
    grossAnnual, annualCosts, netAnnual,
    grossYield, netYield, pbRaw, pbY, pbM,
    tier, minR, maxR,
  } = calc;

  const paybackStr   = pbRaw === Infinity ? "N/A" : `${pbY}y ${pbM}m`;
  const cursorPct    = Math.min(98, Math.max(2, (netYield / 8) * 100));
  const isNegative   = netYield <= 0;
  const verdictTier  = isNegative
    ? { label: "Negative yield", color: "#E24B4A", bg: "#FCEBEB", text: "#791F1F", border: "#F7C1C1" }
    : { label: `${tier.label} yield`, color: tier.color, bg: tier.bg, text: tier.text, border: tier.border };

  const netBarPct   = Math.min(100, Math.max(0, (netYield / 12) * 100));
  const totalBarPct = Math.min(100, Math.max(0, ((netYield + 7) / 20) * 100));

  return (
    <div style={{
      fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      color: "#111827", background: "transparent",
      padding: "1.5rem 0", maxWidth: 920, margin: "0 auto",
    }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0, lineHeight: 1.2 }}>Rental yield calculator</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "2px 0 0" }}>Real estate ROI analysis · India</p>
        </div>
        {/* Verdict pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "6px 14px", borderRadius: 99, fontSize: 13, fontWeight: 500,
          background: verdictTier.bg, color: verdictTier.text,
          border: `1.5px solid ${verdictTier.border}`,
          transition: "all 0.3s", whiteSpace: "nowrap",
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: verdictTier.color, display: "inline-block",
            animation: "ryPulse 1.6s ease-in-out infinite",
          }} />
          {verdictTier.label}
        </div>
      </div>

      {/* ── KPI row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10, marginBottom: "1.25rem" }}>
        <KpiCard label="Gross yield"    value={grossYield.toFixed(2) + "%"} sub="Before costs"       accentColor={tier.color} />
        <KpiCard label="Net yield"      value={netYield.toFixed(2) + "%"}   sub="After costs"        accentColor={tier.color} />
        <KpiCard label="Payback period" value={paybackStr}                  sub="To recover cost"    accentColor={tier.color} />
        <KpiCard label="Annual net"     value={netAnnual > 0 ? fmtShort(netAnnual) : "—"} sub="Take-home / year" accentColor={tier.color} />
      </div>

      {/* ── Main two-col ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>

        {/* Left — inputs */}
        <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 14, padding: "1.25rem" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "1.1rem" }}>
            Your property
          </div>

          <Slider id="sl-price" label="Purchase price" value={price} onChange={setPrice}
            min={500000} max={100000000} step={100000} accentColor="#378ADD" display={fmtShort(price)} />
          <Slider id="sl-rent" label="Monthly rent" value={rent} onChange={setRent}
            min={5000} max={500000} step={1000} accentColor="#1D9E75" display={fmtShort(rent)} />
          <Slider id="sl-costs" label="Monthly costs" value={costs} onChange={setCosts}
            min={0} max={50000} step={500} accentColor="#E24B4A" display={fmtShort(costs)} />

          {/* Divider */}
          <div style={{ height: "0.5px", background: "#e5e7eb", margin: "1.1rem 0" }} />

          {/* Mini stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "1.1rem" }}>
            {[
              { label: "Annual rent",  value: fmtINR(grossAnnual) },
              { label: "Annual costs", value: fmtINR(annualCosts) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#f9fafb", borderRadius: 8, padding: "0.6rem 0.8rem" }}>
                <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: "0.5px", background: "#e5e7eb", margin: "1.1rem 0" }} />

          {/* Return breakdown bars */}
          <div style={{ fontSize: 11, fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Return breakdown
          </div>
          <ReturnBar label="Net yield"    pct={netBarPct}   color={tier.color} value={netYield > 0 ? netYield.toFixed(2) + "%" : "—"} />
          <ReturnBar label="Appreciation" pct={87}          color="#1D9E75"    value="~7%" />
          <ReturnBar label="Total est."   pct={totalBarPct} color="#7F77DD"    value={netYield > 0 ? `${minR}–${maxR}%` : "—"} />
        </div>

        {/* Right col */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Yield spectrum */}
          <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 14, padding: "1.25rem", flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "1.1rem" }}>
              Yield spectrum
            </div>

            {/* Spectrum bar */}
            <div style={{ position: "relative", height: 10, borderRadius: 5, overflow: "visible", marginBottom: 5 }}>
              <div style={{ display: "flex", position: "absolute", inset: 0, borderRadius: 5, overflow: "hidden" }}>
                {["#FCEBEB","#FAEEDA","#EAF3DE","#E1F5EE"].map((c) => (
                  <span key={c} style={{ flex: 1, height: "100%", background: c }} />
                ))}
              </div>
              {/* Cursor */}
              <div style={{
                position: "absolute", top: -4, width: 3, height: 18,
                borderRadius: 2, background: "#111827",
                left: `${cursorPct}%`, transition: "left 0.35s",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af", marginBottom: "1rem" }}>
              {["0%","2%","4%","6%","8%+"].map((v) => <span key={v}>{v}</span>)}
            </div>

            {/* Tier rows */}
            {TIERS.map((t) => {
              const active = t.key === tier.key && netYield > 0;
              const rangeLabel = t.key === "poor" ? "< 2%" : t.key === "avg" ? "2–4%" : t.key === "good" ? "4–6%" : "6%+";
              return (
                <div key={t.key} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 11px", borderRadius: 9, marginBottom: 5,
                  border: active ? `1.5px solid ${t.color}` : "1px solid #e5e7eb",
                  background: active ? t.bg : "#fff",
                  transition: "border-color 0.25s, background 0.25s",
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#6b7280", width: 48, flexShrink: 0 }}>{rangeLabel}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1, color: active ? t.text : "#374151" }}>{t.label}</span>
                  {/* Badge */}
                  <span style={{
                    fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 99,
                    background: t.badge.bg, color: t.badge.text,
                  }}>{t.badge.label}</span>
                  {/* Active pulse dot */}
                  {active && (
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%", background: t.color,
                      flexShrink: 0, animation: "ryPulse 1.4s ease-in-out infinite",
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Investment quality */}
          <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 14, padding: "1.25rem" }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "1.1rem" }}>
              Investment quality
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              {/* Risk */}
              <div>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>Risk level</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 5, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 3,
                      background: tier.riskColor, width: `${tier.riskPct}%`,
                      transition: "width 0.4s, background 0.4s",
                    }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, minWidth: 48 }}>{tier.risk}</span>
                </div>
              </div>
              {/* Stars */}
              <div>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>Market rating</div>
                <div style={{ display: "flex", gap: 3 }}>
                  {[1,2,3,4,5].map((i) => (
                    <span key={i} style={{
                      fontSize: 16, transition: "color 0.3s",
                      color: i <= tier.stars ? "#BA7517" : "#e5e7eb",
                    }}>★</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Insight box */}
            <div style={{
              borderRadius: 10, padding: "0.9rem 1rem",
              background: isNegative ? "#FCEBEB" : tier.bg,
              border: `1px solid ${isNegative ? "#F7C1C1" : tier.border}`,
              transition: "all 0.35s",
            }}>
              <p style={{
                fontSize: 13, lineHeight: 1.65, margin: 0,
                color: isNegative ? "#791F1F" : tier.text,
              }}>
                {getInsight(netYield, pbRaw === Infinity ? 0 : pbRaw)}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Formula strip ── */}
      <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 14, padding: "1.25rem" }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "1.1rem" }}>
          How every number is computed
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 8 }}>
          <FormulaCard name="Annual gross income" expr="Monthly rent × 12"                   result={fmtINR(grossAnnual)}         accentColor="#378ADD" />
          <FormulaCard name="Annual net income"   expr="(Rent × 12) − Annual costs"          result={fmtINR(netAnnual)}           accentColor="#378ADD" />
          <FormulaCard name="Gross yield"         expr="(Annual gross ÷ Price) × 100"        result={grossYield.toFixed(2) + "%"} accentColor="#1D9E75" />
          <FormulaCard name="Net yield"           expr="(Annual net ÷ Price) × 100"          result={netYield.toFixed(2) + "%"}   accentColor="#1D9E75" />
          <FormulaCard name="Payback period"      expr="Price ÷ Annual net income"           result={paybackStr}                  accentColor="#888780" />
          <FormulaCard name="Est. total return"   expr="Net yield + 6–8% appreciation"       result={netYield > 0 ? `${minR}–${maxR}%` : "—"} accentColor="#7F77DD" />
        </div>
      </div>

      {/* Pulse keyframe */}
      <style>{`
        @keyframes ryPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}