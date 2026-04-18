import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const formatINR = (n) =>
  n >= 10000000
    ? `₹${(n / 10000000).toFixed(2)} Cr`
    : n >= 100000
    ? `₹${(n / 100000).toFixed(1)} L`
    : `₹${Math.round(n).toLocaleString("en-IN")}`;

function Slider({ label, value, min, max, step, format, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-8">
      <div className="flex justify-between items-baseline mb-3">
        <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">{label}</label>
        <span className="text-xl font-black text-primary">{format(value)}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary"
          style={{
            background: `linear-gradient(to right, var(--color-primary) ${pct}%, #e5e7eb ${pct}%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-300 font-bold mt-2 uppercase tracking-widest">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function StatRow({ label, value, accent, border }) {
  return (
    <div className={`flex justify-between items-center py-4 ${border ? "border-t border-white/20" : ""}`}>
      <span className={`text-sm font-bold ${accent ? "text-white" : "text-white/70"}`}>{label}</span>
      <span className={`font-black ${accent ? "text-2xl text-white" : "text-white/90"}`}>{value}</span>
    </div>
  );
}

function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const { emi, totalPayment, totalInterest, principalPct, interestPct } = useMemo(() => {
    const r = interestRate / 12 / 100;
    const n = tenure * 12;
    const emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - loanAmount;
    const principalPct = (loanAmount / totalPayment) * 100;
    const interestPct = (totalInterest / totalPayment) * 100;
    return { emi, totalPayment, totalInterest, principalPct, interestPct };
  }, [loanAmount, interestRate, tenure]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        {/* <Link to="/tools" className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-8 hover:gap-3 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tools
        </Link> */}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">Financial Tools</p>
          <h1 className="text-4xl font-black text-gray-900 mb-2">EMI Calculator</h1>
          <p className="text-gray-400 font-medium">Instantly calculate your home loan monthly EMI</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left — Sliders */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/60 p-8"
          >
            <h2 className="text-xl font-black text-gray-900 mb-8">Loan Details</h2>

            <Slider
              label="Loan Amount"
              value={loanAmount}
              min={500000}
              max={50000000}
              step={100000}
              format={formatINR}
              onChange={setLoanAmount}
            />
            <Slider
              label="Interest Rate"
              value={interestRate}
              min={6}
              max={18}
              step={0.1}
              format={(v) => `${v.toFixed(1)}%`}
              onChange={setInterestRate}
            />
            <Slider
              label="Loan Tenure"
              value={tenure}
              min={1}
              max={30}
              step={1}
              format={(v) => `${v} yr${v !== 1 ? "s" : ""}`}
              onChange={setTenure}
            />

            {/* Pie-like bar breakdown */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Payment Breakdown</p>
              <div className="h-3 rounded-full overflow-hidden flex">
                <motion.div
                  className="bg-primary h-full rounded-l-full"
                  animate={{ width: `${principalPct}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 16 }}
                />
                <motion.div
                  className="bg-amber-400 h-full rounded-r-full"
                  animate={{ width: `${interestPct}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 16 }}
                />
              </div>
              <div className="flex gap-6 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-xs font-bold text-gray-500">Principal ({principalPct.toFixed(0)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-xs font-bold text-gray-500">Interest ({interestPct.toFixed(0)}%)</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — Result */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-gradient-to-br from-primary to-primary/80 rounded-3xl shadow-2xl shadow-primary/25 p-8 text-white"
          >
            <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">Monthly EMI</p>
            <AnimatePresence mode="wait">
              <motion.h2
                key={Math.round(emi)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-5xl font-black mb-8"
              >
                ₹{Math.round(emi).toLocaleString("en-IN")}
              </motion.h2>
            </AnimatePresence>

            <div className="space-y-0 divide-y divide-white/10">
              <StatRow label="Loan Amount" value={formatINR(loanAmount)} />
              <StatRow label="Interest Rate" value={`${interestRate.toFixed(1)}% p.a.`} />
              <StatRow label="Tenure" value={`${tenure} years`} />
              <StatRow label="Total Interest" value={formatINR(Math.round(totalInterest))} />
              <StatRow label="Total Payment" value={formatINR(Math.round(totalPayment))} accent border />
            </div>

            <Link
              to="/tools/home-loan"
              className="mt-8 flex items-center justify-center gap-2 w-full py-4 bg-white text-primary font-black rounded-2xl hover:bg-gray-50 transition-all shadow-lg active:scale-95 text-sm"
            >
              Get Home Loan Assistance
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default EMICalculator;