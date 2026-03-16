import React, { useEffect, useMemo, useState } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = Array.from({ length: 11 }, (_, i) => 2025 + i);

const defaultCategories = {
  "Food stuff": ["Lunch", "Dinner"],
  "Transport": ["Public Transport", "Fuel"],
  "Utilities": ["Electricity", "Water", "ECG", "Bin"],
  "Rent": ["House Rent"],
  "Savings": ["Bank Savings"],
  "Investment": ["Mutual Fund"],
  "Emegencies": ["Emergency Fund"],
  "Toiletries": ["Bathing Soap", "Washing Powder", "Trolls", "Washing Soap", "Toothpaste", "Tooth Brush"],
  "Stationary": ["Chayil", "Clairel", "Mummy", "Daddy"],
  "Wardrobe": ["Chayil", "Clairel", "Mummy", "Daddy"],
  "Parents": ["Mummy's Parents", "Daddy's Parents"],
  "Maintenance": ["House", "Car"],
  "School fees": [],
  "Misc": [],
  "Unplanned": [],
  "Grocries": [],
  "Tithes": [],
  "Offering": [],
};

const incomeSources = ["Salary", "Business", "Gift", "Side Hustle"];
const paymentMethods = ["Cash", "Mobile Money", "Debit Card", "Bank Transfer"];

const categoryColors = {
  "Food stuff": "bg-orange-500",
  "Transport": "bg-sky-500",
  "Utilities": "bg-violet-500",
  "Rent": "bg-rose-500",
  "Savings": "bg-emerald-500",
  "Investment": "bg-indigo-500",
  "Emegencies": "bg-red-500",
  "Toiletries": "bg-pink-500",
  "Stationary": "bg-amber-500",
  "Wardrobe": "bg-fuchsia-500",
  "Parents": "bg-cyan-500",
  "Maintenance": "bg-lime-500",
  "School fees": "bg-blue-600",
  "Misc": "bg-gray-500",
  "Unplanned": "bg-yellow-500",
  "Grocries": "bg-green-600",
  "Tithes": "bg-purple-600",
  "Offering": "bg-teal-500",
};

const categoryType = {
  Savings: "Savings",
  Investment: "Investment",
  Emegencies: "Emergency",
};

const monthKey = (month, year) => `${month} ${year}`;

const seed = {
  appName: "The PUNIs Budget Mobile",
  selectedMonth: "Jan",
  selectedYear: 2026,
  activeTab: "dashboard",
  categories: defaultCategories,
  months: {
    "Jan 2026": {
      incomes: [
        { date: "2026-01-05", source: "Salary", amount: 4200 },
        { date: "2026-01-20", source: "Side Hustle", amount: 650 },
      ],
      expenses: [
        { date: "2026-01-02", category: "Food stuff", subcategory: "Lunch", notes: "Work lunch", amount: 95, method: "Cash" },
        { date: "2026-01-04", category: "Transport", subcategory: "Public Transport", notes: "Commute", amount: 60, method: "Mobile Money" },
        { date: "2026-01-07", category: "Utilities", subcategory: "Electricity", notes: "Prepaid", amount: 220, method: "Mobile Money" },
        { date: "2026-01-10", category: "Savings", subcategory: "Bank Savings", notes: "Monthly transfer", amount: 400, method: "Bank Transfer" },
        { date: "2026-01-12", category: "Investment", subcategory: "Mutual Fund", notes: "Auto-invest", amount: 300, method: "Bank Transfer" },
      ],
    },
  },
};

export default function BudgetTrackerMobileApp() {
  const [app, setApp] = useState(() => {
    try {
      const saved = localStorage.getItem("budget-tracker-mobile-app-v2");
      return saved ? { ...seed, ...JSON.parse(saved) } : seed;
    } catch {
      return seed;
    }
  });
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState("Food stuff");
  const [newSubcategory, setNewSubcategory] = useState("");

  useEffect(() => {
    localStorage.setItem("budget-tracker-mobile-app-v2", JSON.stringify(app));
  }, [app]);

  const selectedKey = monthKey(app.selectedMonth, app.selectedYear);
  const currentMonth = app.months[selectedKey] || { incomes: [], expenses: [] };
  const categories = app.categories || defaultCategories;
  const categoryNames = Object.keys(categories);

  useEffect(() => {
    setApp((prev) => ({
      ...prev,
      months: {
        ...prev.months,
        [selectedKey]: prev.months[selectedKey] || { incomes: [], expenses: [] },
      },
    }));
  }, [selectedKey]);

  useEffect(() => {
    if (!categories[selectedCategoryForSub]) {
      setSelectedCategoryForSub(categoryNames[0] || "");
    }
  }, [selectedCategoryForSub, categoryNames.join("|")]);

  const totals = useMemo(() => {
    const totalIncome = currentMonth.incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpense = currentMonth.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const savingsBucket = currentMonth.expenses
      .filter((item) => ["Savings", "Investment", "Emegencies"].includes(item.category))
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
      income: totalIncome,
      expense: totalExpense,
      net: totalIncome - totalExpense,
      savingsRate: totalIncome ? savingsBucket / totalIncome : 0,
    };
  }, [currentMonth]);

  const byCategory = useMemo(() => {
    const map = {};
    currentMonth.expenses.forEach((item) => {
      if (!item.category) return;
      map[item.category] = (map[item.category] || 0) + Number(item.amount || 0);
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category,
        amount,
        expensePct: totals.expense ? amount / totals.expense : 0,
        incomePct: totals.income ? amount / totals.income : 0,
        type: categoryType[category] || "Normal",
      }));
  }, [currentMonth, totals.expense, totals.income]);

  const annualData = useMemo(() => {
    return MONTHS.map((month) => {
      const key = monthKey(month, app.selectedYear);
      const data = app.months[key] || { incomes: [], expenses: [] };
      const income = data.incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const expense = data.expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      return { month, income, expense, net: income - expense };
    });
  }, [app.months, app.selectedYear]);

  const annualCategoryTotals = useMemo(() => {
    const map = {};
    MONTHS.forEach((month) => {
      const key = monthKey(month, app.selectedYear);
      const data = app.months[key] || { expenses: [] };
      data.expenses.forEach((item) => {
        if (!item.category) return;
        map[item.category] = (map[item.category] || 0) + Number(item.amount || 0);
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [app.months, app.selectedYear]);

  const investmentAccounts = useMemo(() => {
    const types = ["Savings", "Emergency", "Investment"];
    const grouped = [];

    types.forEach((type) => {
      const categoryName = type === "Emergency" ? "Emegencies" : type;
      const accountMap = {};

      MONTHS.forEach((month) => {
        const key = monthKey(month, app.selectedYear);
        const data = app.months[key] || { expenses: [] };
        data.expenses.forEach((item) => {
          if (item.category === categoryName && item.subcategory) {
            accountMap[item.subcategory] = (accountMap[item.subcategory] || 0) + Number(item.amount || 0);
          }
        });
      });

      Object.entries(accountMap).forEach(([account, amount]) => {
        grouped.push({ account, type, amount });
      });
    });

    return grouped;
  }, [app.months, app.selectedYear]);

  const addIncome = () => {
    setApp((prev) => ({
      ...prev,
      months: {
        ...prev.months,
        [selectedKey]: {
          ...currentMonth,
          incomes: [...currentMonth.incomes, { date: "", source: "", amount: "" }],
        },
      },
    }));
  };

  const addExpense = () => {
    setApp((prev) => ({
      ...prev,
      months: {
        ...prev.months,
        [selectedKey]: {
          ...currentMonth,
          expenses: [...currentMonth.expenses, { date: "", category: "", subcategory: "", notes: "", amount: "", method: "" }],
        },
      },
    }));
  };

  const updateIncome = (index, field, value) => {
    const next = [...currentMonth.incomes];
    next[index] = { ...next[index], [field]: field === "amount" ? Number(value || 0) : value };
    setApp((prev) => ({
      ...prev,
      months: { ...prev.months, [selectedKey]: { ...currentMonth, incomes: next } },
    }));
  };

  const updateExpense = (index, field, value) => {
    const next = [...currentMonth.expenses];
    const updated = { ...next[index], [field]: field === "amount" ? Number(value || 0) : value };
    if (field === "category") updated.subcategory = "";
    next[index] = updated;
    setApp((prev) => ({
      ...prev,
      months: { ...prev.months, [selectedKey]: { ...currentMonth, expenses: next } },
    }));
  };

  const addCategory = () => {
    const name = newCategory.trim();
    if (!name || categories[name]) return;
    setApp((prev) => ({
      ...prev,
      categories: { ...prev.categories, [name]: [] },
    }));
    setSelectedCategoryForSub(name);
    setNewCategory("");
  };

  const addSubcategory = () => {
    const name = newSubcategory.trim();
    if (!name || !selectedCategoryForSub) return;
    setApp((prev) => {
      const existing = prev.categories[selectedCategoryForSub] || [];
      if (existing.includes(name)) return prev;
      return {
        ...prev,
        categories: {
          ...prev.categories,
          [selectedCategoryForSub]: [...existing, name],
        },
      };
    });
    setNewSubcategory("");
  };

  const currency = (value) => `₵ ${Number(value || 0).toLocaleString()}`;
  const pct = (value) => `${(Number(value || 0) * 100).toFixed(1)}%`;

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "monthly", label: "Month" },
    { id: "annual", label: "Annual" },
    { id: "investments", label: "Invest" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-md px-4 pb-24 pt-4">
        <div className="mb-4 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-5 shadow-2xl">
          <div className="text-xs uppercase tracking-[0.25em] text-white/80">Budget App</div>
          <div className="mt-2 text-2xl font-bold">{app.appName}</div>
          <div className="mt-1 text-sm text-white/80">A colourful finance dashboard with editable categories and subcategories built right into the app.</div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <select className="rounded-2xl border border-white/20 bg-white/15 px-3 py-2 text-sm text-white outline-none" value={app.selectedMonth} onChange={(e) => setApp((prev) => ({ ...prev, selectedMonth: e.target.value }))}>
              {MONTHS.map((month) => <option key={month} value={month} className="text-slate-900">{month}</option>)}
            </select>
            <select className="rounded-2xl border border-white/20 bg-white/15 px-3 py-2 text-sm text-white outline-none" value={app.selectedYear} onChange={(e) => setApp((prev) => ({ ...prev, selectedYear: Number(e.target.value) }))}>
              {YEARS.map((year) => <option key={year} value={year} className="text-slate-900">{year}</option>)}
            </select>
          </div>
        </div>

        {app.activeTab === "dashboard" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card title="Income" value={currency(totals.income)} tone="emerald" />
              <Card title="Expenses" value={currency(totals.expense)} tone="rose" />
              <Card title="Net Balance" value={currency(totals.net)} tone="sky" />
              <Card title="Savings Rate" value={pct(totals.savingsRate)} tone="violet" />
            </div>
            <Panel title={`Top Categories • ${selectedKey}`}>
              <div className="space-y-3">
                {byCategory.length === 0 && <Empty message="No expenses yet for this month." />}
                {byCategory.slice(0, 5).map((item) => (
                  <div key={item.category}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <div className="font-medium">{item.category}</div>
                      <div className="text-slate-300">{currency(item.amount)}</div>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div className={`h-2 rounded-full ${categoryColors[item.category] || "bg-slate-400"}`} style={{ width: `${Math.max(6, item.expensePct * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {app.activeTab === "monthly" && (
          <div className="space-y-4">
            <Panel title={`Income • ${selectedKey}`} action={<button onClick={addIncome} className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold">+ Add</button>}>
              <div className="space-y-3">
                {currentMonth.incomes.length === 0 && <Empty message="No income entries yet." />}
                {currentMonth.incomes.map((row, index) => (
                  <div key={index} className="rounded-2xl bg-slate-900/80 p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="Date" type="date" value={row.date} onChange={(value) => updateIncome(index, "date", value)} />
                      <Select label="Source" value={row.source} onChange={(value) => updateIncome(index, "source", value)} options={incomeSources} />
                    </div>
                    <div className="mt-2">
                      <Input label="Amount (₵ GHS)" type="number" value={row.amount} onChange={(value) => updateIncome(index, "amount", value)} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title={`Expenses • ${selectedKey}`} action={<button onClick={addExpense} className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold">+ Add</button>}>
              <div className="space-y-3">
                {currentMonth.expenses.length === 0 && <Empty message="No expense entries yet." />}
                {currentMonth.expenses.map((row, index) => (
                  <div key={index} className="rounded-2xl bg-slate-900/80 p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="Date" type="date" value={row.date} onChange={(value) => updateExpense(index, "date", value)} />
                      <Select label="Category" value={row.category} onChange={(value) => updateExpense(index, "category", value)} options={categoryNames} />
                      <Select label="Subcategory" value={row.subcategory} onChange={(value) => updateExpense(index, "subcategory", value)} options={categories[row.category] || []} />
                      <Select label="Method" value={row.method} onChange={(value) => updateExpense(index, "method", value)} options={paymentMethods} />
                    </div>
                    <div className="mt-2 grid gap-2">
                      <Input label="Notes" value={row.notes} onChange={(value) => updateExpense(index, "notes", value)} />
                      <Input label="Amount (₵ GHS)" type="number" value={row.amount} onChange={(value) => updateExpense(index, "amount", value)} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {app.activeTab === "annual" && (
          <div className="space-y-4">
            <Panel title={`Annual Summary • ${app.selectedYear}`}>
              <div className="space-y-3">
                {annualData.map((item) => (
                  <div key={item.month} className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-3 py-3 text-sm">
                    <div className="font-medium">{item.month}</div>
                    <div className="text-slate-300">{currency(item.income)} / {currency(item.expense)}</div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Annual Category Totals">
              <div className="space-y-3">
                {annualCategoryTotals.map(([category, amount]) => (
                  <div key={category}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{category}</span>
                      <span>{currency(amount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div className={`h-2 rounded-full ${categoryColors[category] || "bg-slate-400"}`} style={{ width: `${Math.max(6, (amount / Math.max(1, annualCategoryTotals[0]?.[1] || 1)) * 100)}%` }} />
                    </div>
                  </div>
                ))}
                {annualCategoryTotals.length === 0 && <Empty message="No annual expense data yet." />}
              </div>
            </Panel>
          </div>
        )}

        {app.activeTab === "investments" && (
          <div className="space-y-4">
            <Panel title={`Investments • ${app.selectedYear}`}>
              <div className="space-y-3">
                {investmentAccounts.length === 0 && <Empty message="No savings, emergency, or investment contributions yet." />}
                {investmentAccounts.map((row, index) => (
                  <div key={`${row.account}-${index}`} className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-4 py-3">
                    <div>
                      <div className="font-medium">{row.account}</div>
                      <div className="text-xs text-slate-400">{row.type}</div>
                    </div>
                    <div className="text-sm font-semibold text-emerald-300">{currency(row.amount)}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}

        {app.activeTab === "settings" && (
          <div className="space-y-4">
            <Panel title="Add New Category">
              <div className="grid gap-3">
                <Input label="Category name" value={newCategory} onChange={setNewCategory} />
                <button onClick={addCategory} className="rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950">Add Category</button>
              </div>
            </Panel>
            <Panel title="Add New Subcategory">
              <div className="grid gap-3">
                <Select label="Choose category" value={selectedCategoryForSub} onChange={setSelectedCategoryForSub} options={categoryNames} />
                <Input label="Subcategory name" value={newSubcategory} onChange={setNewSubcategory} />
                <button onClick={addSubcategory} className="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950">Add Subcategory</button>
              </div>
            </Panel>
            <Panel title="Categories & Subcategories">
              <div className="space-y-3">
                {Object.entries(categories).map(([category, subcategories]) => (
                  <div key={category} className="rounded-2xl bg-slate-900/80 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`inline-block h-3 w-3 rounded-full ${categoryColors[category] || "bg-slate-400"}`} />
                      <span className="font-medium">{category}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {subcategories.length > 0 ? subcategories.map((subcategory) => (
                        <span key={subcategory} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{subcategory}</span>
                      )) : <span className="text-xs text-slate-500">No subcategories</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1 px-2 py-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setApp((prev) => ({ ...prev, activeTab: tab.id }))} className={`rounded-2xl px-2 py-3 text-[11px] font-medium ${app.activeTab === tab.id ? "bg-emerald-500 text-slate-950" : "text-slate-400"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, tone }) {
  const tones = {
    emerald: "from-emerald-500/30 to-emerald-400/10 border-emerald-400/30",
    rose: "from-rose-500/30 to-rose-400/10 border-rose-400/30",
    sky: "from-sky-500/30 to-sky-400/10 border-sky-400/30",
    violet: "from-violet-500/30 to-violet-400/10 border-violet-400/30",
  };
  return (
    <div className={`rounded-3xl border bg-gradient-to-br p-4 shadow-xl ${tones[tone]}`}>
      <div className="text-xs uppercase tracking-wide text-slate-300">{title}</div>
      <div className="mt-2 text-lg font-bold text-white">{value}</div>
    </div>
  );
}

function Panel({ title, action, children }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-base font-semibold">{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Empty({ message }) {
  return <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-400">{message}</div>;
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-slate-400">{label}</div>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none" />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-slate-400">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none">
        <option value="">Select</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function MiniBarChart({ labelA, valueA, labelB, valueB }) {
  const max = Math.max(valueA, valueB, 1);
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="mb-2 text-xs text-slate-400">{labelA}</div>
        <div className="flex h-28 items-end rounded-2xl bg-slate-950 p-3">
          <div className="w-full rounded-2xl bg-emerald-500" style={{ height: `${(valueA / max) * 100}%` }} />
        </div>
      </div>
      <div>
        <div className="mb-2 text-xs text-slate-400">{labelB}</div>
        <div className="flex h-28 items-end rounded-2xl bg-slate-950 p-3">
          <div className="w-full rounded-2xl bg-rose-500" style={{ height: `${(valueB / max) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function DonutLegend({ rows, categoryColors, currency }) {
  return (
    <div className="space-y-2">
      {rows.length === 0 && <Empty message="No category chart data yet." />}
      {rows.map((item) => (
        <div key={item.category} className="flex items-center justify-between rounded-2xl bg-slate-950 px-3 py-2 text-sm">
          <div className="flex items-center gap-2">
            <span className={`inline-block h-3 w-3 rounded-full ${categoryColors[item.category] || "bg-slate-400"}`} />
            <span>{item.category}</span>
          </div>
          <span className="text-slate-300">{currency(item.amount)}</span>
        </div>
      ))}
    </div>
  );
}
