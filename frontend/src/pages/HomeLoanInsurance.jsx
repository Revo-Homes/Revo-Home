import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  ShieldCheck, 
  TrendingDown, 
  Scale, 
  User, 
  Calendar, 
  Percent,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Tooltip component for currency values
const CurrencyTooltip = ({ children, value }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const fullAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
          {fullAmount}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

const HomeLoanInsurance = () => {
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [age, setAge] = useState(30);
  const [insuranceType, setInsuranceType] = useState('reducing'); // 'reducing' | 'fixed'

  const results = useMemo(() => {
    const r = interestRate / 12 / 100;
    const n = tenure * 12;
    const p = loanAmount;

    // EMI
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalRepayment = emi * n;
    const totalInterest = totalRepayment - p;

    // Amortization & Coverage
    const chartData = [];
    let remainingBalance = p;
    for (let i = 0; i <= n; i += 12) { // Yearly data for chart
      const year = i / 12;
      const coverage = insuranceType === 'fixed' ? p : remainingBalance;
      
      chartData.push({
        year,
        loanBalance: Math.round(remainingBalance),
        insuranceCoverage: Math.round(coverage)
      });

      // Update balance for next year
      for (let j = 0; j < 12; j++) {
        const interestMonth = remainingBalance * r;
        const principalMonth = emi - interestMonth;
        remainingBalance = Math.max(0, remainingBalance - principalMonth);
      }
    }

    // Premium Calculation (Dummy logic based on age and loan)
    // Age factor: 0.1% per every 10 years above 20
    const ageFactor = 0.005 + (Math.max(0, age - 20) / 10) * 0.002;
    const basePremium = p * ageFactor;
    
    // Reducing cover is generally 30% cheaper
    const premium = insuranceType === 'reducing' ? basePremium * 0.7 : basePremium;

    return {
      emi: Math.round(emi),
      totalRepayment: Math.round(totalRepayment),
      totalInterest: Math.round(totalInterest),
      premium: Math.round(premium),
      chartData
    };
  }, [loanAmount, interestRate, tenure, age, insuranceType]);

  const formatCurrency = (val) => {
    if (val >= 10000000) {
      // For values >= 1 crore, show in crores
      return `₹${(val / 10000000).toFixed(2)}Cr`;
    } else if (val >= 100000) {
      // For values >= 1 lakh, show in lakhs
      return `₹${(val / 100000).toFixed(1)}L`;
    } else {
      // For smaller values, show full amount
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(val);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Inputs */}
        <div className="lg:col-span-4 space-y-6 bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Insurance Plan</h3>
          </div>

          {/* Insurance Type Toggle */}
          <div className="p-1 bg-white rounded-2xl border border-gray-100 flex shadow-sm">
            <button 
              onClick={() => setInsuranceType('reducing')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                insuranceType === 'reducing' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Reducing
            </button>
            <button 
              onClick={() => setInsuranceType('fixed')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                insuranceType === 'fixed' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Fixed
            </button>
          </div>

          {/* Loan Amount */}
          <div className="space-y-4 pt-4">
            <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>Loan Amount</span>
              <span className="text-primary font-black">{formatCurrency(loanAmount)}</span>
            </div>
            <input
              type="range"
              min="500000"
              max="50000000"
              step="100000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-3 bg-white rounded-full appearance-none cursor-pointer accent-primary border border-gray-100 shadow-sm transition-all"
              style={{
                background: `linear-gradient(to right, #B91C1C ${((loanAmount - 500000) / (50000000 - 500000)) * 100}%, #e5e7eb 0%)`
              }}
            />
          </div>

          {/* Interest Rate */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>Interest Rate</span>
              <span className="text-primary font-black">{interestRate}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="15"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-3 bg-white rounded-full appearance-none cursor-pointer accent-primary border border-gray-100 shadow-sm transition-all"
              style={{
                background: `linear-gradient(to right, #B91C1C ${((interestRate - 5) / (15 - 5)) * 100}%, #e5e7eb 0%)`
              }}
            />
          </div>

          {/* Tenure */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>Tenure</span>
              <span className="text-primary font-black">{tenure} Yrs</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full h-3 bg-white rounded-full appearance-none cursor-pointer accent-primary border border-gray-100 shadow-sm transition-all"
              style={{
                background: `linear-gradient(to right, #B91C1C ${((tenure - 1) / (30 - 1)) * 100}%, #e5e7eb 0%)`
              }}
            />
          </div>

          {/* User Age */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>User Age</span>
              <span className="text-primary font-black">{age} Yrs</span>
            </div>
            <input
              type="range"
              min="20"
              max="65"
              step="1"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full h-3 bg-white rounded-full appearance-none cursor-pointer accent-primary border border-gray-100 shadow-sm transition-all"
              style={{
                background: `linear-gradient(to right, #B91C1C ${((age - 20) / (65 - 20)) * 100}%, #e5e7eb 0%)`
              }}
            />
          </div>
        </div>

        {/* Right Panel: Data & Chart */}
        <div className="lg:col-span-8 space-y-8">
           {/* Premium & EMI Summary */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
              <div className="bg-primary p-8 rounded-[2.5rem] text-white shadow-2xl shadow-primary/20 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <ShieldCheck size={120} />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-80">Estimated Premium</h4>
                 <CurrencyTooltip value={results.premium}>
                   <p className="text-4xl font-black mb-2">{formatCurrency(results.premium)}</p>
                 </CurrencyTooltip>
                 <p className="text-xs font-bold opacity-70 italic">One-time premium for entire tenure</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg flex flex-col justify-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Monthly EMI</p>
                  <CurrencyTooltip value={results.emi}>
                    <p className="text-xl font-black text-gray-900">{formatCurrency(results.emi)}</p>
                  </CurrencyTooltip>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-lg flex flex-col justify-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Repayment</p>
                  <CurrencyTooltip value={results.totalRepayment}>
                    <p className="text-xl font-black text-gray-900">{formatCurrency(results.totalRepayment)}</p>
                  </CurrencyTooltip>
                </div>
                <div className="col-span-2 bg-cta/5 p-6 rounded-[2.5rem] border border-cta/10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-cta text-white rounded-xl flex items-center justify-center shadow-lg shadow-cta/20">
                     <TrendingDown size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Interest Saved</p>
                    <p className="text-xl font-black text-cta">Secure your family's future</p>
                  </div>
                </div>
              </div>
           </div>

           {/* Visualization */}
           <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h4 className="text-xl font-black text-gray-900 leading-tight">Coverage vs. Balance</h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Yearly progression</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loan Balance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cta/20 border border-cta" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coverage</span>
                  </div>
                </div>
              </div>
              
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.chartData}>
                    <defs>
                      <linearGradient id="colorLoan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B91C1C" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#B91C1C" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCoverage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis 
                      dataKey="year" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 900 }}
                      label={{ value: 'YEARS', position: 'bottom', offset: -10, fontSize: 10, fontWeight: 900, fill: '#D1D5DB' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                      tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 900 }}
                    />
                    <Tooltip 
                      formatter={(val) => formatCurrency(val)}
                      contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="loanBalance" 
                      stroke="#B91C1C" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorLoan)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="insuranceCoverage" 
                      stroke="#FF6B35" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorCoverage)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Why Insurance? */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-4">
                  <CheckCircle size={20} />
                </div>
                <h5 className="font-black text-gray-900 mb-2 uppercase text-[10px] tracking-widest">Financial Safety</h5>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Protects your family from loan burden in case of unforeseen events.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-4">
                  <CheckCircle size={20} />
                </div>
                <h5 className="font-black text-gray-900 mb-2 uppercase text-[10px] tracking-widest">Tax Savings</h5>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Tax benefits under Section 80C may be applicable on premiums paid.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-4">
                  <CheckCircle size={20} />
                </div>
                <h5 className="font-black text-gray-900 mb-2 uppercase text-[10px] tracking-widest">Peace of Mind</h5>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Ensure true ownership of your home for your loved ones.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HomeLoanInsurance;
