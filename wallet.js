
(function () {
  "use strict";

  const L = window.WalletLogic;                       
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

 
  const state = {
    data: { categories: [], transactions: [], goals: [] },
    editing: { transaction: null, category: null, goal: null }
  };

  
  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function option(value, text) { const o = el("option", null, text); o.value = value; return o; }
  function button(label, className, onClick, aria) {
    const b = el("button", className, label);
    b.type = "button";
    if (aria) b.setAttribute("aria-label", aria);
    b.addEventListener("click", onClick);
    return b;
  }
  function actionRow(name, onEdit, onDelete) {
    const row = el("div", "card-actions");
    row.append(button("Edit", "btn-mini", onEdit, "Edit " + name),
               button("Delete", "btn-mini danger", onDelete, "Delete " + name));
    return row;
  }
  function progressBar(percent, fillClass, label) {
    const bar = el("div", "progress-bar");
    const fill = el("div", "progress-fill " + fillClass);
    fill.style.width = Math.min(Math.max(percent, 0), 100) + "%";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-label", label);
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-valuenow", Math.min(percent, 100));
    bar.append(fill);
    return bar;
  }

  
  let messageTimer;
  function showMessage(text, type) {                  
    const box = $("#message");
    box.textContent = text;
    box.className = "message " + type;
    box.hidden = false;
    clearTimeout(messageTimer);
    if (type === "success") messageTimer = setTimeout(() => { box.hidden = true; }, 5000);
  }
  function showFormError(id, text) { const p = document.getElementById(id); p.textContent = text; p.hidden = false; }
  function hideFormError(id) { document.getElementById(id).hidden = true; }

  
  async function request(method, url, body) {
    let res;
    try {
      res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });
    } catch (err) {                                   
      throw new Error("Cannot connect to the server. Please make sure it is running (npm start) and try again.");
    }
    let payload = null;
    try { payload = await res.json(); } catch (err) { /* no JSON body */ }
    if (!res.ok) throw new Error((payload && payload.error) || "Something went wrong (error " + res.status + ").");
    return payload;
  }

  
  async function loadWallet() {
    try {
      state.data = await request("GET", "/api/wallet");
      render();
    } catch (err) {
      showMessage(err.message, "error");
    }
  }

  
  async function remove(url, question) {
    if (!window.confirm(question)) return;
    try {
      const r = await request("DELETE", url);
      showMessage(r.message, "success");
      await loadWallet();
    } catch (err) {
      showMessage(err.message, "error");
    }
  }

  
  async function save(errorId, editingItem, base, id, value, successText) {
    try {
      const r = await request(editingItem ? "PUT" : "POST", editingItem ? base + "/" + id : base, value);
      closeModals();
      showPage("wallet");
      showMessage(successText || r.message, "success");
      await loadWallet();
    } catch (err) {
      showFormError(errorId, err.message);
    }
  }

  
  function showPage(name) {
    $("#wallet-page").classList.toggle("show", name === "wallet");
    $("#home-page").classList.toggle("hide", name === "wallet");
    window.scrollTo(0, 0);
  }
  function switchTab(name) {
    $$(".top-nav a").forEach(a => a.classList.toggle("active", a.dataset.tab === name));
    $$(".tab-panel").forEach(p => { p.hidden = p.id !== "tab-" + name; });
  }
  function openModal(id) {
    const modal = document.getElementById(id);
    modal.classList.add("open");
    const first = modal.querySelector("input:not([type=radio]), select");
    if (first) first.focus();
  }
  function closeModals() { $$(".modal-overlay").forEach(m => m.classList.remove("open")); }

  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModals(); });

  // One click handler for every link/button marked with data-open / data-show / data-close / data-tab
    document.addEventListener("click", e => {
    const a = e.target.closest("[data-open], [data-show], [data-close], [data-tab], [data-goto]");
    if (!a) return;
    e.preventDefault();
    if (a.dataset.close !== undefined) return closeModals();
    if (a.dataset.show) return showPage(a.dataset.show);
    if (a.dataset.tab) return switchTab(a.dataset.tab);
    if (a.dataset.goto) {
      // Home-page cards: jump straight to a tab. "Track Expenses" shows expenses only.
      if (a.dataset.goto === "spending") { $("#filter-type").value = "expense"; renderSpending(); }
      showPage("wallet");
      return switchTab(a.dataset.goto);
    }
	
    if (a.dataset.open === "transaction-modal") return openTransactionModal(null);
    if (a.dataset.open === "category-modal") return openCategoryModal(null);
    if (a.dataset.open === "goal-modal") return openGoalModal(null);
  });

  
  const FILL_CLASSES = ["fill-green", "fill-teal", "fill-blue"];
  const ICON_CLASSES = ["icon-green", "icon-orange", "icon-blue"];
  function iconFor(name) {
    const n = name.toLowerCase();
    if (n.includes("food")) return "🍴";
    if (n.includes("educ")) return "📘";
    if (n.includes("data") || n.includes("airtime")) return "📶";
    if (n.includes("transport")) return "🚗";
    if (n.includes("accom")) return "🏠";
    if (n.includes("personal")) return "🛍️";
    return "💼";
  }

  function render() {
    fillCategorySelects();
    renderOverview();
    renderGoals();
    renderSpending();
    renderTrends();
  }

  function fillCategorySelects() {
    const cats = state.data.categories;
    const tx = $("#trans-category");
    tx.replaceChildren(...cats.map(c => option(c.category_id, c.name)));

    const filter = $("#filter-category");
    const keep = filter.value || "all";
    filter.replaceChildren(option("all", "All categories"), ...cats.map(c => option(c.category_id, c.name)));
    filter.value = Array.from(filter.options).some(o => o.value === keep) ? keep : "all";
  }

  function renderOverview() {
    const s = L.summarise(state.data);
    $(".db-balance").textContent = L.rand(s.balance);
    $(".db-balance").classList.toggle("negative", s.balance < 0);
    $(".db-savings").textContent = L.rand(s.saved);
    $("#income").textContent = L.rand(s.income);
    $("#expenses").textContent = L.rand(s.expenses);

    
    const alerts = $("#alerts");
    alerts.replaceChildren();
    if (s.totalLimit > 0 && s.expenses > s.totalLimit) {
      const box = el("div", "alert-box");
      box.append(el("strong", null, "Over Budget"), el("p", null, "Your total spending has exceeded the monthly budget."));
      alerts.append(box);
    }
    s.categories.filter(c => c.isOver).forEach(c => {
      const box = el("div", "alert-box");
      box.append(el("strong", null, "Over Budget"),
                 el("p", null, c.name + " has exceeded the budget limit by " + L.rand(-c.remaining) + "."));
      alerts.append(box);
    });

    
    const grid = $("#categories");
    grid.replaceChildren();
    if (!s.categories.length) grid.append(el("p", "empty", "No categories yet. Click \"Add Category +\" to create one."));
    s.categories.forEach(c => {
      const card = el("div", "category-card" + (c.isOver ? " over-budget-border" : ""));
      const title = el("div", "category-title");
      title.append(c.name, el("span", c.isOver ? "icon-red" : ICON_CLASSES[c.index % 3], iconFor(c.name)));
      const usage = el("div", "category-usage", c.percent + "% Used");
      const bar = progressBar(c.percent, c.isOver ? "fill-red" : FILL_CLASSES[c.index % 3], c.name + " budget used");
      const foot = el("div", "category-footer");
      const left = el("span");
      left.append(el("strong", null, L.rand(c.spent)), " of " + L.rand(c.limit));
      foot.append(left, c.isOver ? el("span", "text-red", L.rand(-c.remaining) + " Over")
                                 : el("span", "text-muted", L.rand(c.remaining) + " remaining"));
      card.append(title, usage, bar, foot, actionRow(c.name,
        () => openCategoryModal(c),
        () => remove("/api/categories/" + c.category_id, "Delete the category \"" + c.name + "\"?")));
      grid.append(card);
    });
  }

  function renderGoals() {
    const box = $("#goals");
    box.replaceChildren();
    if (!state.data.goals.length) { box.append(el("p", "empty", "No savings goals yet. Click \"Add Goal +\" to create one.")); return; }
    state.data.goals.forEach(g => {
      const target = Number(g.target_amount), saved = Number(g.saved_amount);
      const percent = target > 0 ? Math.round(saved * 100 / target) : 0;
      const done = g.status === "completed";
      const card = el("div", "category-card" + (done ? " goal-done" : ""));
      const title = el("div", "category-title");
      title.append(g.title, el("span", done ? "icon-green" : "icon-blue", done ? "✅" : "🎯"));
      const usage = el("div", "category-usage", Math.min(percent, 100) + "% saved · due " + g.deadline + (done ? " · Completed" : ""));
      const foot = el("div", "category-footer");
      const left = el("span");
      left.append(el("strong", null, L.rand(saved)), " of " + L.rand(target));
      foot.append(left);
      card.append(title, usage, progressBar(percent, done ? "fill-green" : "fill-blue", g.title + " progress"), foot,
        actionRow(g.title,
          () => openGoalModal(g),
          () => remove("/api/goals/" + g.goal_id, "Delete the goal \"" + g.title + "\"?")));
      box.append(card);
    });
  }

  function renderSpending() {
    const names = new Map(state.data.categories.map(c => [Number(c.category_id), c.name]));
    const rows = L.filterTransactions(state.data.transactions, {
      search: $("#filter-search").value,
      type: $("#filter-type").value,
      categoryId: $("#filter-category").value,
      sort: $("#filter-sort").value
    });
    const body = $("#tx-body");
    body.replaceChildren();
    rows.forEach(t => {
      const tr = el("tr");
      const cell = (text, cls) => { const td = el("td", cls, text); tr.append(td); return td; };
      cell(t.trans_date);
      cell(t.note || "");
      cell(t.type === "income" ? "—" : (names.get(Number(t.category_id)) || "Unknown"));
      cell("").append(el("span", "badge " + t.type, t.type === "income" ? "Income" : "Expense"));
      cell((t.type === "income" ? "+" : "-") + L.rand(t.amount), t.type === "income" ? "amount-in" : "amount-out");
      cell("").append(actionRow(t.note || "transaction",
        () => openTransactionModal(t),
        () => remove("/api/transactions/" + t.transaction_id,
          "Delete \"" + (t.note || "this transaction") + "\" (" + L.rand(t.amount) + ")? This cannot be undone.")));
      body.append(tr);
    });
    $("#tx-count").textContent = "Showing " + rows.length + " of " + state.data.transactions.length + " transactions";
    $("#tx-empty").hidden = rows.length > 0;
  }

  ["input", "change"].forEach(evt =>
    ["#filter-search", "#filter-type", "#filter-category", "#filter-sort"].forEach(id =>
      $(id).addEventListener(evt, renderSpending)));
  $("#filter-reset").addEventListener("click", () => {
    $("#filter-search").value = "";
    $("#filter-type").value = "all";
    $("#filter-category").value = "all";
    $("#filter-sort").value = "date-desc";
    renderSpending();
  });

  
  function drawBars(box, rows) {
    box.replaceChildren();
    if (!rows.length) { box.append(el("p", "empty", "No data yet.")); return; }
    const max = Math.max(1, ...rows.flatMap(r => r.values.map(v => v.value)));
    rows.forEach(r => {
      const row = el("div", "chart-row");
      row.append(el("span", "chart-label", r.label));
      const bars = el("div", "chart-bars");
      r.values.forEach(v => {
        const line = el("div", "chart-line");
        const bar = el("div", "chart-bar " + v.cls);
        bar.style.width = (v.value / max * 100) + "%";
        line.append(bar, el("span", "chart-value", v.prefix + L.rand(v.value)));
        bars.append(line);
      });
      row.append(bars);
      box.append(row);
    });
  }

  function renderTrends() {
    const s = L.summarise(state.data);
    drawBars($("#chart-categories"), s.categories.map(c => ({
      label: c.name, values: [{ value: c.spent, cls: c.isOver ? "bar-red" : "bar-primary", prefix: "" }]
    })));
    drawBars($("#chart-months"), L.monthlyTotals(state.data.transactions, 6).map(m => ({
      label: new Date(m.month + "-01").toLocaleDateString("en-ZA", { month: "short", year: "numeric" }),
      values: [{ value: m.income, cls: "bar-green", prefix: "Income " }, { value: m.expenses, cls: "bar-red", prefix: "Expenses " }]
    })));
  }

	
  function syncTypeFields() {
    $("#trans-category-group").hidden = document.querySelector('input[name="type"]:checked').value === "income";
  }
  $$('input[name="type"]').forEach(r => r.addEventListener("change", syncTypeFields));

  function openTransactionModal(tx) {
    state.editing.transaction = tx;
    $("#transaction-heading").textContent = tx ? "Edit Transaction" : "Add New Transaction";
    $("#transaction-submit").textContent = tx ? "Save Changes" : "Add Transaction";
    hideFormError("transaction-error");
    $("#type-" + (tx ? tx.type : "expense")).checked = true;
    $("#trans-desc").value = tx ? (tx.note || "") : "";
    $("#trans-amount").value = tx ? Number(tx.amount) : "";
    $("#trans-date").value = tx ? tx.trans_date : L.todayString();
    if (tx && tx.category_id) $("#trans-category").value = String(tx.category_id);
    syncTypeFields();
    openModal("transaction-modal");
  }

  $("#transaction-form").addEventListener("submit", e => {
    e.preventDefault();
    const v = L.validateTransaction({
      type: document.querySelector('input[name="type"]:checked').value,
      note: $("#trans-desc").value,
      amount: $("#trans-amount").value,
      category_id: $("#trans-category").value,
      trans_date: $("#trans-date").value
    });
    if (v.error) return showFormError("transaction-error", v.error);          

    
    const thisMonth = L.monthKey();
    if (v.value.type === "expense" && v.value.trans_date.startsWith(thisMonth)) {
      let available = L.summarise(state.data).balance;
      const old = state.editing.transaction;
      if (old && old.type === "expense" && String(old.trans_date).startsWith(thisMonth)) available += Number(old.amount);
      if (v.value.amount > available && !window.confirm(
        "This expense (" + L.rand(v.value.amount) + ") is more than your available balance (" + L.rand(available) + "). Save it anyway?")) return;
    }
    const old = state.editing.transaction;
    save("transaction-error", old, "/api/transactions", old && old.transaction_id, v.value);
  });

  
  function openCategoryModal(cat) {
    state.editing.category = cat;
    $("#category-heading").textContent = cat ? "Edit Budget Category" : "Add Budget Category";
    $("#category-submit").textContent = cat ? "Save Changes" : "Add Category";
    hideFormError("category-error");
    $("#cat-name").value = cat ? cat.name : "";
    $("#cat-amount").value = cat ? Number(cat.monthly_limit) : "";
    openModal("category-modal");
  }

  $("#category-form").addEventListener("submit", e => {
    e.preventDefault();
    const v = L.validateCategory({ name: $("#cat-name").value, monthly_limit: $("#cat-amount").value });
    if (v.error) return showFormError("category-error", v.error);
    const old = state.editing.category;
    save("category-error", old, "/api/categories", old && old.category_id, v.value);
  });

  
  function openGoalModal(goal) {
    state.editing.goal = goal;
    $("#goal-heading").textContent = goal ? "Edit Savings Goal" : "Add Savings Goal";
    $("#goal-submit").textContent = goal ? "Save Changes" : "Add Goal";
    hideFormError("goal-error");
    $("#goal-title").value = goal ? goal.title : "";
    $("#goal-target").value = goal ? Number(goal.target_amount) : "";
    $("#goal-saved").value = goal ? Number(goal.saved_amount) : "";
    $("#goal-deadline").value = goal ? goal.deadline : "";
    openModal("goal-modal");
  }

  $("#goal-form").addEventListener("submit", e => {
    e.preventDefault();
    const v = L.validateGoal({
      title: $("#goal-title").value, target_amount: $("#goal-target").value,
      saved_amount: $("#goal-saved").value, deadline: $("#goal-deadline").value
    });
    if (v.error) return showFormError("goal-error", v.error);
    const old = state.editing.goal;
    // BR-023: tell the user when a goal is reached
    save("goal-error", old, "/api/goals", old && old.goal_id, v.value,
         v.value.status === "completed" ? "Goal completed! Well done 🎉" : null);
  });

  
  loadWallet();
})();