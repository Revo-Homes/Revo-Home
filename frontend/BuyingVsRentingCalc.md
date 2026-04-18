# 🏠 Buy vs Rent Calculator — Calculation Logic Explained


---

## 1. Core Inputs

| Input | Symbol | Typical Range |
|---|---|---|
| Property Price | P | ₹5L – ₹5Cr |
| Down Payment % | dp% | 10% – 50% |
| Home Loan Interest Rate | r | 6% – 14% p.a. |
| Loan Tenure | n | 5 – 30 years |
| Annual Maintenance | M | ₹10,000 – ₹2,00,000 |
| Property Appreciation | a | 2% – 12% p.a. |
| Monthly Rent | R | ₹5,000 – ₹2,00,000 |
| Annual Rent Increase | ri | 0% – 15% p.a. |
| Investment Return Rate | ir | 5% – 18% p.a. |
| Time Horizon | T | 1 – 30 years |

---

## 2. Buying Path — Step by Step

### Step 1: Down Payment
```
Down Payment Amount = P × (dp% / 100)
Loan Amount         = P − Down Payment Amount
```
**Example:** Property = ₹50L, dp = 20%
→ Down Payment = ₹10L, Loan = ₹40L

---

### Step 2: Monthly EMI (Equated Monthly Instalment)
Uses the standard annuity formula:

```
Monthly Interest Rate (mr) = r / 12 / 100

EMI = Loan × mr × (1 + mr)^(n×12)
      ─────────────────────────────
           (1 + mr)^(n×12) − 1
```
**Example:** Loan = ₹40L, r = 8.5%, n = 20 years
→ mr = 0.085/12 = 0.007083
→ EMI ≈ ₹34,726/month

---

### Step 3: Total Interest Paid Over Loan
```
Total Payment = EMI × (n × 12)
Total Interest = Total Payment − Loan Amount
```
**Example:** ₹34,726 × 240 months = ₹83.34L total → ₹43.34L in interest

---

### Step 4: Property Value at Year Y
Grows at a compounding appreciation rate each year:
```
Property Value(Y) = P × (1 + a/100)^Y
```
**Example:** ₹50L at 5%/year after 10 years → ₹81.44L

---

### Step 5: Outstanding Loan Balance at Year Y
The remaining principal after Y years of EMI payments:
```
Months Paid = Y × 12
Balance(Y) = Loan × (1 + mr)^(n×12) − (1 + mr)^(Months Paid)
             ──────────────────────────────────────────────────
                        (1 + mr)^(n×12) − 1
```
This is the "amortization" formula. After the full tenure, balance = 0.

---

### Step 6: Buying Net Wealth at Year Y
```
Buying Net Wealth(Y) = Property Value(Y) − Outstanding Loan Balance(Y)
```
This is your TRUE equity — what you'd walk away with if you sold the property and paid off the bank.

> Note: Costs like registration (typically 5–7% of property value), stamp duty, and brokerage are included as one-time upfront costs in the Total Cost of Ownership.

---

### Step 7: Total Cost of Ownership (for transparency)
```
Upfront Costs     = Down Payment + Registration & Stamp Duty (≈6% of P)
Ongoing Yearly    = EMI × 12 (for active loan years) + Annual Maintenance
Opportunity Cost  = Down Payment invested at ir% (what you gave up)
```

---

## 3. Renting Path — Step by Step

### Step 1: Initial Investment (Opportunity cost of down payment)
The renter does NOT pay a down payment — they invest it instead:
```
Investment Start = Down Payment Amount  (same as buyer's down payment)
```

### Step 2: Monthly Savings — The "EMI vs Rent" Difference
Every month, the renter pays less than the buyer (EMI > Rent typically). This difference is invested:
```
Monthly Surplus(Year Y) = EMI − Current Monthly Rent(Y)

If surplus > 0  → invest it
If surplus < 0  → renter is paying MORE than buyer (rent has gotten expensive)
```

### Step 3: Rent Growth Each Year
```
Monthly Rent(Year Y) = Initial Rent × (1 + ri/100)^Y
```
**Example:** ₹25,000/month at 5% increase → Year 10 rent = ₹40,722/month

### Step 4: Renter's Investment Portfolio Value at Year Y
Compound growth applied to accumulated investments:
```
Portfolio(Y) = [Portfolio(Y-1) + Annual Surplus(Y)] × (1 + ir/100)
```
Where Annual Surplus(Y) = max(0, Monthly Surplus) × 12

**Example at Year 0:** Portfolio = ₹10L (the down payment invested)
**Year 1:** Surplus = (₹34,726 − ₹25,000) × 12 = ₹1,16,712 added, then compound by 8%

### Step 5: Renting Net Wealth at Year Y
```
Renting Net Wealth(Y) = Portfolio Value(Y)
```
The renter's only wealth is their investment portfolio (they own no property).

---

## 4. Break-Even Year

The year at which Buying Wealth first exceeds Renting Wealth:
```
Break-Even = first Y where Buying Net Wealth(Y) > Renting Net Wealth(Y)
```
- Before break-even: Renting + investing is financially better
- After break-even: Buying has built more total wealth
- If break-even never occurs in time horizon → Renting wins in that period

---

## 5. Verdict Logic

```
Final Wealth Gap = Buying Net Wealth(T) − Renting Net Wealth(T)

If Gap > 0  → "Buying Wins" (buying built more wealth over T years)
If Gap < 0  → "Renting Wins" (renting + investing built more wealth)
```

---

## 6. Key Metrics Shown in Dashboard

| Metric | Formula |
|---|---|
| Monthly EMI | Standard annuity formula (Section 2) |
| Total Interest Paid | EMI × months − Loan Amount |
| Property Value Today | Input (P) |
| Property Value at Year T | P × (1 + a%)^T |
| Equity at Year T | Property Value(T) − Loan Balance(T) |
| Renter Portfolio at T | Compounded investment (Section 3) |
| Wealth Gap | Buying Wealth(T) − Renting Wealth(T) |
| Price-to-Rent Ratio | Annual Rent / Property Price × 100 |
| Rent Yield | Annual Rent / Property Price × 100 (same as above, from landlord POV) |

---

## 7. Common Myths — Debunked by the Math

### ❌ "Paying rent is throwing money away"
Not if you invest the down payment + EMI-rent difference. The renter IS building wealth — just in a portfolio, not in bricks.

### ❌ "Property always appreciates"
At low appreciation rates (2–3%) combined with high EMI costs, renting + equity investing often wins on a 10-year horizon.

### ❌ "The EMI is like paying yourself"
Part of every EMI goes to interest (the bank). In early years, 70–80% of each EMI is pure interest. Only the principal portion builds equity.

### ✅ "It depends on your local market"
Correct. The Price-to-Rent ratio matters:
- P/R < 15: Buying is clearly better
- P/R 15–20: Could go either way
- P/R > 20: Renting likely wins financially (common in Mumbai, Delhi NCR, Bengaluru)

---

## 8. Assumptions & Limitations

1. **EMI is constant** — assumes fixed interest rate for loan tenure
2. **Appreciation is uniform** — real estate appreciation varies by location and cycle
3. **Investment returns are constant** — markets fluctuate; 8–10% is a reasonable long-run CAGR for diversified equity
4. **Tax benefits not modeled** — Section 80C (principal repayment up to ₹1.5L), Section 24 (interest up to ₹2L) can favor buying; consult a CA
5. **No transaction costs on investments** — minor simplification
6. **Rent assumes no brokerage each year** — brokerage (1 month rent) occurs on each new lease
7. **Maintenance is fixed** — real maintenance can spike (water tank, painting, plumbing)

---

## 9. Quick Reference: When Buying Makes Sense

✅ You plan to stay 7+ years in the same city  
✅ Property appreciation > investment return rate in your area  
✅ EMI is close to or less than current rent  
✅ Price-to-Rent ratio < 15  
✅ You value stability and cannot be asked to vacate  
✅ You're in the 30% tax bracket (tax benefits matter more)

## 10. Quick Reference: When Renting Makes Sense

✅ You're likely to relocate within 3–5 years  
✅ Property prices are very high relative to rent (P/R > 20)  
✅ You can invest the down payment + surplus in equity at 10%+ returns  
✅ You're early in your career with uncertain income growth  
✅ City has low appreciation history  

---

*Last updated: April 2026 | For educational purposes. Consult a SEBI-registered financial advisor before major financial decisions.*