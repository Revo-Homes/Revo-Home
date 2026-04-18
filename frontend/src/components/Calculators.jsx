import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, TrendingUp, HelpCircle, Clock, Info } from 'lucide-react';

const Card = ({ children, title, icon: Icon, color = "primary" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-200/50 mb-6"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-10 h-10 bg-${color}/10 rounded-xl flex items-center justify-center`}>
        <Icon size={20} className={`text-${color}`} />
      </div>
      <h3 className="font-bold text-gray-900 text-lg tracking-tight">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const Slider = ({ label, value, min, max, step, format, onChange }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-6">
      <div className="flex justify-between items-baseline mb-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        <span className="text-sm font-black text-primary">{format(value)}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-primary bg-gray-100"
          style={{
            background: `linear-gradient(to right, #ef4444 ${pct}%, #f3f4f6 ${pct}%)`,
          }}
        />
      </div>
    </div>
  );
};

const formatINR = (n) =>
  n >= 10000000
    ? `₹${(n / 10000000).toFixed(2)} Cr`
    : n >= 100000
    ? `₹${(n / 100000).toFixed(1)} L`
    : `₹${Math.round(n).toLocaleString("en-IN")}`;

export const EMICalculator = ({ defaultPrice = 7500000 }) => {
  const [loanAmount, setLoanAmount] = useState(defaultPrice * 0.8);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const { emi, principalPct, interestPct } = useMemo(() => {
    const r = interestRate / 12 / 100;
    const n = tenure * 12;
    const emiVal = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emiVal * n;
    const pPct = (loanAmount / totalPayment) * 100;
    const iPct = 100 - pPct;
    return { emi: Math.round(emiVal), principalPct: pPct, interestPct: iPct };
  }, [loanAmount, interestRate, tenure]);

  return (
    <Card title="EMI Calculator" icon={Calculator}>
      <div className="space-y-2">
        <Slider
          label="Loan Amount"
          value={loanAmount}
          min={500000}
          max={loanAmount > 50000000 ? loanAmount * 1.2 : 50000000}
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
          label="Tenure"
          value={tenure}
          min={1}
          max={30}
          step={1}
          format={(v) => `${v} Years`}
          onChange={setTenure}
        />
      </div>

      <div className="mt-6 p-5 bg-primary/5 rounded-2xl border border-primary/10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 w-full flex">
          <div className="h-full bg-primary" style={{ width: `${principalPct}%` }} />
          <div className="h-full bg-amber-400" style={{ width: `${interestPct}%` }} />
        </div>
        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Monthly EMI</p>
        <p className="text-3xl font-black text-gray-900">₹{emi.toLocaleString()}</p>
      </div>
      
      <div className="mt-4 flex gap-2 items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
        <Info size={12} className="text-primary mt-0.5" />
        <p className="text-[9px] text-gray-500 leading-tight font-bold">
          Estimate based on principal ({Math.round(principalPct)}%) and interest ({Math.round(interestPct)}%).
        </p>
      </div>
    </Card>
  );
};

export const RentalYieldCalculator = ({ defaultPrice = 10000000, defaultRent = 35000 }) => {
  const [purchasePrice, setPurchasePrice] = useState(defaultPrice);
  const [operationalCosts, setOperationalCosts] = useState(Math.round(defaultPrice * 0.001)); // Default 0.1% for maintenance
  const [monthlyRent, setMonthlyRent] = useState(defaultRent);

  const results = useMemo(() => {
    const grossAnnualIncome = monthlyRent * 12;
    const netAnnualIncome = grossAnnualIncome - operationalCosts;
    const grossYield = purchasePrice > 0 ? (grossAnnualIncome / purchasePrice) * 100 : 0;
    const netYield = purchasePrice > 0 ? (netAnnualIncome / purchasePrice) * 100 : 0;
    
    const pbBase = netAnnualIncome > 0 ? purchasePrice / netAnnualIncome : Infinity;
    const paybackYears = pbBase === Infinity ? 0 : Math.floor(pbBase);
    const paybackMonths = pbBase === Infinity ? 0 : Math.round((pbBase - paybackYears) * 12);

    return {
      grossAnnualIncome,
      netAnnualIncome,
      grossYield: isFinite(grossYield) ? grossYield.toFixed(2) : "0.00",
      netYield: isFinite(netYield) ? netYield.toFixed(2) : "0.00",
      paybackYears: paybackMonths === 12 ? paybackYears + 1 : paybackYears,
      paybackMonths: paybackMonths === 12 ? 0 : paybackMonths,
      isPossible: netAnnualIncome > 0
    };
  }, [purchasePrice, operationalCosts, monthlyRent]);

  return (
    <Card title="Rental Yield" icon={TrendingUp}>
      <div className="space-y-4">
        <Slider
          label="Purchase Price"
          value={purchasePrice}
          min={500000}
          max={purchasePrice > 100000000 ? purchasePrice * 1.2 : 100000000}
          step={100000}
          format={formatINR}
          onChange={setPurchasePrice}
        />
        <Slider
          label="Monthly Rent"
          value={monthlyRent}
          min={1000}
          max={purchasePrice / 100}
          step={500}
          format={formatINR}
          onChange={setMonthlyRent}
        />
        <Slider
          label="Annual Costs"
          value={operationalCosts}
          min={0}
          max={Math.max(50000, monthlyRent * 2)}
          step={500}
          format={formatINR}
          onChange={setOperationalCosts}
        />
      </div>

      <div className="mt-6 space-y-3">
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 text-center">Payback Period</p>
          <div className="flex justify-center items-center gap-2">
            <Clock size={16} className="text-primary" />
            <p className="text-xl font-black text-gray-900">
              {results.isPossible ? `${results.paybackYears}y ${results.paybackMonths}m` : 'N/A'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Gross Yield</p>
            <p className="text-base font-black text-gray-900">{results.grossYield}%</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-primary/20 text-center shadow-sm">
            <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-0.5">Net Yield</p>
            <p className="text-base font-black text-primary">{results.netYield}%</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2 items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
        <HelpCircle size={12} className="text-primary mt-0.5" />
        <p className="text-[9px] text-gray-500 leading-tight font-bold">
          Net income = Gross rent - annual maintenance & taxes.
        </p>
      </div>
    </Card>
  );
};
