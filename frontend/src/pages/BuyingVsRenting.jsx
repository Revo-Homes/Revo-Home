// import React, { useState, useMemo } from 'react';
// import {
//   Chart as ChartJS, CategoryScale, LinearScale, PointElement,
//   LineElement, BarElement, Title, Tooltip, Legend, Filler,
// } from 'chart.js';
// import { Line, Bar } from 'react-chartjs-2';

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

// /* ─── HELPERS ─────────────────────────────────────────────────────────────── */
// // fmt() always returns a string that already includes ₹ — never prepend ₹ separately
// const fmt = (v) => {
//   if (!v && v !== 0) return '₹0';
//   const abs  = Math.abs(v);
//   const sign = v < 0 ? '-' : '';
//   if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`;
//   if (abs >= 100000)   return `${sign}₹${(abs / 100000).toFixed(2)}L`;
//   if (abs >= 1000)     return `${sign}₹${(abs / 1000).toFixed(1)}K`;
//   return `${sign}₹${abs.toLocaleString('en-IN')}`;
// };

// // fmtRaw — compact number WITHOUT ₹ symbol (for slider min/max labels where ₹ is printed once separately)
// const fmtRaw = (v) => {
//   const abs = Math.abs(v);
//   if (abs >= 10000000) return `${(abs / 10000000).toFixed(1)}Cr`;
//   if (abs >= 100000)   return `${(abs / 100000).toFixed(1)}L`;
//   if (abs >= 1000)     return `${(abs / 1000).toFixed(0)}K`;
//   return abs.toLocaleString('en-IN');
// };

// /* ─── CALCULATION ENGINE ───────────────────────────────────────────────────── */
// function calcEMI(principal, annualRate, years) {
//   const mr = annualRate / 12 / 100;
//   const n  = years * 12;
//   if (mr === 0) return principal / n;
//   return (principal * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
// }

// function calcLoanBalance(principal, annualRate, totalYears, elapsedYears) {
//   const mr            = annualRate / 12 / 100;
//   const totalMonths   = totalYears * 12;
//   const elapsedMonths = Math.min(elapsedYears * 12, totalMonths);
//   if (mr === 0) return Math.max(0, principal - (principal / totalMonths) * elapsedMonths);
//   const a = Math.pow(1 + mr, totalMonths);
//   const b = Math.pow(1 + mr, elapsedMonths);
//   return principal * (a - b) / (a - 1);
// }

// function runSimulation(inputs) {
//   const {
//     propertyPrice, downPct, loanRate, loanYears,
//     maintenance, appreciation,
//     monthlyRent, rentIncrease, investReturn,
//     horizon, stampDuty,
//   } = inputs;

//   const downPayment      = propertyPrice * downPct / 100;
//   const loanAmount       = propertyPrice - downPayment;
//   const emi              = calcEMI(loanAmount, loanRate, loanYears);
//   const registrationCost = propertyPrice * stampDuty / 100;
//   const totalEMIPaid     = emi * loanYears * 12;
//   const totalInterest    = totalEMIPaid - loanAmount;

//   const buyingTimeline  = [];
//   const rentingTimeline = [];

//   let rentPortfolio = downPayment;
//   let currentRent   = monthlyRent;

//   for (let y = 0; y <= horizon; y++) {
//     const propValue      = propertyPrice * Math.pow(1 + appreciation / 100, y);
//     const loanBalance    = calcLoanBalance(loanAmount, loanRate, loanYears, y);
//     const equity         = propValue - loanBalance;
//     const yearlyEMI      = Math.min(emi * 12, loanAmount);
//     const cumulativeCost = (yearlyEMI + maintenance) * y + registrationCost;

//     buyingTimeline.push({ year: y, propValue, loanBalance, equity, cumulativeCost, netWealth: equity });

//     if (y > 0) {
//       currentRent  *= (1 + rentIncrease / 100);
//       const surplus = Math.max(0, emi - currentRent) * 12;
//       rentPortfolio = (rentPortfolio + surplus) * (1 + investReturn / 100);
//     }
//     rentingTimeline.push({ year: y, portfolio: rentPortfolio, monthlyRent: currentRent, netWealth: rentPortfolio });
//   }

//   let breakEven = null;
//   for (let i = 1; i <= horizon; i++) {
//     if (buyingTimeline[i].netWealth > rentingTimeline[i].netWealth) { breakEven = i; break; }
//   }

//   const finalBuying  = buyingTimeline[horizon].netWealth;
//   const finalRenting = rentingTimeline[horizon].netWealth;
//   const gap          = finalBuying - finalRenting;
//   const prRatio      = propertyPrice / (monthlyRent * 12);

//   return {
//     buyingTimeline, rentingTimeline,
//     emi, downPayment, loanAmount, registrationCost,
//     totalInterest, finalBuying, finalRenting, gap, breakEven, prRatio,
//     buyingWins: gap > 0,
//   };
// }

// /* ─── SLIDER ───────────────────────────────────────────────────────────────── */
// function Slider({ label, value, onChange, min, max, step = 1, accent = '#4f46e5', isRupee = false, suffix = '', note = '' }) {
//   const pct = ((value - min) / (max - min)) * 100;

//   // Header display value
//   const displayVal = isRupee ? fmt(value) : `${value.toLocaleString('en-IN')}${suffix}`;

//   // Min / max tick labels — no double ₹
//   const minLabel = isRupee ? `₹${fmtRaw(min)}` : `${min}${suffix}`;
//   const maxLabel = isRupee ? `₹${fmtRaw(max)}` : `${max}${suffix}`;

//   return (
//     <div style={{ marginBottom: 22 }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
//           {/* Label — uppercase small */}
//           <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
//           {/* Note (e.g. "= ₹7.5L") */}
//           {note && <span style={{ fontSize: 10, color: '#9ca3af' }}>{note}</span>}
//         </div>
//         {/* VALUE — bigger & bolder than before (15px / 800) */}
//         <span style={{ fontSize: 15, fontWeight: 800, color: '#111827', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
//           {displayVal}
//         </span>
//       </div>
//       <div style={{ position: 'relative', height: 6, background: '#e5e7eb', borderRadius: 999 }}>
//         <div style={{
//           position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 999,
//           width: `${Math.min(100, Math.max(0, pct))}%`, background: accent, transition: 'width 0.15s',
//         }} />
//         <input
//           type="range" min={min} max={max} step={step} value={value}
//           onChange={e => onChange(Number(e.target.value))}
//           style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10, margin: 0 }}
//         />
//         <div style={{
//           position: 'absolute', top: '50%', width: 16, height: 16,
//           background: '#fff', border: `2.5px solid ${accent}`, borderRadius: '50%',
//           transform: 'translateY(-50%)', left: `calc(${Math.min(100, Math.max(0, pct))}% - 8px)`,
//           pointerEvents: 'none', transition: 'left 0.15s', boxShadow: `0 2px 6px ${accent}55`,
//         }} />
//       </div>
//       <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
//         <span style={{ fontSize: 9, color: '#9ca3af' }}>{minLabel}</span>
//         <span style={{ fontSize: 9, color: '#9ca3af' }}>{maxLabel}</span>
//       </div>
//     </div>
//   );
// }

// /* ─── STAT CARD ────────────────────────────────────────────────────────────── */
// function StatCard({ label, value, sub, accent = '#111827', bg = '#f9fafb', icon = null }) {
//   return (
//     <div style={{ background: bg, borderRadius: 14, padding: '14px 16px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 4 }}>
//       <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//         {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
//         <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</span>
//       </div>
//       <span style={{ fontSize: 17, fontWeight: 900, color: accent, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</span>
//       {sub && <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{sub}</span>}
//     </div>
//   );
// }

// /* ─── TAB ──────────────────────────────────────────────────────────────────── */
// function Tab({ label, active, onClick, icon }) {
//   return (
//     <button onClick={onClick} style={{
//       padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
//       fontWeight: 700, fontSize: 12, letterSpacing: '0.04em',
//       background: active ? '#111827' : 'transparent',
//       color: active ? '#fff' : '#6b7280',
//       transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5,
//     }}>
//       <span>{icon}</span>{label}
//     </button>
//   );
// }

// /* ─── PILL ROW ─────────────────────────────────────────────────────────────── */
// function Pill({ label, children, color = '#6b7280' }) {
//   return (
//     <div style={{
//       display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//       padding: '9px 12px', background: '#f9fafb', borderRadius: 8,
//       border: '1px solid #e5e7eb', marginBottom: 6,
//     }}>
//       <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{label}</span>
//       <span style={{ fontSize: 13, fontWeight: 800, color }}>{children}</span>
//     </div>
//   );
// }

// /* ─── AMORTIZATION TABLE ───────────────────────────────────────────────────── */
// function AmortizationTable({ timeline }) {
//   const [show, setShow] = useState(10);
//   return (
//     <div>
//       <div style={{ overflowX: 'auto' }}>
//         <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
//           <thead>
//             <tr style={{ background: '#f3f4f6' }}>
//               {['Year', 'Property Value', 'Loan Balance', 'Equity', 'Cumulative Cost'].map(h => (
//                 <th key={h} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#374151', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {timeline.slice(0, show + 1).map((row, i) => (
//               <tr key={row.year} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
//                 <td style={{ padding: '9px 12px', fontWeight: 700, color: '#111827', textAlign: 'right' }}>Y{row.year}</td>
//                 <td style={{ padding: '9px 12px', color: '#059669', fontWeight: 600, textAlign: 'right' }}>{fmt(row.propValue)}</td>
//                 <td style={{ padding: '9px 12px', color: '#dc2626', textAlign: 'right' }}>{fmt(row.loanBalance)}</td>
//                 <td style={{ padding: '9px 12px', color: '#2563eb', fontWeight: 700, textAlign: 'right' }}>{fmt(row.equity)}</td>
//                 <td style={{ padding: '9px 12px', color: '#6b7280', textAlign: 'right' }}>{fmt(row.cumulativeCost)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       {show < timeline.length - 1 && (
//         <button onClick={() => setShow(v => Math.min(v + 10, timeline.length - 1))} style={{
//           marginTop: 10, width: '100%', padding: '9px', border: '1px dashed #d1d5db',
//           borderRadius: 8, background: 'transparent', color: '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer',
//         }}>Show More ↓</button>
//       )}
//     </div>
//   );
// }

// /* ─── CHART OPTIONS ────────────────────────────────────────────────────────── */
// const chartOpts = () => ({
//   responsive: true, maintainAspectRatio: false,
//   interaction: { mode: 'index', intersect: false },
//   plugins: {
//     legend: { position: 'top', labels: { font: { size: 11, weight: 'bold' }, padding: 16, usePointStyle: true, pointStyleWidth: 10 } },
//     tooltip: {
//       backgroundColor: '#111827', titleColor: '#f9fafb', bodyColor: '#e5e7eb',
//       borderColor: '#374151', borderWidth: 1, padding: 12, cornerRadius: 10,
//       callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` },
//     },
//   },
//   scales: {
//     x: { grid: { display: false }, ticks: { font: { size: 10 } } },
//     y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 }, callback: v => fmt(v) } },
//   },
// });

// /* ─── MAIN COMPONENT ────────────────────────────────────────────────────────── */
// export default function BuyVsRentCalculator() {
//   const [propertyPrice, setPropertyPrice] = useState(5000000);
//   const [downPct, setDownPct]             = useState(20);
//   const [loanRate, setLoanRate]           = useState(8.5);
//   const [loanYears, setLoanYears]         = useState(20);
//   const [maintenance, setMaintenance]     = useState(25000);
//   const [appreciation, setAppreciation]   = useState(6);
//   const [stampDuty, setStampDuty]         = useState(6);
//   const [monthlyRent, setMonthlyRent]     = useState(20000);
//   const [rentIncrease, setRentIncrease]   = useState(5);
//   const [investReturn, setInvestReturn]   = useState(10);
//   const [horizon, setHorizon]             = useState(10);
//   const [activeTab, setActiveTab]         = useState('overview');
//   const [chartType, setChartType]         = useState('wealth');

//   const R = useMemo(() => runSimulation({
//     propertyPrice, downPct, loanRate, loanYears, maintenance,
//     appreciation, stampDuty, monthlyRent, rentIncrease, investReturn, horizon,
//   }), [propertyPrice, downPct, loanRate, loanYears, maintenance, appreciation, stampDuty, monthlyRent, rentIncrease, investReturn, horizon]);

//   const years = R.buyingTimeline.map(d => `Y${d.year}`);

//   const wealthChart = {
//     labels: years,
//     datasets: [
//       { label: '🏠 Buying Wealth',  data: R.buyingTimeline.map(d => d.netWealth),  borderColor: '#dc2626', backgroundColor: 'rgba(220,38,38,0.07)',  borderWidth: 2.5, tension: 0.35, fill: true, pointRadius: 3 },
//       { label: '📈 Renting Wealth', data: R.rentingTimeline.map(d => d.netWealth), borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.07)',   borderWidth: 2.5, tension: 0.35, fill: true, pointRadius: 3 },
//     ],
//   };
//   const equityChart = {
//     labels: years,
//     datasets: [
//       { label: 'Property Value', data: R.buyingTimeline.map(d => d.propValue),   borderColor: '#059669', backgroundColor: 'rgba(5,150,105,0.08)',   borderWidth: 2.5, tension: 0.35, fill: true,  pointRadius: 3 },
//       { label: 'Loan Balance',   data: R.buyingTimeline.map(d => d.loanBalance), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)',  borderWidth: 2.5, tension: 0.35, fill: true,  pointRadius: 3 },
//       { label: 'Your Equity',    data: R.buyingTimeline.map(d => d.equity),      borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.08)',  borderWidth: 2.5, tension: 0.35, fill: false, pointRadius: 3, borderDash: [5, 3] },
//     ],
//   };
//   const gapChart = {
//     labels: years,
//     datasets: [{
//       label: 'Buying Lead over Renting',
//       data: R.buyingTimeline.map((d, i) => d.netWealth - R.rentingTimeline[i].netWealth),
//       backgroundColor: R.buyingTimeline.map((d, i) =>
//         d.netWealth > R.rentingTimeline[i].netWealth ? 'rgba(5,150,105,0.75)' : 'rgba(220,38,38,0.75)'
//       ),
//       borderRadius: 6,
//     }],
//   };

//   const verdictColor = R.buyingWins ? '#059669' : '#2563eb';
//   const verdictBg    = R.buyingWins ? '#ecfdf5' : '#eff6ff';
//   const verdictText  = R.buyingWins ? '🏠 Buying Wins' : '📈 Renting Wins';

//   return (
//     <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#f8fafc', minHeight: '100vh', paddingBottom: 40 }}>

//       {/* ══ VERDICT BANNER — now the topmost element (header removed) ══ */}
//       <div style={{
//         background: verdictBg, borderBottom: `3px solid ${verdictColor}`,
//         padding: '14px 24px', display: 'flex', alignItems: 'center',
//         justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
//           <span style={{ fontSize: 22, fontWeight: 900, color: verdictColor }}>{verdictText}</span>
//           <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
//             {R.buyingWins
//               ? `Buying builds ${fmt(Math.abs(R.gap))} more wealth over ${horizon} years`
//               : `Renting + investing builds ${fmt(Math.abs(R.gap))} more wealth over ${horizon} years`}
//           </span>
//         </div>
//         <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
//           {[
//             { label: 'Break-even',     val: R.breakEven ? `Year ${R.breakEven}` : `> ${horizon} yrs`,  color: '#111827' },
//             { label: 'Buying Wealth',  val: fmt(R.finalBuying),   color: '#dc2626' },
//             { label: 'Renting Wealth', val: fmt(R.finalRenting),  color: '#2563eb' },
//             { label: 'P/R Ratio',      val: `${R.prRatio.toFixed(1)}x`, color: R.prRatio > 20 ? '#2563eb' : R.prRatio > 15 ? '#d97706' : '#059669' },
//           ].map(({ label, val, color }) => (
//             <div key={label} style={{ textAlign: 'center' }}>
//               <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{label}</div>
//               <div style={{ fontSize: 16, fontWeight: 900, color }}>{val}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ══ BODY: sticky left inputs + scrollable right results ══ */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'minmax(270px, 330px) 1fr', alignItems: 'start' }}>

//         {/* ── LEFT: INPUTS ── */}
//         <div style={{
//           background: '#fff', borderRight: '1px solid #e5e7eb',
//           padding: '20px 18px', position: 'sticky', top: 0,
//           overflowY: 'auto', maxHeight: '100vh',
//         }}>

//           {/* Time horizon */}
//           <div style={{ background: '#111827', borderRadius: 12, padding: '16px 16px 12px', marginBottom: 22 }}>
//             <Slider label="Analysis Horizon" value={horizon} onChange={setHorizon}
//               min={1} max={30} step={1} accent="#f59e0b" suffix=" years" />
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: -4 }}>
//               {[5, 10, 20].map(y => (
//                 <button key={y} onClick={() => setHorizon(y)} style={{
//                   padding: '7px', borderRadius: 7,
//                   border: `1px solid ${horizon === y ? '#f59e0b' : '#374151'}`,
//                   background: horizon === y ? '#f59e0b' : '#1f2937',
//                   color: horizon === y ? '#111827' : '#9ca3af',
//                   fontSize: 12, fontWeight: 800, cursor: 'pointer',
//                 }}>{y}Y</button>
//               ))}
//             </div>
//           </div>

//           {/* BUYING */}
//           <div style={{ marginBottom: 22 }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid #fef2f2' }}>
//               <span style={{ fontSize: 16 }}>🏠</span>
//               <span style={{ fontWeight: 900, fontSize: 13, color: '#dc2626', textTransform: 'uppercase' }}>Buying Inputs</span>
//             </div>
//             <Slider label="Property Price"        value={propertyPrice} onChange={setPropertyPrice}
//               min={500000} max={50000000} step={100000} accent="#dc2626" isRupee />
//             <Slider label="Down Payment"          value={downPct}       onChange={setDownPct}
//               min={10} max={50} step={5} accent="#dc2626" suffix="%"
//               note={`= ${fmt(propertyPrice * downPct / 100)}`} />
//             <Slider label="Stamp Duty & Reg."     value={stampDuty}     onChange={setStampDuty}
//               min={3} max={10} step={0.5} accent="#dc2626" suffix="%"
//               note={`= ${fmt(propertyPrice * stampDuty / 100)}`} />
//             <Slider label="Loan Interest Rate"    value={loanRate}      onChange={setLoanRate}
//               min={6} max={14} step={0.25} accent="#dc2626" suffix="% p.a." />
//             <Slider label="Loan Tenure"           value={loanYears}     onChange={setLoanYears}
//               min={5} max={30} step={1} accent="#dc2626" suffix=" yrs" />
//             <Slider label="Annual Maintenance"    value={maintenance}   onChange={setMaintenance}
//               min={5000} max={200000} step={5000} accent="#dc2626" isRupee />
//             <Slider label="Property Appreciation" value={appreciation}  onChange={setAppreciation}
//               min={1} max={15} step={0.5} accent="#dc2626" suffix="% p.a." />
//           </div>

//           {/* RENTING */}
//           <div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid #eff6ff' }}>
//               <span style={{ fontSize: 16 }}>📈</span>
//               <span style={{ fontWeight: 900, fontSize: 13, color: '#2563eb', textTransform: 'uppercase' }}>Renting Inputs</span>
//             </div>
//             <Slider label="Monthly Rent"           value={monthlyRent}   onChange={setMonthlyRent}
//               min={3000} max={200000} step={1000} accent="#2563eb" isRupee />
//             <Slider label="Rent Increase (annual)" value={rentIncrease}  onChange={setRentIncrease}
//               min={0} max={15} step={1} accent="#2563eb" suffix="% p.a." />
//             <Slider label="Investment Return"      value={investReturn}  onChange={setInvestReturn}
//               min={4} max={18} step={0.5} accent="#2563eb" suffix="% p.a."
//               note="on DP + surplus" />
//           </div>
//         </div>

//         {/* ── RIGHT: RESULTS ── */}
//         <div style={{ padding: '20px 22px' }}>

//           {/* Stat cards */}
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
//             <StatCard label="Monthly EMI"    value={fmt(R.emi)}                          sub="Fixed for loan tenure"                                          icon="💳" accent="#dc2626" />
//             <StatCard label="Down Payment"   value={fmt(R.downPayment)}                  sub={`+ ${fmt(R.registrationCost)} stamp duty`}                       icon="💰" accent="#111827" />
//             <StatCard label="Total Interest" value={fmt(R.totalInterest)}                sub={`over ${loanYears} yr loan`}                                     icon="📊" accent="#f59e0b" />
//             <StatCard label="Monthly Rent"   value={fmt(monthlyRent)}                    sub={`${fmt(monthlyRent * 12)}/yr`}                                   icon="🔑" accent="#2563eb" />
//             <StatCard label="P/R Ratio"      value={`${R.prRatio.toFixed(1)}x`}
//               sub={R.prRatio > 20 ? '> 20: Rent favoured' : R.prRatio > 15 ? '15–20: Borderline' : '< 15: Buy favoured'}
//               icon="⚖️" accent={R.prRatio > 20 ? '#2563eb' : R.prRatio > 15 ? '#f59e0b' : '#059669'} />
//             <StatCard label="EMI vs Rent"    value={fmt(Math.abs(R.emi - monthlyRent))}
//               sub={R.emi > monthlyRent ? 'Extra monthly cost to buy' : 'EMI cheaper than rent!'}
//               icon={R.emi > monthlyRent ? '📉' : '🎉'} accent={R.emi > monthlyRent ? '#dc2626' : '#059669'} />
//           </div>

//           {/* Tab bar */}
//           <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#f3f4f6', padding: 4, borderRadius: 10, width: 'fit-content' }}>
//             {[
//               { key: 'overview',     label: 'Overview',     icon: '📊' },
//               { key: 'breakdown',    label: 'Breakdown',    icon: '🔍' },
//               { key: 'amortization', label: 'Amortization', icon: '📋' },
//               { key: 'advice',       label: 'Advice',       icon: '💡' },
//             ].map(t => <Tab key={t.key} label={t.label} icon={t.icon} active={activeTab === t.key} onClick={() => setActiveTab(t.key)} />)}
//           </div>

//           {/* ── OVERVIEW ── */}
//           {activeTab === 'overview' && (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//               <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
//                   <h3 style={{ margin: 0, fontWeight: 900, fontSize: 14, color: '#111827' }}>Wealth Accumulation</h3>
//                   <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', padding: 4, borderRadius: 8 }}>
//                     {[{ k: 'wealth', l: 'Wealth' }, { k: 'equity', l: 'Equity' }, { k: 'gap', l: 'Gap' }].map(c => (
//                       <button key={c.k} onClick={() => setChartType(c.k)} style={{
//                         padding: '5px 11px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
//                         background: chartType === c.k ? '#111827' : 'transparent',
//                         color: chartType === c.k ? '#fff' : '#6b7280',
//                       }}>{c.l}</button>
//                     ))}
//                   </div>
//                 </div>
//                 <div style={{ height: 260 }}>
//                   {chartType === 'wealth' && <Line data={wealthChart} options={chartOpts()} />}
//                   {chartType === 'equity' && <Line data={equityChart} options={chartOpts()} />}
//                   {chartType === 'gap'    && <Bar  data={gapChart}    options={chartOpts()} />}
//                 </div>
//                 <p style={{ margin: '10px 0 0', fontSize: 10, color: '#9ca3af', textAlign: 'center' }}>
//                   {chartType === 'wealth' && '🔴 Buying wealth = property equity  |  🔵 Renting wealth = investment portfolio'}
//                   {chartType === 'equity' && 'Property value growth vs loan paydown — showing real equity buildup'}
//                   {chartType === 'gap'    && '🟢 Green = buying ahead  |  🔴 Red = renting ahead'}
//                 </p>
//               </div>

//               <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
//                 <h3 style={{ margin: '0 0 14px', fontWeight: 900, fontSize: 14, color: '#111827' }}>Year-by-Year Snapshot</h3>
//                 <div style={{ overflowX: 'auto' }}>
//                   <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
//                     <thead>
//                       <tr style={{ background: '#f9fafb' }}>
//                         {['Year', 'Buying Wealth', 'Renting Wealth', 'Who Wins?', 'Gap'].map(h => (
//                           <th key={h} style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#6b7280', fontSize: 10, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {R.buyingTimeline
//                         .filter((_, i) => i > 0 && (i % Math.max(1, Math.ceil(horizon / 8)) === 0 || i === horizon))
//                         .map(row => {
//                           const rRow  = R.rentingTimeline[row.year];
//                           const gap   = row.netWealth - rRow.netWealth;
//                           const bWins = gap > 0;
//                           return (
//                             <tr key={row.year} style={{ borderBottom: '1px solid #f3f4f6' }}>
//                               <td style={{ padding: '8px 10px', fontWeight: 700, color: '#374151', textAlign: 'center' }}>Year {row.year}</td>
//                               <td style={{ padding: '8px 10px', color: '#dc2626', fontWeight: 700, textAlign: 'center' }}>{fmt(row.netWealth)}</td>
//                               <td style={{ padding: '8px 10px', color: '#2563eb', fontWeight: 700, textAlign: 'center' }}>{fmt(rRow.netWealth)}</td>
//                               <td style={{ padding: '8px 10px', textAlign: 'center' }}>
//                                 <span style={{ background: bWins ? '#ecfdf5' : '#eff6ff', color: bWins ? '#059669' : '#2563eb', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700 }}>
//                                   {bWins ? '🏠 Buy' : '📈 Rent'}
//                                 </span>
//                               </td>
//                               <td style={{ padding: '8px 10px', color: bWins ? '#059669' : '#dc2626', fontWeight: 700, textAlign: 'center' }}>
//                                 {bWins ? '+' : '-'}{fmt(Math.abs(gap))}
//                               </td>
//                             </tr>
//                           );
//                         })}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ── BREAKDOWN ── */}
//           {activeTab === 'breakdown' && (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

//                 <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #fecaca' }}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
//                     <span>🏠</span>
//                     <h3 style={{ margin: 0, fontWeight: 900, fontSize: 14, color: '#dc2626' }}>Buying — Full Cost</h3>
//                   </div>
//                   {/* All values come from fmt() which already includes ₹ — no extra ₹ prefix here */}
//                   <Pill label="Property Price"              color="#111827">{fmt(propertyPrice)}</Pill>
//                   <Pill label="Down Payment"                color="#dc2626">{fmt(R.downPayment)}</Pill>
//                   <Pill label="Stamp Duty & Registration"   color="#dc2626">{fmt(R.registrationCost)}</Pill>
//                   <Pill label="Loan Amount"                 color="#f59e0b">{fmt(R.loanAmount)}</Pill>
//                   <Pill label="Monthly EMI"                 color="#dc2626">{fmt(R.emi)}/mo</Pill>
//                   <Pill label="Total Interest (full tenure)" color="#dc2626">{fmt(R.totalInterest)}</Pill>
//                   <Pill label="Annual Maintenance"          color="#6b7280">{fmt(maintenance)}</Pill>
//                   <div style={{ marginTop: 12, padding: '12px 14px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
//                     <div style={{ fontSize: 10, color: '#dc2626', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Wealth at Year {horizon}</div>
//                     <div style={{ fontSize: 22, fontWeight: 900, color: '#dc2626' }}>{fmt(R.finalBuying)}</div>
//                     <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>Property equity after {horizon} years</div>
//                   </div>
//                 </div>

//                 <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #bfdbfe' }}>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
//                     <span>📈</span>
//                     <h3 style={{ margin: 0, fontWeight: 900, fontSize: 14, color: '#2563eb' }}>Renting — Full Cost</h3>
//                   </div>
//                   <Pill label="Monthly Rent (today)"      color="#2563eb">{fmt(monthlyRent)}/mo</Pill>
//                   <Pill label="Annual Rent (today)"       color="#2563eb">{fmt(monthlyRent * 12)}</Pill>
//                   {/* Fixed: template literal was broken before */}
//                   <Pill label={`Rent at Year ${horizon}`} color="#2563eb">{fmt(monthlyRent * Math.pow(1 + rentIncrease / 100, horizon))}/mo</Pill>
//                   <Pill label="Down Payment Invested"     color="#059669">{fmt(R.downPayment)}</Pill>
//                   <Pill label="Investment Return"         color="#059669">{investReturn}% p.a.</Pill>
//                   <Pill label="Monthly Surplus Invested"  color="#059669">{fmt(Math.max(0, R.emi - monthlyRent))}/mo</Pill>
//                   <Pill label="EMI–Rent Difference"       color={R.emi > monthlyRent ? '#059669' : '#dc2626'}>
//                     {R.emi > monthlyRent ? 'Renter saves' : 'EMI cheaper by'} {fmt(Math.abs(R.emi - monthlyRent))}/mo
//                   </Pill>
//                   <div style={{ marginTop: 12, padding: '12px 14px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
//                     <div style={{ fontSize: 10, color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Portfolio at Year {horizon}</div>
//                     <div style={{ fontSize: 22, fontWeight: 900, color: '#2563eb' }}>{fmt(R.finalRenting)}</div>
//                     <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>Total investment value</div>
//                   </div>
//                 </div>
//               </div>

//               <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
//                 <h3 style={{ margin: '0 0 14px', fontWeight: 900, fontSize: 14, color: '#111827' }}>⚖️ Price-to-Rent Ratio: {R.prRatio.toFixed(1)}x</h3>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
//                   {[
//                     { range: '< 15x',  label: 'Buying Favoured',  desc: 'Property is cheap vs rent. Strong case to buy.',                 good: true,    hit: R.prRatio < 15 },
//                     { range: '15–20x', label: 'Borderline',        desc: 'Could go either way. Look at appreciation + returns.',           neutral: true, hit: R.prRatio >= 15 && R.prRatio <= 20 },
//                     { range: '> 20x',  label: 'Renting Favoured',  desc: 'Property is expensive vs rent. Renting + investing often wins.', bad: true,     hit: R.prRatio > 20 },
//                   ].map(z => (
//                     <div key={z.range} style={{
//                       padding: '12px 14px', borderRadius: 10,
//                       background: z.hit ? (z.good ? '#ecfdf5' : z.neutral ? '#fffbeb' : '#eff6ff') : '#f9fafb',
//                       border: `2px solid ${z.hit ? (z.good ? '#6ee7b7' : z.neutral ? '#fcd34d' : '#93c5fd') : '#e5e7eb'}`,
//                     }}>
//                       <div style={{ fontWeight: 900, fontSize: 15, color: z.good ? '#059669' : z.neutral ? '#d97706' : '#2563eb', marginBottom: 4 }}>{z.range}</div>
//                       <div style={{ fontWeight: 700, fontSize: 11, color: '#374151', marginBottom: 4 }}>{z.label}</div>
//                       <div style={{ fontSize: 10, color: '#6b7280', lineHeight: 1.5 }}>{z.desc}</div>
//                       {z.hit && <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: '#111827' }}>← You are here</div>}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ── AMORTIZATION ── */}
//           {activeTab === 'amortization' && (
//             <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
//                 <h3 style={{ margin: 0, fontWeight: 900, fontSize: 14, color: '#111827' }}>📋 Year-by-Year Loan Amortization</h3>
//                 <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6b7280' }}>
//                   <span>EMI: <strong style={{ color: '#dc2626' }}>{fmt(R.emi)}/mo</strong></span>
//                   <span>Loan: <strong style={{ color: '#111827' }}>{fmt(R.loanAmount)}</strong></span>
//                 </div>
//               </div>
//               <AmortizationTable timeline={R.buyingTimeline} />
//             </div>
//           )}

//           {/* ── ADVICE ── */}
//           {activeTab === 'advice' && (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//               <div style={{ background: verdictBg, border: `2px solid ${verdictColor}`, borderRadius: 14, padding: '18px 20px' }}>
//                 <div style={{ fontSize: 20, fontWeight: 900, color: verdictColor, marginBottom: 8 }}>{verdictText} — based on your inputs</div>
//                 <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
//                   {R.buyingWins
//                     ? `Over ${horizon} years, buying at ${fmt(propertyPrice)} builds ${fmt(Math.abs(R.gap))} more wealth than renting at ${fmt(monthlyRent)}/month. Property appreciation of ${appreciation}% per year compounds strongly over time.`
//                     : `Over ${horizon} years, renting at ${fmt(monthlyRent)}/month and investing the down payment (${fmt(R.downPayment)}) at ${investReturn}% returns builds ${fmt(Math.abs(R.gap))} more wealth than buying.`}
//                 </p>
//               </div>
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
//                 <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
//                   <h4 style={{ margin: '0 0 12px', fontWeight: 900, fontSize: 13, color: '#059669' }}>✅ Buy if…</h4>
//                   {[
//                     `You plan to stay ${Math.max(7, R.breakEven || 7)}+ years`,
//                     'You value stability (no landlord risk)',
//                     `P/R ratio below 15 (yours: ${R.prRatio.toFixed(1)}x)`,
//                     'Your EMI equals or beats rent',
//                     'You are in the 30% tax bracket',
//                     'You have stable, long-term income',
//                   ].map(t => <div key={t} style={{ fontSize: 12, color: '#374151', padding: '6px 0', borderBottom: '1px solid #f3f4f6', lineHeight: 1.5 }}>{t}</div>)}
//                 </div>
//                 <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
//                   <h4 style={{ margin: '0 0 12px', fontWeight: 900, fontSize: 13, color: '#2563eb' }}>✅ Rent if…</h4>
//                   {[
//                     `Likely to relocate within ${Math.min(5, R.breakEven ? R.breakEven - 1 : 5)} years`,
//                     `P/R ratio > 20 (yours: ${R.prRatio.toFixed(1)}x)`,
//                     `You can invest at ${investReturn}%+ consistently`,
//                     'Your career is in a growth phase',
//                     'EMI would strain your cash flow',
//                     'You want flexibility and liquidity',
//                   ].map(t => <div key={t} style={{ fontSize: 12, color: '#374151', padding: '6px 0', borderBottom: '1px solid #f3f4f6', lineHeight: 1.5 }}>{t}</div>)}
//                 </div>
//               </div>
//               <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 14, padding: '14px 18px' }}>
//                 <h4 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: 13, color: '#92400e' }}>⚠️ What this calculator does NOT account for</h4>
//                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
//                   {[
//                     'Section 80C & 24 tax deductions (up to ₹3.5L/year)',
//                     'Market volatility — returns may vary',
//                     'Floating rate loan risk',
//                     'Brokerage on lease renewals (1 month rent)',
//                     'Major unexpected repairs',
//                     'Rent-free living after full loan payoff',
//                   ].map(t => <div key={t} style={{ fontSize: 11, color: '#78350f', padding: '4px 0', lineHeight: 1.5 }}>• {t}</div>)}
//                 </div>
//               </div>
//             </div>
//           )}

//         </div>{/* end right */}
//       </div>{/* end grid */}
//     </div>
//   );
// }


import React, { useState, useMemo } from 'react';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

/* ─── HELPERS ─────────────────────────────────────────────────────────────── */
// fmt() always returns a string that already includes ₹ — never prepend ₹ separately
const fmt = (v) => {
  if (!v && v !== 0) return '₹0';
  const abs  = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000)   return `${sign}₹${(abs / 100000).toFixed(2)}L`;
  if (abs >= 1000)     return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  return `${sign}₹${abs.toLocaleString('en-IN')}`;
};

// fmtRaw — compact number WITHOUT ₹ symbol (for slider min/max labels where ₹ is printed once separately)
const fmtRaw = (v) => {
  const abs = Math.abs(v);
  if (abs >= 10000000) return `${(abs / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000)   return `${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000)     return `${(abs / 1000).toFixed(0)}K`;
  return abs.toLocaleString('en-IN');
};

/* ─── CALCULATION ENGINE ───────────────────────────────────────────────────── */
function calcEMI(principal, annualRate, years) {
  const mr = annualRate / 12 / 100;
  const n  = years * 12;
  if (mr === 0) return principal / n;
  return (principal * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
}

function calcLoanBalance(principal, annualRate, totalYears, elapsedYears) {
  const mr            = annualRate / 12 / 100;
  const totalMonths   = totalYears * 12;
  const elapsedMonths = Math.min(elapsedYears * 12, totalMonths);
  if (mr === 0) return Math.max(0, principal - (principal / totalMonths) * elapsedMonths);
  const a = Math.pow(1 + mr, totalMonths);
  const b = Math.pow(1 + mr, elapsedMonths);
  return principal * (a - b) / (a - 1);
}

function runSimulation(inputs) {
  const {
    propertyPrice, downPct, loanRate, loanYears,
    maintenance, appreciation,
    monthlyRent, rentIncrease, investReturn,
    horizon, stampDuty,
  } = inputs;

  const downPayment      = propertyPrice * downPct / 100;
  const loanAmount       = propertyPrice - downPayment;
  const emi              = calcEMI(loanAmount, loanRate, loanYears);
  const registrationCost = propertyPrice * stampDuty / 100;
  const totalEMIPaid     = emi * loanYears * 12;
  const totalInterest    = totalEMIPaid - loanAmount;

  const buyingTimeline  = [];
  const rentingTimeline = [];

  let rentPortfolio = downPayment;
  let currentRent   = monthlyRent;

  for (let y = 0; y <= horizon; y++) {
    const propValue      = propertyPrice * Math.pow(1 + appreciation / 100, y);
    const loanBalance    = calcLoanBalance(loanAmount, loanRate, loanYears, y);
    const equity         = propValue - loanBalance;
    const yearlyEMI      = Math.min(emi * 12, loanAmount);
    const cumulativeCost = (yearlyEMI + maintenance) * y + registrationCost;

    buyingTimeline.push({ year: y, propValue, loanBalance, equity, cumulativeCost, netWealth: equity });

    if (y > 0) {
      currentRent  *= (1 + rentIncrease / 100);
      const surplus = Math.max(0, emi - currentRent) * 12;
      rentPortfolio = (rentPortfolio + surplus) * (1 + investReturn / 100);
    }
    rentingTimeline.push({ year: y, portfolio: rentPortfolio, monthlyRent: currentRent, netWealth: rentPortfolio });
  }

  let breakEven = null;
  for (let i = 1; i <= horizon; i++) {
    if (buyingTimeline[i].netWealth > rentingTimeline[i].netWealth) { breakEven = i; break; }
  }

  const finalBuying  = buyingTimeline[horizon].netWealth;
  const finalRenting = rentingTimeline[horizon].netWealth;
  const gap          = finalBuying - finalRenting;
  const prRatio      = propertyPrice / (monthlyRent * 12);

  return {
    buyingTimeline, rentingTimeline,
    emi, downPayment, loanAmount, registrationCost,
    totalInterest, finalBuying, finalRenting, gap, breakEven, prRatio,
    buyingWins: gap > 0,
  };
}

/* ─── SLIDER ───────────────────────────────────────────────────────────────── */
function Slider({ label, value, onChange, min, max, step = 1, accent = '#4f46e5', isRupee = false, suffix = '', note = '' }) {
  const pct = ((value - min) / (max - min)) * 100;

  // Header display value
  const displayVal = isRupee ? fmt(value) : `${value.toLocaleString('en-IN')}${suffix}`;

  // Min / max tick labels — no double ₹
  const minLabel = isRupee ? `₹${fmtRaw(min)}` : `${min}${suffix}`;
  const maxLabel = isRupee ? `₹${fmtRaw(max)}` : `${max}${suffix}`;

  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* Label — uppercase small */}
          <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
          {/* Note (e.g. "= ₹7.5L") */}
          {note && <span style={{ fontSize: 10, color: '#9ca3af' }}>{note}</span>}
        </div>
        {/* VALUE — bigger & bolder than before (15px / 800) */}
        <span style={{ fontSize: 15, fontWeight: 800, color: '#111827', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
          {displayVal}
        </span>
      </div>
      <div style={{ position: 'relative', height: 6, background: '#e5e7eb', borderRadius: 999 }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 999,
          width: `${Math.min(100, Math.max(0, pct))}%`, background: accent, transition: 'width 0.15s',
        }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10, margin: 0 }}
        />
        <div style={{
          position: 'absolute', top: '50%', width: 16, height: 16,
          background: '#fff', border: `2.5px solid ${accent}`, borderRadius: '50%',
          transform: 'translateY(-50%)', left: `calc(${Math.min(100, Math.max(0, pct))}% - 8px)`,
          pointerEvents: 'none', transition: 'left 0.15s', boxShadow: `0 2px 6px ${accent}55`,
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 9, color: '#9ca3af' }}>{minLabel}</span>
        <span style={{ fontSize: 9, color: '#9ca3af' }}>{maxLabel}</span>
      </div>
    </div>
  );
}

/* ─── STAT CARD ────────────────────────────────────────────────────────────── */
// function StatCard({ label, value, sub, accent = '#111827', bg = '#f9fafb', icon = null }) {
//   return (
//     <div style={{ background: bg, borderRadius: 14, padding: '14px 16px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 4 }}>
//       <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//         {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
//         <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</span>
//       </div>
//       <span style={{ fontSize: 17, fontWeight: 900, color: accent, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</span>
//       {sub && <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{sub}</span>}
//     </div>
//   );
// }
function StatCard({ label, value, sub, accent = '#111827', bg = '#f9fafb', icon = null, info }) {
  return (
    <div style={{
      position: 'relative',
      background: bg,
      borderRadius: 14,
      padding: '14px 16px',
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>

      {/* 👇 THIS IS YOUR (i) BUTTON */}
      {info && (
  <button
    onClick={info.onClick}
    style={{
      position: 'absolute',
      top: 10,
      right: 10,   // ✅ moved to right side
      width: 22,
      height: 22,
      borderRadius: '50%',
      border: '1px solid #facc15',
      background: '#facc15', // ✅ yellow
      color: '#111827',
      fontSize: 12,
      fontWeight: 900,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 1,
      boxShadow: '0 2px 6px rgba(250,204,21,0.4)',
    }}
  >
    i
  </button>
)}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginLeft: info ? 18 : 0
      }}>
        {icon && <span>{icon}</span>}
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#6b7280',
          textTransform: 'uppercase'
        }}>
          {label}
        </span>
      </div>

      <span style={{
        fontSize: 17,
        fontWeight: 900,
        color: accent
      }}>
        {value}
      </span>

      {sub && (
        <span style={{ fontSize: 10, color: '#9ca3af' }}>
          {sub}
        </span>
      )}
    </div>
  );
}
/* ─── TAB ──────────────────────────────────────────────────────────────────── */
function Tab({ label, active, onClick, icon }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
      fontWeight: 700, fontSize: 12, letterSpacing: '0.04em',
      background: active ? '#111827' : 'transparent',
      color: active ? '#fff' : '#6b7280',
      transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5,
    }}>
      <span>{icon}</span>{label}
    </button>
  );
}

/* ─── PILL ROW ─────────────────────────────────────────────────────────────── */
function Pill({ label, children, color = '#6b7280' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '9px 12px', background: '#f9fafb', borderRadius: 8,
      border: '1px solid #e5e7eb', marginBottom: 6,
    }}>
      <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 800, color }}>{children}</span>
    </div>
  );
}

/* ─── AMORTIZATION TABLE ───────────────────────────────────────────────────── */
function AmortizationTable({ timeline }) {
  const [show, setShow] = useState(10);
  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Year', 'Property Value', 'Loan Balance', 'Equity', 'Cumulative Cost'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#374151', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeline.slice(0, show + 1).map((row, i) => (
              <tr key={row.year} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '9px 12px', fontWeight: 700, color: '#111827', textAlign: 'right' }}>Y{row.year}</td>
                <td style={{ padding: '9px 12px', color: '#059669', fontWeight: 600, textAlign: 'right' }}>{fmt(row.propValue)}</td>
                <td style={{ padding: '9px 12px', color: '#dc2626', textAlign: 'right' }}>{fmt(row.loanBalance)}</td>
                <td style={{ padding: '9px 12px', color: '#2563eb', fontWeight: 700, textAlign: 'right' }}>{fmt(row.equity)}</td>
                <td style={{ padding: '9px 12px', color: '#6b7280', textAlign: 'right' }}>{fmt(row.cumulativeCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {show < timeline.length - 1 && (
        <button onClick={() => setShow(v => Math.min(v + 10, timeline.length - 1))} style={{
          marginTop: 10, width: '100%', padding: '9px', border: '1px dashed #d1d5db',
          borderRadius: 8, background: 'transparent', color: '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>Show More ↓</button>
      )}
    </div>
  );
}

/* ─── CHART OPTIONS ────────────────────────────────────────────────────────── */
const chartOpts = () => ({
  responsive: true, maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { position: 'top', labels: { font: { size: 11, weight: 'bold' }, padding: 16, usePointStyle: true, pointStyleWidth: 10 } },
    tooltip: {
      backgroundColor: '#111827', titleColor: '#f9fafb', bodyColor: '#e5e7eb',
      borderColor: '#374151', borderWidth: 1, padding: 12, cornerRadius: 10,
      callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 }, callback: v => fmt(v) } },
  },
});

/* ─── MAIN COMPONENT ────────────────────────────────────────────────────────── */
export default function BuyVsRentCalculator() {
  const pdfRef = useRef();
  const [propertyPrice, setPropertyPrice] = useState(5000000);
  const [downPct, setDownPct]             = useState(20);
  const [loanRate, setLoanRate]           = useState(8.5);
  const [loanYears, setLoanYears]         = useState(20);
  const [maintenance, setMaintenance]     = useState(25000);
  const [appreciation, setAppreciation]   = useState(6);
  const [stampDuty, setStampDuty]         = useState(6);
  const [monthlyRent, setMonthlyRent]     = useState(20000);
  const [rentIncrease, setRentIncrease]   = useState(5);
  const [investReturn, setInvestReturn]   = useState(10);
  const [horizon, setHorizon]             = useState(10);
  const [activeTab, setActiveTab]         = useState('overview');
  const [chartType, setChartType]         = useState('wealth');
  const [infoPopup, setInfoPopup] = useState({
  open: false,
  title: '',
  text: '',
});

  const R = useMemo(() => runSimulation({
    propertyPrice, downPct, loanRate, loanYears, maintenance,
    appreciation, stampDuty, monthlyRent, rentIncrease, investReturn, horizon,
  }), [propertyPrice, downPct, loanRate, loanYears, maintenance, appreciation, stampDuty, monthlyRent, rentIncrease, investReturn, horizon]);

  const years = R.buyingTimeline.map(d => `Y${d.year}`);

  const wealthChart = {
    labels: years,
    datasets: [
      { label: '🏠 Buying Wealth',  data: R.buyingTimeline.map(d => d.netWealth),  borderColor: '#dc2626', backgroundColor: 'rgba(220,38,38,0.07)',  borderWidth: 2.5, tension: 0.35, fill: true, pointRadius: 3 },
      { label: '📈 Renting Wealth', data: R.rentingTimeline.map(d => d.netWealth), borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.07)',   borderWidth: 2.5, tension: 0.35, fill: true, pointRadius: 3 },
    ],
  };
  const equityChart = {
    labels: years,
    datasets: [
      { label: 'Property Value', data: R.buyingTimeline.map(d => d.propValue),   borderColor: '#059669', backgroundColor: 'rgba(5,150,105,0.08)',   borderWidth: 2.5, tension: 0.35, fill: true,  pointRadius: 3 },
      { label: 'Loan Balance',   data: R.buyingTimeline.map(d => d.loanBalance), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)',  borderWidth: 2.5, tension: 0.35, fill: true,  pointRadius: 3 },
      { label: 'Your Equity',    data: R.buyingTimeline.map(d => d.equity),      borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.08)',  borderWidth: 2.5, tension: 0.35, fill: false, pointRadius: 3, borderDash: [5, 3] },
    ],
  };
  const gapChart = {
    labels: years,
    datasets: [{
      label: 'Buying Lead over Renting',
      data: R.buyingTimeline.map((d, i) => d.netWealth - R.rentingTimeline[i].netWealth),
      backgroundColor: R.buyingTimeline.map((d, i) =>
        d.netWealth > R.rentingTimeline[i].netWealth ? 'rgba(5,150,105,0.75)' : 'rgba(220,38,38,0.75)'
      ),
      borderRadius: 6,
    }],
  };

  const verdictColor = R.buyingWins ? '#059669' : '#2563eb';
  const verdictBg    = R.buyingWins ? '#ecfdf5' : '#eff6ff';
  const verdictText  = R.buyingWins ? '🏠 Buying Wins' : '📈 Renting Wins';
 const handleExportPDF = async () => {
  const input = pdfRef.current;

  if (!input) {
    console.error("PDF ref not found");
    return;
  }

  const canvas = await html2canvas(input, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

  if (imgHeight > pdfHeight) {
    let remainingHeight = imgHeight;

    while (remainingHeight > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      remainingHeight -= pdfHeight;
    }
  }

  pdf.save("Buy_vs_Rent_Report.pdf");
};
  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }} ref={pdfRef}>

      {/* ══ VERDICT BANNER — now the topmost element (header removed) ══ */}
      <div style={{
        background: verdictBg, borderBottom: `3px solid ${verdictColor}`,
        padding: '14px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: verdictColor }}>{verdictText}</span>
          <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
            {R.buyingWins
              ? `Buying builds ${fmt(Math.abs(R.gap))} more wealth over ${horizon} years`
              : `Renting + investing builds ${fmt(Math.abs(R.gap))} more wealth over ${horizon} years`}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Break-even',     val: R.breakEven ? `Year ${R.breakEven}` : `> ${horizon} yrs`,  color: '#111827' },
            { label: 'Buying Wealth',  val: fmt(R.finalBuying),   color: '#dc2626' },
            { label: 'Renting Wealth', val: fmt(R.finalRenting),  color: '#2563eb' },
            { label: 'P/R Ratio',      val: `${R.prRatio.toFixed(1)}x`, color: R.prRatio > 20 ? '#2563eb' : R.prRatio > 15 ? '#d97706' : '#059669' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>{label}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ BODY: sticky left inputs + scrollable right results ══ */}
      <div className="bvr-main-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(270px, 330px) 1fr', alignItems: 'start' }}>

        {/* ── LEFT: INPUTS ── */}
       <div className="bvr-left-panel" style={{ background: '#fff', borderRight: '1px solid #e5e7eb', padding: '20px 18px', position: 'sticky', top: 0 }}>

          {/* Time horizon */}
          <div style={{ background: '#111827', borderRadius: 12, padding: '16px 16px 12px', marginBottom: 22 }}>
            <Slider label="Analysis Horizon" value={horizon} onChange={setHorizon}
              min={1} max={30} step={1} accent="#f59e0b" suffix=" years" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: -4 }}>
              {[5, 10, 20].map(y => (
                <button key={y} onClick={() => setHorizon(y)} style={{
                  padding: '7px', borderRadius: 7,
                  border: `1px solid ${horizon === y ? '#f59e0b' : '#374151'}`,
                  background: horizon === y ? '#f59e0b' : '#1f2937',
                  color: horizon === y ? '#111827' : '#9ca3af',
                  fontSize: 12, fontWeight: 800, cursor: 'pointer',
                }}>{y}Y</button>
              ))}
            </div>
          </div>

          {/* BUYING */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid #fef2f2' }}>
              <span style={{ fontSize: 16 }}>🏠</span>
              <span style={{ fontWeight: 900, fontSize: 13, color: '#dc2626', textTransform: 'uppercase' }}>Buying Inputs</span>
            </div>
            <Slider label="Property Price"        value={propertyPrice} onChange={setPropertyPrice}
              min={500000} max={50000000} step={100000} accent="#dc2626" isRupee />
            <Slider label="Down Payment"          value={downPct}       onChange={setDownPct}
              min={10} max={50} step={5} accent="#dc2626" suffix="%"
              note={`= ${fmt(propertyPrice * downPct / 100)}`} />
            <Slider label="Stamp Duty & Reg."     value={stampDuty}     onChange={setStampDuty}
              min={3} max={10} step={0.5} accent="#dc2626" suffix="%"
              note={`= ${fmt(propertyPrice * stampDuty / 100)}`} />
            <Slider label="Loan Interest Rate"    value={loanRate}      onChange={setLoanRate}
              min={6} max={14} step={0.25} accent="#dc2626" suffix="% p.a." />
            <Slider label="Loan Tenure"           value={loanYears}     onChange={setLoanYears}
              min={5} max={30} step={1} accent="#dc2626" suffix=" yrs" />
            <Slider label="Annual Maintenance"    value={maintenance}   onChange={setMaintenance}
              min={5000} max={200000} step={5000} accent="#dc2626" isRupee />
            <Slider label="Property Appreciation" value={appreciation}  onChange={setAppreciation}
              min={1} max={15} step={0.5} accent="#dc2626" suffix="% p.a." />
          </div>

          {/* RENTING */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 8, borderBottom: '2px solid #eff6ff' }}>
              <span style={{ fontSize: 16 }}>📈</span>
              <span style={{ fontWeight: 900, fontSize: 13, color: '#2563eb', textTransform: 'uppercase' }}>Renting Inputs</span>
            </div>
            <Slider label="Monthly Rent"           value={monthlyRent}   onChange={setMonthlyRent}
              min={3000} max={200000} step={1000} accent="#2563eb" isRupee />
            <Slider label="Rent Increase (annual)" value={rentIncrease}  onChange={setRentIncrease}
              min={0} max={15} step={1} accent="#2563eb" suffix="% p.a." />
            <Slider label="Investment Return"      value={investReturn}  onChange={setInvestReturn}
              min={4} max={18} step={0.5} accent="#2563eb" suffix="% p.a."
              note="on your initial money + monthly savings" />
          </div>
        </div>

        {/* ── RIGHT: RESULTS ── */}
       {/* Stat cards */}
<div className="bvr-right-panel" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}> 
        {infoPopup.open && (
  <div
    onClick={() => setInfoPopup({ ...infoPopup, open: false })}
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: '320px',
        background: '#fff',
        borderRadius: 14,
        padding: 16,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 14 }}>
        {infoPopup.title}
      </div>

      <div style={{ fontSize: 12, marginTop: 8, color: '#374151' }}>
        {infoPopup.text}
      </div>

      <button
        onClick={() => setInfoPopup({ ...infoPopup, open: false })}
        style={{
          marginTop: 12,
          width: '100%',
          padding: 8,
          borderRadius: 8,
          border: 'none',
          background: '#111827',
          color: '#fff',
        }}
      >
        Close
      </button>
    </div>
  </div>
)}
          {/* Stat cards */}
{/* Stat cards */}
<div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>

  {/* ROW 1 */}
  <div className="bvr-stat-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
    <StatCard
  label="Monthly EMI"
  value={fmt(R.emi)}
  sub="Fixed for loan tenure"
  icon="💳"
  accent="#dc2626"
  info={{
    onClick: () =>
      setInfoPopup({
        open: true,
        title: "Monthly EMI",
        text: "This is your fixed monthly EMI calculated using loan amount, interest rate, and tenure.",
      }),
  }}
/>

    <StatCard
      label="Monthly Rent"
      value={fmt(monthlyRent)}
      sub={`${fmt(monthlyRent * 12)}/yr`}
      icon="🔑"
      accent="#2563eb"
      info={{
  onClick: () =>
    setInfoPopup({
      open: true,
      title: "Monthly Rent",
      text: "Current rent amount you are paying monthly (assumed to increase annually).",
    }),
}}
    />

    <StatCard
      label="EMI vs Rent"
      value={fmt(Math.abs(R.emi - monthlyRent))}
      sub={R.emi > monthlyRent ? 'Extra cost to buy' : 'EMI cheaper than rent!'}
      icon={R.emi > monthlyRent ? '📉' : '🎉'}
      accent={R.emi > monthlyRent ? '#dc2626' : '#059669'}
      info={{
  onClick: () =>
    setInfoPopup({
      open: true,
      title: "EMI vs Rent",
      text: "Difference between EMI and rent. Positive means EMI is higher than rent.",
    }),
}}
    />
  </div>

  {/* ROW 2 → YOUR NEW GRID GOES HERE */}
 <div className="bvr-stat-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>

    <StatCard
      label="Down Payment"
      value={fmt(R.downPayment)}
      sub="Upfront cost"
      icon="💰"
      accent="#111827"
      info={{
        onClick: () =>
          setInfoPopup({
            open: true,
            title: "Down Payment",
            text: "This is the upfront amount you pay...",
          }),
      }}
    />

    <StatCard
      label="Total Interest"
      value={fmt(R.totalInterest)}
      sub="Loan cost"
      icon="🏦"
      accent="#dc2626"
      info={{
        onClick: () =>
          setInfoPopup({
            open: true,
            title: "Total Interest",
            text: "Total extra money paid to bank...",
          }),
      }}
    />

    <StatCard
      label="P/R Ratio"
      value={`${R.prRatio.toFixed(1)}x`}
      sub="Market indicator"
      icon="📊"
      accent="#2563eb"
      info={{
        onClick: () =>
          setInfoPopup({
            open: true,
            title: "Price vs Rent Ratio",
            text: "Comparison of property price vs rent...",
          }),
      }}
    />

  </div>

</div>

         <div className="bvr-tabs" style={{ display: 'flex', gap: 6, marginBottom: 16, background: '#f3f4f6', padding: 4, borderRadius: 10, width: 'fit-content', alignItems: 'center' }}>
  {[
    { key: 'overview',     label: 'Overview',     icon: '📊' },
    { key: 'breakdown',    label: 'Breakdown',    icon: '🔍' },
    { key: 'amortization', label: 'Amortization', icon: '📋' },
    { key: 'advice',       label: 'Advice',       icon: '💡' },
  ].map(t => (
    <Tab
      key={t.key}
      label={t.label}
      icon={t.icon}
      active={activeTab === t.key}
      onClick={() => setActiveTab(t.key)}
    />
  ))}

  {/* 🔽 ADD BUTTON HERE */}
  <button
    onClick={handleExportPDF}
    style={{
      marginLeft: 8,
      padding: '8px 14px',
      borderRadius: 8,
      border: 'none',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 12,
      background: '#059669',
      color: '#fff',
    }}
  >
    📄 Export PDF
  </button>
</div>

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontWeight: 900, fontSize: 14, color: '#111827' }}>Wealth Accumulation</h3>
                  <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', padding: 4, borderRadius: 8 }}>
                    {[
  { k: 'wealth', l: 'Wealth' },
  { k: 'equity', l: 'Equity' },
  { k: 'gap', l: 'Gap' }
].map(c => (
                      <button key={c.k} onClick={() => setChartType(c.k)} style={{
                        padding: '5px 11px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                        background: chartType === c.k ? '#111827' : 'transparent',
                        color: chartType === c.k ? '#fff' : '#6b7280',
                      }}>{c.l}</button>
                    ))}
                  </div>
                </div>
                <div style={{ height: 260 }}>
                  {chartType === 'wealth' && <Line data={wealthChart} options={chartOpts()} />}
                  {chartType === 'equity' && <Line data={equityChart} options={chartOpts()} />}
                  {chartType === 'gap'    && <Bar  data={gapChart}    options={chartOpts()} />}
                </div>
                <p style={{ margin: '10px 0 0', fontSize: 10, color: '#9ca3af', textAlign: 'center' }}>
                  {chartType === 'wealth' && '🔴 Buying wealth = property equity  |  🔵 Renting wealth = investment portfolio'}
                  {chartType === 'equity' && 'Property value growth vs loan paydown — showing real equity buildup'}
                  {chartType === 'gap'    && '🟢 Green = buying ahead  |  🔴 Red = renting ahead'}
                </p>
              </div>

              <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 14px', fontWeight: 900, fontSize: 14, color: '#111827' }}>Year-by-Year Snapshot</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Year', 'Buying Wealth', 'Renting Wealth', 'Who Wins?', 'Gap'].map(h => (
                          <th key={h} style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#6b7280', fontSize: 10, textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {R.buyingTimeline
                        .filter((_, i) => i > 0 && (i % Math.max(1, Math.ceil(horizon / 8)) === 0 || i === horizon))
                        .map(row => {
                          const rRow  = R.rentingTimeline[row.year];
                          const gap   = row.netWealth - rRow.netWealth;
                          const bWins = gap > 0;
                          return (
                            <tr key={row.year} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '8px 10px', fontWeight: 700, color: '#374151', textAlign: 'center' }}>Year {row.year}</td>
                              <td style={{ padding: '8px 10px', color: '#dc2626', fontWeight: 700, textAlign: 'center' }}>{fmt(row.netWealth)}</td>
                              <td style={{ padding: '8px 10px', color: '#2563eb', fontWeight: 700, textAlign: 'center' }}>{fmt(rRow.netWealth)}</td>
                              <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                <span style={{ background: bWins ? '#ecfdf5' : '#eff6ff', color: bWins ? '#059669' : '#2563eb', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700 }}>
                                  {bWins ? '🏠 Buy' : '📈 Rent'}
                                </span>
                              </td>
                              <td style={{ padding: '8px 10px', color: bWins ? '#059669' : '#dc2626', fontWeight: 700, textAlign: 'center' }}>
                                {bWins ? '+' : '-'}{fmt(Math.abs(gap))}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── BREAKDOWN ── */}
          {activeTab === 'breakdown' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="bvr-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

                <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #fecaca' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span>🏠</span>
                    <h3 style={{ margin: 0, fontWeight: 900, fontSize: 14, color: '#dc2626' }}>Buying — Full Cost</h3>
                  </div>
                  {/* All values come from fmt() which already includes ₹ — no extra ₹ prefix here */}
                  <Pill label="Property Price"              color="#111827">{fmt(propertyPrice)}</Pill>
                  <Pill label="Down Payment"                color="#dc2626">{fmt(R.downPayment)}</Pill>
                  <Pill label="Stamp Duty & Registration"   color="#dc2626">{fmt(R.registrationCost)}</Pill>
                  <Pill label="Loan Amount"                 color="#f59e0b">{fmt(R.loanAmount)}</Pill>
                  <Pill label="Monthly EMI"                 color="#dc2626">{fmt(R.emi)}/mo</Pill>
                  <Pill label="Total Interest (full tenure)" color="#dc2626">{fmt(R.totalInterest)}</Pill>
                  <Pill label="Annual Maintenance"          color="#6b7280">{fmt(maintenance)}</Pill>
                  <div style={{ marginTop: 12, padding: '12px 14px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
                    <div style={{ fontSize: 10, color: '#dc2626', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Wealth at Year {horizon}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#dc2626' }}>{fmt(R.finalBuying)}</div>
                    <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>Property equity after {horizon} years</div>
                  </div>
                </div>

                <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span>📈</span>
                    <h3 style={{ margin: 0, fontWeight: 900, fontSize: 14, color: '#2563eb' }}>Renting — Full Cost</h3>
                  </div>
                  <Pill label="Monthly Rent (today)"      color="#2563eb">{fmt(monthlyRent)}/mo</Pill>
                  <Pill label="Annual Rent (today)"       color="#2563eb">{fmt(monthlyRent * 12)}</Pill>
                  {/* Fixed: template literal was broken before */}
                  <Pill label={`Rent at Year ${horizon}`} color="#2563eb">{fmt(monthlyRent * Math.pow(1 + rentIncrease / 100, horizon))}/mo</Pill>
                  <Pill label="Down Payment Invested"     color="#059669">{fmt(R.downPayment)}</Pill>
                  <Pill label="Investment Return"         color="#059669">{investReturn}% p.a.</Pill>
                  <Pill label="Monthly Surplus Invested"  color="#059669">{fmt(Math.max(0, R.emi - monthlyRent))}/mo</Pill>
                  <Pill label="EMI–Rent Difference"       color={R.emi > monthlyRent ? '#059669' : '#dc2626'}>
                    {R.emi > monthlyRent ? 'Renter saves' : 'EMI cheaper by'} {fmt(Math.abs(R.emi - monthlyRent))}/mo
                  </Pill>
                  <div style={{ marginTop: 12, padding: '12px 14px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: 10, color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Portfolio at Year {horizon}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#2563eb' }}>{fmt(R.finalRenting)}</div>
                    <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>Total investment value</div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 14px', fontWeight: 900, fontSize: 14, color: '#111827' }}>⚖️ Price-to-Rent Ratio: {R.prRatio.toFixed(1)}x</h3>
                <div className="bvr-three-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { range: '< 15x',  label: 'Buying Favoured',  desc: 'Property is cheap vs rent. Strong case to buy.',                 good: true,    hit: R.prRatio < 15 },
                    { range: '15–20x', label: 'Borderline',        desc: 'Could go either way. Look at appreciation + returns.',           neutral: true, hit: R.prRatio >= 15 && R.prRatio <= 20 },
                    { range: '> 20x',  label: 'Renting Favoured',  desc: 'Property is expensive vs rent. Renting + investing often wins.', bad: true,     hit: R.prRatio > 20 },
                  ].map(z => (
                    <div key={z.range} style={{
                      padding: '12px 14px', borderRadius: 10,
                      background: z.hit ? (z.good ? '#ecfdf5' : z.neutral ? '#fffbeb' : '#eff6ff') : '#f9fafb',
                      border: `2px solid ${z.hit ? (z.good ? '#6ee7b7' : z.neutral ? '#fcd34d' : '#93c5fd') : '#e5e7eb'}`,
                    }}>
                      <div style={{ fontWeight: 900, fontSize: 15, color: z.good ? '#059669' : z.neutral ? '#d97706' : '#2563eb', marginBottom: 4 }}>{z.range}</div>
                      <div style={{ fontWeight: 700, fontSize: 11, color: '#374151', marginBottom: 4 }}>{z.label}</div>
                      <div style={{ fontSize: 10, color: '#6b7280', lineHeight: 1.5 }}>{z.desc}</div>
                      {z.hit && <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: '#111827' }}>← You are here</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── AMORTIZATION ── */}
          {activeTab === 'amortization' && (
            <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <h3 style={{ margin: 0, fontWeight: 900, fontSize: 14, color: '#111827' }}>📋 Year-by-Year Loan Amortization</h3>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6b7280' }}>
                  <span>EMI: <strong style={{ color: '#dc2626' }}>{fmt(R.emi)}/mo</strong></span>
                  <span>Loan: <strong style={{ color: '#111827' }}>{fmt(R.loanAmount)}</strong></span>
                </div>
              </div>
              <AmortizationTable timeline={R.buyingTimeline} />
            </div>
          )}

          {/* ── ADVICE ── */}
          {activeTab === 'advice' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: verdictBg, border: `2px solid ${verdictColor}`, borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: verdictColor, marginBottom: 8 }}>{verdictText} — based on your inputs</div>
                <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
                  {R.buyingWins
                    ? `Over ${horizon} years, buying at ${fmt(propertyPrice)} builds ${fmt(Math.abs(R.gap))} more wealth than renting at ${fmt(monthlyRent)}/month. Property appreciation of ${appreciation}% per year compounds strongly over time.`
                    : `Over ${horizon} years, renting at ${fmt(monthlyRent)}/month and investing the down payment (${fmt(R.downPayment)}) at ${investReturn}% returns builds ${fmt(Math.abs(R.gap))} more wealth than buying.`}
                </p>
              </div>
              <div className="bvr-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
                  <h4 style={{ margin: '0 0 12px', fontWeight: 900, fontSize: 13, color: '#059669' }}>✅ Buy if…</h4>
                  {[
                    `You plan to stay ${Math.max(7, R.breakEven || 7)}+ years`,
                    'You value stability (no landlord risk)',
                    `P/R ratio below 15 (yours: ${R.prRatio.toFixed(1)}x)`,
                    'Your EMI equals or beats rent',
                    'You are in the 30% tax bracket',
                    'You have stable, long-term income',
                  ].map(t => <div key={t} style={{ fontSize: 12, color: '#374151', padding: '6px 0', borderBottom: '1px solid #f3f4f6', lineHeight: 1.5 }}>{t}</div>)}
                </div>
                <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
                  <h4 style={{ margin: '0 0 12px', fontWeight: 900, fontSize: 13, color: '#2563eb' }}>✅ Rent if…</h4>
                  {[
                    `Likely to relocate within ${Math.min(5, R.breakEven ? R.breakEven - 1 : 5)} years`,
                    `P/R ratio > 20 (yours: ${R.prRatio.toFixed(1)}x)`,
                    `You can invest at ${investReturn}%+ consistently`,
                    'Your career is in a growth phase',
                    'EMI would strain your cash flow',
                    'You want flexibility and liquidity',
                  ].map(t => <div key={t} style={{ fontSize: 12, color: '#374151', padding: '6px 0', borderBottom: '1px solid #f3f4f6', lineHeight: 1.5 }}>{t}</div>)}
                </div>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 14, padding: '14px 18px' }}>
                <h4 style={{ margin: '0 0 8px', fontWeight: 900, fontSize: 13, color: '#92400e' }}>⚠️ What this calculator does NOT account for</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  {[
                    'Section 80C & 24 tax deductions (up to ₹3.5L/year)',
                    'Market volatility — returns may vary',
                    'Floating rate loan risk',
                    'Brokerage on lease renewals (1 month rent)',
                    'Major unexpected repairs',
                    'Rent-free living after full loan payoff',
                  ].map(t => <div key={t} style={{ fontSize: 11, color: '#78350f', padding: '4px 0', lineHeight: 1.5 }}>• {t}</div>)}
                </div>
              </div>
            </div>
          )}

        </div>{/* end right */}
      </div>{/* end grid */}
      <style>{`
  @media (max-width: 768px) {
    .bvr-main-grid {
      grid-template-columns: 1fr !important;
      width: 100% !important;
      gap: 0 !important;
    }
    .bvr-left-panel,
    .bvr-right-panel {
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
    }
    .bvr-left-panel {
      position: relative !important;
      top: auto !important;
      border-right: none !important;
      border-bottom: 1px solid #e5e7eb !important;
      margin-bottom: 18px !important;
      padding: 18px !important;
    }
    .bvr-right-panel {
      padding: 12px !important;
      overflow-x: hidden !important;
    }
    .bvr-stat-row,
    .bvr-two-col,
    .bvr-three-col {
      grid-template-columns: 1fr !important;
    }
    .bvr-stat-row > *,
    .bvr-two-col > *,
    .bvr-three-col > * {
      min-width: 0 !important;
    }
    .bvr-tabs {
      width: 100% !important;
      flex-wrap: wrap !important;
      justify-content: flex-start !important;
      overflow-x: auto !important;
      padding: 8px !important;
      gap: 8px !important;
    }
    .bvr-tabs button {
      flex: 1 1 auto !important;
      min-width: 0 !important;
      white-space: nowrap !important;
      justify-content: center !important;
    }
    .bvr-tabs button:first-child {
      margin-left: 0 !important;
    }
    .bvr-tabs > * {
      min-width: 0 !important;
    }
  }
`}</style>
    </div>
  );
}