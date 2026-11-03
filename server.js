
require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");
const L = require("./public/logic.js");  

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => res.redirect("/eduhub.html"));

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "student_wallet",
  dateStrings: true,       
  connectionLimit: 10
});

const WALLET_ID = 1;       

class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}


const route = handler => async (req, res) => {
  try {
    res.json(await handler(req, res));
  } catch (err) {
    let status = err.status || 500;
    let message = err.message;
    if (!err.status) {
      console.error(err);
      if (err.code === "ER_ROW_IS_REFERENCED_2") {
        status = 409; message = "This category is still used by transactions, so it can't be deleted.";
      } else if (err.code === "ER_NO_REFERENCED_ROW_2") {
        status = 400; message = "That category doesn't exist.";
      } else if (err.code === "ER_DUP_ENTRY") {
        status = 409; message = "That name already exists.";
      } else if (err.code === "ER_CHECK_CONSTRAINT_VIOLATED") {
        status = 400; message = "The database rejected that value.";
      } else {
        status = 500; message = "Cannot reach the database. Please make sure MySQL is running.";
      }
    }
    res.status(status).json({ error: message });
  }
};


app.get("/api/wallet", route(async () => {
  const [categories] = await pool.query(
    "SELECT category_id, name, monthly_limit FROM budget_categories WHERE wallet_id = ? ORDER BY category_id", [WALLET_ID]);
  const [transactions] = await pool.query(
    "SELECT transaction_id, category_id, type, amount, trans_date, note FROM transactions WHERE wallet_id = ? ORDER BY trans_date DESC, transaction_id DESC", [WALLET_ID]);
  const [goals] = await pool.query(
    "SELECT goal_id, title, target_amount, saved_amount, deadline, status FROM savings_goals WHERE wallet_id = ? ORDER BY deadline", [WALLET_ID]);
  return { categories, transactions, goals };
}));


function mountCrud({ path: p, table, idCol, label, validate, columns }) 

  app.post(`/api/${p}`, route(async (req, res) => {
    const v = validate(req.body);
    if (v.error) throw new ApiError(400, v.error);
    const cols = ["wallet_id", ...columns];
    const [r] = await pool.query(
      `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
      [WALLET_ID, ...columns.map(c => v.value[c])]);
    res.status(201);
    return { id: r.insertId, message: `${label} added.` };
  }));

  
  app.put(`/api/${p}/:id`, route(async req => {
    const v = validate(req.body);
    if (v.error) throw new ApiError(400, v.error);
    const [r] = await pool.query(
      `UPDATE ${table} SET ${columns.map(c => c + " = ?").join(", ")} WHERE ${idCol} = ? AND wallet_id = ?`,
      [...columns.map(c => v.value[c]), Number(req.params.id), WALLET_ID]);
    if (r.affectedRows === 0) throw new ApiError(404, `${label} not found.`);
    return { message: `${label} updated.` };
  }));

 
  app.delete(`/api/${p}/:id`, route(async req => {
    const [r] = await pool.query(
      `DELETE FROM ${table} WHERE ${idCol} = ? AND wallet_id = ?`, [Number(req.params.id), WALLET_ID]);
    if (r.affectedRows === 0) throw new ApiError(404, `${label} not found.`);
    return { message: `${label} deleted.` };
  }));
}

mountCrud({ path: "transactions", table: "transactions", idCol: "transaction_id", label: "Transaction",
  validate: L.validateTransaction, columns: ["category_id", "type", "amount", "trans_date", "note"] });
mountCrud({ path: "categories", table: "budget_categories", idCol: "category_id", label: "Category",
  validate: L.validateCategory, columns: ["name", "monthly_limit"] });
mountCrud({ path: "goals", table: "savings_goals", idCol: "goal_id", label: "Savings goal",
  validate: L.validateGoal, columns: ["title", "target_amount", "saved_amount", "deadline", "status"] });

app.use("/api", (req, res) => res.status(404).json({ error: "Not found." }));
app.use((err, req, res, next) => res.status(400).json({ error: "Invalid request." }));

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, async () => {
    console.log("Student Wallet running at http://localhost:" + port + "/eduhub.html");
    try {
      await pool.query("SELECT 1");
      console.log("Connected to MySQL database \"" + (process.env.DB_NAME || "student_wallet") + "\".");
    } catch (err) {
      console.error("COULD NOT CONNECT TO MYSQL: " + err.message);
      console.error("Check that MySQL is running and that .env has the right user, password and database name.");
    }
  });
}

module.exports = { app, pool };