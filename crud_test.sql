USE student_wallet;


INSERT INTO transactions (wallet_id, category_id, type, amount, trans_date, note)
VALUES (1, 1, 'expense', 95, '2026-11-02', 'Lunch');


SELECT t.transaction_id, t.trans_date, t.type, t.amount, c.name AS category, t.note
FROM transactions t
LEFT JOIN budget_categories c ON c.category_id = t.category_id
WHERE t.wallet_id = 1
  AND t.trans_date >= '2026-11-01' AND t.trans_date < '2026-12-01'
  AND t.note LIKE '%lunch%'
ORDER BY t.trans_date DESC, t.amount DESC;

UPDATE transactions SET amount = 110, note = 'Lunch and drink' WHERE transaction_id = 18;

DELETE FROM transactions WHERE transaction_id = 18;

INSERT INTO transactions (wallet_id, category_id, type, amount, trans_date, note)
VALUES (1, 1, 'expense', -50, '2026-11-02', 'Bad data');

DELETE FROM budget_categories WHERE category_id = 1;