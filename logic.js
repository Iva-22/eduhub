
(function (root, factory) {
  if (typeof module === "object" && module.exports) { module.exports = factory(); }
  else { root.WalletLogic = factory(); }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const num = x => Number(x);
  const blank = v => v === undefined || v === null || String(v).trim() === "";
  const money = v => (blank(v) ? NaN : Math.round(Number(v) * 100) / 100);
  const sum = list => list.reduce((total, item) => total + num(item.amount), 0);
  const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s || "")) && !Number.isNaN(Date.parse(s));
  const pad = n => String(n).padStart(2, "0");
  const MAX_AMOUNT = 99999999.99;       

  
  function rand(n) {
    n = Math.round((Number(n) || 0) * 100) / 100;
    const sign = n < 0 ? "-" : "";
    const text = Number.isInteger(Math.abs(n)) ? String(Math.abs(n)) : Math.abs(n).toFixed(2);
    const parts = text.split(".");
    return sign + "R" + parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
  }

  function todayString(d) { d = d || new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function monthKey(d) { return todayString(d).slice(0, 7); }   // "2026-11"

  
  function summarise(data, key) {
    key = key || monthKey();
    const month = data.transactions.filter(t => String(t.trans_date).startsWith(key));
    const income = sum(month.filter(t => t.type === "income"));
    const expenses = sum(month.filter(t => t.type === "expense"));
    const categories = data.categories.map((c, index) => {
      const limit = num(c.monthly_limit);
      const spent = sum(month.filter(t => t.type === "expense" && num(t.category_id) === num(c.category_id)));
      return Object.assign({}, c, {
        index, limit, spent,
        remaining: limit - spent,
        percent: limit > 0 ? Math.round(spent * 100 / limit) : 0,   
        isOver: spent > limit
      });
    });
    return {
      income, expenses, balance: income - expenses,
      saved: data.goals.reduce((total, g) => total + num(g.saved_amount), 0),
      totalLimit: categories.reduce((total, c) => total + c.limit, 0),
      categories
    };
  }

  
  function monthlyTotals(transactions, count) {
    const map = {};
    transactions.forEach(t => {
      const key = String(t.trans_date).slice(0, 7);
      map[key] = map[key] || { month: key, income: 0, expenses: 0 };
      map[key][t.type === "income" ? "income" : "expenses"] += num(t.amount);
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-(count || 6));
  }

  
  function filterTransactions(list, f) {
    f = f || {};
    const q = String(f.search || "").trim().toLowerCase();
    const sorters = {
      "date-desc":   (a, b) => b.trans_date.localeCompare(a.trans_date) || b.transaction_id - a.transaction_id,
      "date-asc":    (a, b) => a.trans_date.localeCompare(b.trans_date) || a.transaction_id - b.transaction_id,
      "amount-desc": (a, b) => num(b.amount) - num(a.amount),
      "amount-asc":  (a, b) => num(a.amount) - num(b.amount)
    };
    return list
      .filter(t =>
        (!q || String(t.note || "").toLowerCase().includes(q)) &&
        (!f.type || f.type === "all" || t.type === f.type) &&
        (!f.categoryId || f.categoryId === "all" || String(t.category_id) === String(f.categoryId)))
      .sort(sorters[f.sort] || sorters["date-desc"]);
  }

  
  function validateTransaction(b) {
    b = b || {};
    const note = String(blank(b.note) ? "" : b.note).trim();
    const amount = money(b.amount);
    if (b.type !== "income" && b.type !== "expense") return { error: "Please choose Income or Expense." };
    if (!note) return { error: "Please enter a description." };
    if (!Number.isFinite(amount)) return { error: "Please enter the amount as a number." };
    if (amount <= 0) return { error: "The amount must be greater than zero." };
    if (amount > MAX_AMOUNT) return { error: "That amount is too large." };
    if (!isDate(b.trans_date)) return { error: "Please choose a valid date." };
    let category_id = null;
    if (b.type === "expense") {                       
      category_id = num(b.category_id);
      if (!Number.isInteger(category_id) || category_id < 1) return { error: "Please choose a category for this expense." };
    }
    return { value: { type: b.type, note: note.slice(0, 150), amount, trans_date: b.trans_date, category_id } };
  }

  function validateCategory(b) {
    b = b || {};
    const name = String(blank(b.name) ? "" : b.name).trim();
    const limit = money(b.monthly_limit);
    if (!name) return { error: "Please enter a category name." };
    if (!Number.isFinite(limit)) return { error: "Please enter the monthly limit as a number." };
    if (limit <= 0) return { error: "The budget must be greater than zero." };        
    if (limit > MAX_AMOUNT) return { error: "That amount is too large." };
    return { value: { name: name.slice(0, 60), monthly_limit: limit } };
  }

  function validateGoal(b) {
    b = b || {};
    const title = String(blank(b.title) ? "" : b.title).trim();
    const target = money(b.target_amount);
    const saved = blank(b.saved_amount) ? 0 : money(b.saved_amount);
    if (!title) return { error: "Please enter a goal name." };
    if (!Number.isFinite(target)) return { error: "Please enter the target amount as a number." };
    if (target <= 0) return { error: "The target amount must be greater than zero." };
    if (!Number.isFinite(saved) || saved < 0) return { error: "The amount saved must be zero or more." };
    if (target > MAX_AMOUNT || saved > MAX_AMOUNT) return { error: "That amount is too large." };
    if (!isDate(b.deadline)) return { error: "Please choose a deadline date." };      
    return { value: {
      title: title.slice(0, 80), target_amount: target, saved_amount: saved, deadline: b.deadline,
      status: saved >= target ? "completed" : "active"                                
    } };
  }

  return { rand, todayString, monthKey, summarise, monthlyTotals, filterTransactions,
           validateTransaction, validateCategory, validateGoal };
});