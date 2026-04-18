# Rental yield calculator — complete reference

A thorough guide to every formula, input, output, and design decision in the rental yield calculator. Written so that anyone — with or without a finance background — can follow exactly how each number is produced.

---

## What is rental yield?

Rental yield is the annual return on a property investment expressed as a percentage of the purchase price. It answers a simple question:

> "For every ₹100 I invest in this property, how many rupees do I earn per year from rent?"

A 5% yield means ₹5 earned per year for every ₹100 invested. The higher the yield, the more efficiently your money is working.

There are two forms:

| Form | What it measures |
|---|---|
| Gross yield | Return before any costs are deducted |
| Net yield | Return after all operational costs — the realistic figure |

Always use **net yield** when making investment decisions.

---

## Inputs

| Input | Description | What to include |
|---|---|---|
| Purchase price | Total cost to acquire the property | Property price + stamp duty + registration + legal fees |
| Monthly rent | Rent you expect to collect each month | Use achievable market rent, not asking rent |
| Monthly operational costs | All recurring expenses per month | Maintenance, property tax, insurance, society charges, vacancy buffer, management fees |

> **Tip:** Be conservative with rent and generous with costs. Optimistic inputs produce misleadingly high yields.

---

## Formulas — step by step

### Step 1 — Annual gross income

This is the total rent collected in a year before any deductions.

```
Annual gross income = Monthly rent × 12
```

**Example:**
```
₹35,000 × 12 = ₹4,20,000
```

---

### Step 2 — Annual operational costs

The total cost of running the property for a year.

```
Annual operational costs = Monthly costs × 12
```

**Example:**
```
₹1,000 × 12 = ₹12,000
```

---

### Step 3 — Annual net income

What you actually take home after paying all costs.

```
Annual net income = Annual gross income − Annual operational costs
```

**Example:**
```
₹4,20,000 − ₹12,000 = ₹4,08,000
```

---

### Step 4 — Gross yield

The raw percentage return based on rent alone, ignoring costs.

```
Gross yield (%) = (Annual gross income ÷ Purchase price) × 100
```

**Example:**
```
(₹4,20,000 ÷ ₹1,00,00,000) × 100 = 4.20%
```

**Use case:** Quick comparison between properties when you don't yet know the cost structure of each.

---

### Step 5 — Net yield

The true percentage return after all costs. This is the number that matters.

```
Net yield (%) = (Annual net income ÷ Purchase price) × 100
```

**Example:**
```
(₹4,08,000 ÷ ₹1,00,00,000) × 100 = 4.08%
```

**Use case:** Every investment decision. Net yield is the only honest measure of what a property earns you.

---

### Step 6 — Payback period

How many years of rental income it takes to fully recover the purchase price.

```
Payback period = Purchase price ÷ Annual net income
```

**Example:**
```
₹1,00,00,000 ÷ ₹4,08,000 = 24.51 years → 24 years 6 months
```

**Important caveat:** This assumes rent and costs stay flat forever — which they won't. Rents in India typically rise 5–10% every 2–3 years. The adjusted payback estimate (70–80% of raw payback) accounts for this.

```
Adjusted payback = Payback period × 0.70 to 0.80
```

**Example:**
```
24.51 × 0.70 = 17.2 years
24.51 × 0.80 = 19.6 years
→ Adjusted estimate: 17–20 years
```

---

### Step 7 — Estimated total return

Rental income is only part of the return. Indian residential property also appreciates over time. The calculator assumes long-run appreciation of 6–8% per year (based on historical averages for metro and tier-1 markets).

```
Estimated total return = Net yield + 6% to 8%
```

**Example:**
```
4.08% + 6% to 8% = 10.08% to 12.08%
→ Estimated total return: 10–12%
```

> **Note:** This is a projection, not a guarantee. Actual appreciation varies significantly by city, locality, developer, and market cycle.

---

## Yield tiers

| Net yield | Category | Risk level | Stars | What it means |
|---|---|---|---|---|
| Below 2% | Poor | High | ★☆☆☆☆ | Returns less than a fixed deposit. Reconsider the investment unless strong appreciation is expected. |
| 2% – 4% | Average | Medium | ★★☆☆☆ | Modest income return. May be acceptable if the location has strong capital growth potential. |
| 4% – 6% | Good | Low | ★★★★☆ | Healthy yield above most debt instruments. Solid investment with reasonable income and growth mix. |
| 6% and above | Excellent | Low | ★★★★★ | High income-generating property. Strong case for investment. |

---

## Risk levels explained

| Risk level | What it means |
|---|---|
| High | Low rental income leaves almost no buffer for vacancies, repairs, or unexpected costs. Even short gaps hurt badly. |
| Medium | Thin but adequate margin. Sensitive to rent gaps, cost spikes, or interest rate changes if leveraged. |
| Low | Sufficient income to absorb disruptions (vacancies, maintenance, repairs) and still deliver positive returns. |

---

## The yield spectrum visual

The spectrum bar maps 0% to 8%+ yield across four color zones:

| Zone | Color | Range |
|---|---|---|
| Red zone | Poor | 0–2% |
| Amber zone | Average | 2–4% |
| Green zone | Good | 4–6% |
| Teal zone | Excellent | 6%+ |

The cursor shows where your current net yield sits on this spectrum.

---

## Full worked example

**Inputs:**

| Field | Value |
|---|---|
| Purchase price | ₹1,00,00,000 |
| Monthly rent | ₹35,000 |
| Monthly operational costs | ₹1,000 |

**Calculations:**

| Step | Formula | Result |
|---|---|---|
| Annual gross income | ₹35,000 × 12 | ₹4,20,000 |
| Annual operational costs | ₹1,000 × 12 | ₹12,000 |
| Annual net income | ₹4,20,000 − ₹12,000 | ₹4,08,000 |
| Gross yield | (₹4,20,000 ÷ ₹1,00,00,000) × 100 | **4.20%** |
| Net yield | (₹4,08,000 ÷ ₹1,00,00,000) × 100 | **4.08%** |
| Payback period | ₹1,00,00,000 ÷ ₹4,08,000 | **24y 6m** |
| Adjusted payback | 24.51 × 0.70–0.80 | **17–20 years** |
| Estimated total return | 4.08% + 6–8% | **10–12%** |
| Tier | 4–6% range | **Good** |
| Risk | — | **Low** |
| Rating | — | **★★★★☆ (4/5)** |

---

## Common mistakes to avoid

**Using asking rent instead of market rent**
Asking rent is aspirational. Use current comparable rents for similar properties in the same locality. Overestimating rent inflates yield significantly.

**Ignoring operational costs**
A property with zero maintenance budget on paper will have high gross yield but collapse to a much lower (or negative) net yield once real costs hit. Always include: property tax, society charges, insurance, estimated vacancy periods, repair reserve.

**Excluding transaction costs from purchase price**
Stamp duty, registration, legal fees, and brokerage can add 7–10% to the effective purchase price in India. Omitting them overstates yield.

**Comparing gross yields across properties**
Different properties have very different cost structures. Always compare net yields.

**Treating the payback period as a fixed timeline**
Rent grows, costs change, markets shift. The payback period is a reference benchmark, not a fixed schedule.

---

## Glossary

| Term | Definition |
|---|---|
| Gross yield | Annual rent as a % of purchase price, before costs |
| Net yield | Annual profit as a % of purchase price, after costs |
| Payback period | Years of rental income needed to recover the full purchase price |
| Capital appreciation | Increase in the property's market value over time |
| Total return | Net yield plus capital appreciation — the full picture of investment performance |
| Operational costs | All recurring costs of maintaining and managing a rental property |
| Vacancy buffer | A cost allowance for periods when the property is unoccupied between tenants |

---

*For the Indian residential property market. All projected figures (appreciation, total return) are estimates based on historical averages and should not be treated as financial advice. Consult a qualified financial advisor before making investment decisions.*