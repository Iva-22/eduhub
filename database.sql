CREATE DATABASE IF NOT EXISTS StudentWalletDB;
USE StudentWalletDB;


CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100)
);


CREATE TABLE Wallet (
    wallet_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    balance DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);


CREATE TABLE BudgetCategory (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    monthly_limit DECIMAL(10,2)
);


CREATE TABLE Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT,
    category_id INT,
    description VARCHAR(255),
    amount DECIMAL(10,2),
    tx_date DATE,
    type ENUM('Income','Expense'),
    FOREIGN KEY (wallet_id) REFERENCES Wallet(wallet_id),
    FOREIGN KEY (category_id) REFERENCES BudgetCategory(category_id)
);


INSERT INTO Users (full_name, email) VALUES ('Student User', 'student@example.com');

--
INSERT INTO Wallet (user_id, balance) VALUES (1, 5000.00);


INSERT INTO BudgetCategory (name, monthly_limit) VALUES 
('Food', 1500.00), 
('Transport', 600.00), 
('Education', 800.00),
('Accommodation', 3000.00); 

INSERT INTO Transactions (wallet_id, category_id, description, amount, tx_date, type) VALUES
(1, 3, 'NSFAS Monthly Allowance', 1700.00, '2026-08-01', 'Income'),
(1, 1, 'Groceries at Supermarket', 890.00, '2026-08-02', 'Expense'),
(1, 3, 'Textbook Purchase', 450.00, '2026-08-03', 'Expense'),
(1, 1, 'Meal at Campus Canteen', 75.00, '2026-08-05', 'Expense'),
(1, 2, 'Transport Refill', 420.00, '2026-08-05', 'Expense'),
(1, 4, 'Monthly Rent Payment', 3200.00, '2026-08-06', 'Expense'); 