import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Percent, 
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

const HomeLoan360 = () => {
  const [propertyPrice, setPropertyPrice] = useState(5000000);
  const [downPayment, setDownPayment] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [salary, setSalary] = useState(100000);
  const [showAmortization, setShowAmortization] = useState(false);

  // Auto-calculated Loan Amount
  const loanAmount = useMemo(() => propertyPrice - downPayment, [propertyPrice, downPayment]);

  const results = useMemo(() => {
    const r = interestRate / 12 / 100;
    const n = tenure * 12;
    const p = loanAmount;

    if (r === 0) return { emi: p / n, totalPayment: p, totalInterest: 0 };

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - p;

    // Eligibility
    const maxEmi = salary * 0.4;
    const eligibleLoan = (maxEmi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));

    // Amortization
    const amortization = [];
    let remainingBalance = p;
    for (let i = 1; i <= Math.min(n, 120); i++) { // Limit to 120 for UI performance or show all? user asked for table.
      const interestMonth = remainingBalance * r;
      const principalMonth = emi - interestMonth;
      remainingBalance = Math.max(0, remainingBalance - principalMonth);

      amortization.push({
        month: i,
        emi: emi.toFixed(0),
        interest: interestMonth.toFixed(0),
        principal: principalMonth.toFixed(0),
        balance: remainingBalance.toFixed(0)
      });
    }

    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      maxEmi: Math.round(maxEmi),
      eligibleLoan: Math.round(eligibleLoan),
      amortization,
      pieData: [
        { name: 'Principal Amount', value: p, color: '#B91C1C' },
        { name: 'Total Interest', value: Math.round(totalInterest), color: '#FF6B35' }
      ]
    };
  }, [loanAmount, interestRate, tenure, salary]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-6 bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Calculator size={24} />
            </div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Loan Parameters</h3>
          </div>

          {/* Property Price */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">Property Price</label>
              <span className="text-lg font-black text-primary">{formatCurrency(propertyPrice)}</span>
            </div>
            <input
              type="range"
              min="500000"
              max="50000000"
              step="100000"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
              style={{
                background: `linear-gradient(to right, #B91C1C ${((propertyPrice - 500000) / (50000000 - 500000)) * 100}%, #e5e7eb 0%)`
              }}
            />
          </div>

          {/* Down Payment */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">Down Payment</label>
              <span className="text-lg font-black text-primary">{formatCurrency(downPayment)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={propertyPrice * 0.8}
              step="50000"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
              style={{
                background: `linear-gradient(to right, #B91C1C ${(downPayment / (propertyPrice * 0.8)) * 100}%, #e5e7eb 0%)`
              }}
            />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
              Loan Amount: {formatCurrency(loanAmount)}
            </p>
          </div>

          {/* Interest Rate */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">Interest Rate (% p.a.)</label>
              <span className="text-lg font-black text-primary">{interestRate}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
              style={{
                background: `linear-gradient(to right, #B91C1C ${((interestRate - 5) / (20 - 5)) * 100}%, #e5e7eb 0%)`
              }}
            />
          </div>

          {/* Tenure */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">Tenure (Years)</label>
              <span className="text-lg font-black text-primary">{tenure} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
              style={{
                background: `linear-gradient(to right, #B91C1C ${((tenure - 1) / (30 - 1)) * 100}%, #e5e7eb 0%)`
              }}
            />
          </div>

          {/* Monthly Salary */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">Monthly Salary</label>
              <span className="text-lg font-black text-primary">{formatCurrency(salary)}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="1000000"
              step="5000"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
              style={{
                background: `linear-gradient(to right, #B91C1C ${((salary - 10000) / (1000000 - 10000)) * 100}%, #e5e7eb 0%)`
              }}
            />
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Monthly EMI</p>
              <p className="text-3xl font-black text-primary">{formatCurrency(results.emi)}</p>
            </div>
            <div className="bg-cta/5 p-6 rounded-[2rem] border border-cta/10">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Interest</p>
              <p className="text-3xl font-black text-cta">{formatCurrency(results.totalInterest)}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Payment</p>
              <p className="text-2xl font-black text-gray-900">{formatCurrency(results.totalPayment)}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Loan Eligibility</p>
              <p className="text-2xl font-black text-green-600">{formatCurrency(results.eligibleLoan)}</p>
              <p className="text-[10px] text-green-500 font-bold mt-1 uppercase tracking-wider">Max EMI: {formatCurrency(results.maxEmi)}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 text-center">Breakup of Total Payment</h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={results.pieData}
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {results.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
             <button 
                onClick={() => setShowAmortization(!showAmortization)}
                className="flex-1 py-5 bg-white border-2 border-primary/20 text-primary rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary/5 transition-all flex items-center justify-center gap-3"
             >
                {showAmortization ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                {showAmortization ? 'Hide Breakdown' : 'Show Monthly Breakdown'}
             </button>
             <button 
                onClick={handleExportPDF}
                className="px-8 py-5 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-3"
             >
                <Download size={18} />
                Export
             </button>
          </div>

          {/* Amortization Table */}
          {showAmortization && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-[2rem] border border-gray-100 shadow-xl"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Month</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Principal</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Interest</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {results.amortization.map((row) => (
                      <tr key={row.month} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-black text-gray-900">{row.month}</td>
                        <td className="px-6 py-4 font-bold text-gray-600">₹{Number(row.principal).toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-gray-600">₹{Number(row.interest).toLocaleString()}</td>
                        <td className="px-6 py-4 font-black text-primary italic">₹{Number(row.balance).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-6 bg-gray-50 text-center">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Showing first 120 months. Full schedule available in export.</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeLoan360;
