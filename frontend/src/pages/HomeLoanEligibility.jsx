import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Briefcase,
  Home,
  Users,
  Calculator,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  ChevronRight,
} from "lucide-react";

/* ─── helpers ─── */
const formatINR = (n) =>
  n >= 10000000
    ? `₹${(n / 10000000).toFixed(2)} Cr`
    : n >= 100000
    ? `₹${(n / 100000).toFixed(1)} L`
    : `₹${Math.round(n).toLocaleString("en-IN")}`;

const CREDIT_SCORE_MAP = {
  "below-300": { label: "Below 300", score: 250, points: 5 },
  "300-549":   { label: "Poor (300–549)",          score: 420, points: 8 },
  "550-649":   { label: "Fair (550–649)",           score: 600, points: 13 },
  "650-699":   { label: "Good (650–699)",           score: 675, points: 18 },
  "700-749":   { label: "Very Good (700–749)",      score: 725, points: 23 },
  "750-799":   { label: "Excellent (750–799)",      score: 775, points: 27 },
  "800+":      { label: "Exceptional (800+)",       score: 820, points: 30 },
};

/* ─── section wrapper ─── */
function Section({ icon: Icon, title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/60 p-8 mb-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/15">
          <Icon size={18} />
        </div>
        <h2 className="text-lg font-black text-gray-900">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

/* ─── field ─── */
function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-gray-300";

/* ─── toggle buttons (Salaried / Self-Employed) ─── */
function ToggleGroup({ value, onChange, options }) {
  return (
    <div className="flex gap-3">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
            value === opt
              ? "bg-primary text-white shadow-lg shadow-primary/25"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ─── eligibility engine ─── */
function computeEligibility({
  monthlyIncome,
  existingEMIs,
  desiredLoan,
  propertyValue,
  downPayment,
  creditRange,
  coApplicantIncome,
}) {
  const totalIncome = monthlyIncome + coApplicantIncome;
  const creditInfo = CREDIT_SCORE_MAP[creditRange];
  const creditScore = creditInfo ? creditInfo.score : 0;

  // FOIR (Fixed Obligation to Income Ratio) — banks allow ~40-50 %
  const foirAllowed = totalIncome * 0.45;
  const availableForEMI = Math.max(foirAllowed - existingEMIs, 0);

  // Max loan based on available EMI capacity (20yr @ 8.5%)
  const r = 8.5 / 12 / 100;
  const n = 20 * 12;
  const maxLoanByIncome =
    (availableForEMI * (Math.pow(1 + r, n) - 1)) /
    (r * Math.pow(1 + r, n));

  // LTV cap — banks lend up to 80% of property value
  const ltvCap = propertyValue * 0.8;
  const maxLoan = Math.min(maxLoanByIncome, ltvCap);
  const recommendedLoan = maxLoan * 0.9;

  // Compute EMI for desired loan
  const desiredEMI =
    (desiredLoan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  // DTI
  const dti =
    totalIncome > 0
      ? (((desiredEMI + existingEMIs) / totalIncome) * 100).toFixed(1)
      : "N/A";

  // Score factors
  const factors = [];
  let score = 0;

  // Credit score
  const creditPoints = creditInfo ? creditInfo.points : 0;
  score += creditPoints;
  if (creditScore >= 750) {
    factors.push({ ok: true, text: "Excellent credit score" });
  } else if (creditScore >= 650) {
    factors.push({ ok: true, text: "Good credit score" });
  } else if (creditScore >= 550) {
    factors.push({ ok: false, text: "Fair credit score — may affect approval" });
  } else {
    factors.push({ ok: false, text: "Low / unknown credit score — likely to affect approval" });
  }
  // DTI
  const dtiNum = parseFloat(dti);
  if (dtiNum <= 40) {
    factors.push({ ok: true, text: "Healthy debt-to-income ratio" });
    score += 25;
  } else if (dtiNum <= 60) {
    factors.push({ ok: false, text: "Moderate debt-to-income ratio" });
    score += 10;
  } else {
    factors.push({ ok: false, text: "High debt-to-income ratio" });
  }

  // LTV
  const ltv =
    propertyValue > 0
      ? ((desiredLoan / propertyValue) * 100).toFixed(1)
      : "N/A";
  const ltvNum = parseFloat(ltv);
  if (ltvNum <= 75) {
    factors.push({ ok: true, text: "Excellent loan-to-value ratio" });
    score += 25;
  } else if (ltvNum <= 80) {
    factors.push({ ok: true, text: "Acceptable loan-to-value ratio" });
    score += 15;
  } else {
    factors.push({ ok: false, text: "Very high loan-to-value ratio" });
    score += 5;
  }

  // Income sufficiency
  if (desiredLoan <= maxLoan) {
    factors.push({ ok: true, text: "Income supports desired loan amount" });
    score += 20;
  } else {
    factors.push({ ok: false, text: "Income may be insufficient for desired loan" });
  }

  const scoreStatus =
    score >= 80
      ? { label: "Excellent", color: "from-emerald-500 to-emerald-400" }
      : score >= 60
      ? { label: "Good", color: "from-blue-500 to-blue-400" }
      : score >= 40
      ? { label: "Needs improvement", color: "from-amber-500 to-orange-400" }
      : { label: "Poor", color: "from-red-500 to-red-400" };

  return {
    score,
    scoreStatus,
    maxLoan,
    recommendedLoan,
    desiredEMI,
    dti,
    ltv,
    factors,
  };
}

/* ─── results modal ─── */
function ResultsModal({ result, onClose, navigate }) {
  const { score, scoreStatus, maxLoan, recommendedLoan, desiredEMI, dti, factors } = result;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* header */}
          <div className="flex items-center justify-between px-8 pt-8 pb-0">
            <h3 className="text-xl font-black text-gray-900">Eligibility Results</h3>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* score banner */}
            <div className={`rounded-2xl bg-gradient-to-br ${scoreStatus.color} p-6 text-white text-center`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calculator size={18} className="text-white/70" />
                <span className="text-white/80 text-sm font-bold uppercase tracking-widest">
                  Eligibility Score
                </span>
              </div>
              <div className="text-6xl font-black mb-1">{score}/100</div>
              <div className="flex items-center justify-center gap-2 text-white/80 text-sm font-semibold">
                {score >= 60 ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertTriangle size={16} />
                )}
                {scoreStatus.label}
              </div>
            </div>

            {/* stat cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Max Loan Amount", value: formatINR(Math.round(maxLoan)) },
                { label: "Recommended Loan", value: formatINR(Math.round(recommendedLoan)), green: true },
                { label: "Monthly EMI", value: `₹${Math.round(desiredEMI).toLocaleString("en-IN")}` },
                { label: "DTI Ratio", value: `${dti}%` },
              ].map(({ label, value, green }) => (
                <div
                  key={label}
                  className={`rounded-2xl p-4 border ${
                    green
                      ? "bg-emerald-50 border-emerald-100"
                      : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {label}
                  </p>
                  <p className="text-lg font-black text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            {/* assessment factors */}
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                Assessment Factors
              </p>
              <div className="space-y-2">
                {factors.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
                  >
                    {f.ok ? (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={16} className="text-red-400 shrink-0" />
                    )}
                    <span className="text-sm font-semibold text-gray-700">
                      {f.ok ? "✓" : "✗"} {f.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
  onClick={() => { onClose(); navigate("/tools?tab=loans"); }}
  className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-white font-black rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2"
>
  Get Expert Home Loan Assistance
  <ChevronRight size={16} />
</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── main component ─── */
export default function HomeLoanEligibility() {
    const navigate = useNavigate(); 
  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    email: "",
    phone: "",
    employmentType: "Salaried",
    monthlyIncome: "",
    existingEMIs: "",
    desiredLoan: "",
    propertyValue: "",
    downPayment: "",
    creditRange: "",
    coApplicantName: "",
    coApplicantIncome: "",
  });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Required";
    if (!form.email.trim()) errs.email = "Required";
    if (!form.phone.trim()) errs.phone = "Required";
    if (!form.monthlyIncome || isNaN(form.monthlyIncome))
      errs.monthlyIncome = "Enter a valid amount";
    if (!form.desiredLoan || isNaN(form.desiredLoan))
      errs.desiredLoan = "Enter a valid amount";
    if (!form.propertyValue || isNaN(form.propertyValue))
      errs.propertyValue = "Enter a valid amount";
    if (!form.creditRange) errs.creditRange = "Please select a credit score range";
    return errs;
  };

  const handleCheck = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setResult(
      computeEligibility({
        monthlyIncome: parseFloat(form.monthlyIncome) || 0,
        existingEMIs: parseFloat(form.existingEMIs) || 0,
        desiredLoan: parseFloat(form.desiredLoan) || 0,
        propertyValue: parseFloat(form.propertyValue) || 0,
        downPayment: parseFloat(form.downPayment) || 0,
        creditRange: form.creditRange,
        coApplicantIncome: parseFloat(form.coApplicantIncome) || 0,
      })
    );
  };

  return (
    <div className="pb-6 px-2">
  <div className="w-full">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">
            Financial Tools
          </p>
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Home Loan Eligibility Calculator
          </h1>
          <p className="text-gray-400 font-medium">
            Check your eligibility with our advanced assessment
          </p>
        </motion.div>

        {/* ── Personal Details ── */}
        <Section icon={User} title="Personal Details">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Full Name" required>
              <input
                className={inputCls}
                placeholder="e.g. Rahul Sharma"
                value={form.fullName}
                onChange={set("fullName")}
              />
              {errors.fullName && (
                <span className="text-xs text-red-500 font-semibold">
                  {errors.fullName}
                </span>
              )}
            </Field>
            <Field label="Date of Birth">
              <input
                type="date"
                className={inputCls}
                value={form.dob}
                onChange={set("dob")}
              />
            </Field>
            <Field label="Email" required>
              <input
                type="email"
                className={inputCls}
                placeholder="you@email.com"
                value={form.email}
                onChange={set("email")}
              />
              {errors.email && (
                <span className="text-xs text-red-500 font-semibold">
                  {errors.email}
                </span>
              )}
            </Field>
            <Field label="Phone" required>
              <input
                type="tel"
                className={inputCls}
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={set("phone")}
              />
              {errors.phone && (
                <span className="text-xs text-red-500 font-semibold">
                  {errors.phone}
                </span>
              )}
            </Field>
          </div>
        </Section>

        {/* ── Employment & Income ── */}
        <Section icon={Briefcase} title="Employment & Income">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Field label="Employment Type" required>
                <ToggleGroup
                  value={form.employmentType}
                  onChange={(v) => setForm((f) => ({ ...f, employmentType: v }))}
                  options={["Salaried", "Self Employed"]}
                />
              </Field>
            </div>
            <Field label="Monthly Income (₹)" required>
              <input
                type="number"
                className={inputCls}
                placeholder="e.g. 75000"
                value={form.monthlyIncome}
                onChange={set("monthlyIncome")}
              />
              {errors.monthlyIncome && (
                <span className="text-xs text-red-500 font-semibold">
                  {errors.monthlyIncome}
                </span>
              )}
            </Field>
            <Field label="Existing EMIs (₹)">
              <input
                type="number"
                className={inputCls}
                placeholder="0 if none"
                value={form.existingEMIs}
                onChange={set("existingEMIs")}
              />
            </Field>
          </div>
        </Section>

        {/* ── Loan & Property ── */}
        <Section icon={Home} title="Loan & Property Details">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Desired Loan Amount (₹)" required>
              <input
                type="number"
                className={inputCls}
                placeholder="e.g. 5000000"
                value={form.desiredLoan}
                onChange={set("desiredLoan")}
              />
              {errors.desiredLoan && (
                <span className="text-xs text-red-500 font-semibold">
                  {errors.desiredLoan}
                </span>
              )}
            </Field>
            <Field label="Property Value (₹)" required>
              <input
                type="number"
                className={inputCls}
                placeholder="e.g. 6500000"
                value={form.propertyValue}
                onChange={set("propertyValue")}
              />
              {errors.propertyValue && (
                <span className="text-xs text-red-500 font-semibold">
                  {errors.propertyValue}
                </span>
              )}
            </Field>
            <Field label="Down Payment (₹)">
              <input
                type="number"
                className={inputCls}
                placeholder="e.g. 1000000"
                value={form.downPayment}
                onChange={set("downPayment")}
              />
            </Field>
            <Field label="Credit Score Range" required>
              <select
                className={inputCls}
                value={form.creditRange}
                onChange={set("creditRange")}
              >
                <option value="">Select range</option>
                {Object.entries(CREDIT_SCORE_MAP).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
               {errors.creditRange && (
                <span className="text-xs text-red-500 font-semibold">
                  {errors.creditRange}
                </span>
              )}
            </Field>
          </div>
        </Section>

        {/* ── Co-Applicant ── */}
        <Section icon={Users} title="Co-Applicant (Optional)">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Co-Applicant Name">
              <input
                className={inputCls}
                placeholder="Full name"
                value={form.coApplicantName}
                onChange={set("coApplicantName")}
              />
            </Field>
            <Field label="Co-Applicant Income (₹)">
              <input
                type="number"
                className={inputCls}
                placeholder="Monthly income"
                value={form.coApplicantIncome}
                onChange={set("coApplicantIncome")}
              />
            </Field>
          </div>
        </Section>

        {/* ── CTA ── */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleCheck}
          className="w-full py-5 bg-gradient-to-r from-primary to-primary/80 text-white font-black text-base rounded-2xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
        >
          <Calculator size={20} />
          Check Eligibility
        </motion.button>
      </div>

      {/* Results modal */}
      {result && (
    <ResultsModal result={result} onClose={() => setResult(null)} navigate={navigate} />
  )}

    </div>
  );
}