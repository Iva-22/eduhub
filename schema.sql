CREATE DATABASE IF NOT EXISTS student_wallet;
USE student_wallet;

CREATE TABLE wallets (
  wallet_id    INT AUTO_INCREMENT PRIMARY KEY,
  student_name VARCHAR(100) NOT NULL,
  currency     CHAR(3) NOT NULL DEFAULT 'ZAR',
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE budget_categories (
  category_id   INT AUTO_INCREMENT PRIMARY KEY,
  wallet_id     INT NOT NULL,
  name          VARCHAR(60) NOT NULL,
  monthly_limit DECIMAL(10,2) NOT NULL,
  UNIQUE KEY uq_wallet_category (wallet_id, name),
  CONSTRAINT chk_limit_positive CHECK (monthly_limit > 0),
  CONSTRAINT fk_category_wallet FOREIGN KEY (wallet_id)
    REFERENCES wallets(wallet_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  wallet_id      INT NOT NULL,
  category_id    INT NULL,
  type           ENUM('income','expense') NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  trans_date     DATE NOT NULL,
  note           VARCHAR(150),
  CONSTRAINT chk_amount_positive CHECK (amount > 0),
  CONSTRAINT chk_category_rule CHECK (
    (type = 'income' AND category_id IS NULL) OR
    (type = 'expense' AND category_id IS NOT NULL)),
  CONSTRAINT fk_trans_wallet FOREIGN KEY (wallet_id)
    REFERENCES wallets(wallet_id) ON DELETE CASCADE,
  CONSTRAINT fk_trans_category FOREIGN KEY (category_id)
    REFERENCES budget_categories(category_id)
) ENGINE=InnoDB;

CREATE TABLE savings_goals (
  goal_id       INT AUTO_INCREMENT PRIMARY KEY,
  wallet_id     INT NOT NULL,
  title         VARCHAR(80) NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  saved_amount  DECIMAL(10,2) NOT NULL DEFAULT 0,
  deadline      DATE NOT NULL,
  status        ENUM('active','completed') NOT NULL DEFAULT 'active',
  CONSTRAINT chk_target_positive CHECK (target_amount > 0),
  CONSTRAINT chk_saved_valid CHECK (saved_amount >= 0),
  CONSTRAINT fk_goal_wallet FOREIGN KEY (wallet_id)
    REFERENCES wallets(wallet_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_transactions_wallet_date ON transactions (wallet_id, trans_date);
CREATE INDEX idx_transactions_category    ON transactions (category_id);
CREATE INDEX idx_goals_wallet_status      ON savings_goals (wallet_id, status);

INSERT INTO wallets (student_name) VALUES ('Iva Mlambo');

INSERT INTO budget_categories (wallet_id, name, monthly_limit) VALUES
  (1, 'Food & Groceries', 1200),
  (1, 'Education',         300),
  (1, 'Data & Airtime',    250),
  (1, 'Personal & Social', 300);

INSERT INTO transactions (wallet_id, category_id, type, amount, trans_date, note) VALUES
  (1, NULL, 'income',  1650, '2026-10-01', 'NSFAS living allowance'),
  (1, NULL, 'income',   600, '2026-10-12', 'Maths tutoring'),
  (1, 1,    'expense',  280, '2026-10-03', 'Weekly groceries'),
  (1, 1,    'expense',  260, '2026-10-10', 'Weekly groceries'),
  (1, 1,    'expense',  250, '2026-10-17', 'Weekly groceries'),
  (1, 1,    'expense',  230, '2026-10-24', 'Weekly groceries'),
  (1, 2,    'expense',  120, '2026-10-06', 'Printing and stationery'),
  (1, 2,    'expense',  150, '2026-10-20', 'Course pack'),
  (1, 3,    'expense',  150, '2026-10-02', 'Data bundle'),
  (1, 3,    'expense',   80, '2026-10-20', 'Airtime top-up'),
  (1, 4,    'expense',  110, '2026-10-14', 'Toiletries'),
  (1, 4,    'expense',   90, '2026-10-27', 'Movies with friends'),
  (1, NULL, 'income',  1650, '2026-11-01', 'NSFAS living allowance'),
  (1, 1,    'expense',  240, '2026-11-01', 'Groceries'),
  (1, 3,    'expense',  300, '2026-11-01', 'Data bundle'),
  (1, 2,    'expense',   85, '2026-11-02', 'Printing'),
  (1, 4,    'expense',   60, '2026-11-02', 'Toiletries');

INSERT INTO savings_goals (wallet_id, title, target_amount, saved_amount, deadline, status) VALUES
  (1, 'Laptop',         6000, 1200, '2027-06-30', 'active'),
  (1, 'Emergency fund', 1500,  450, '2027-03-31', 'active'),
  (1, 'Winter jacket',   600,  600, '2026-10-31', 'completed');