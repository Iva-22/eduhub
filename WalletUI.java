/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package za.ac.cput.edufinanceapp.UI;

import java.awt.FlowLayout;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JOptionPane;
import za.ac.cput.edufinanceapp.WalletDAO.TransactionDAO;
import za.ac.cput.edufinanceapp.WalletDAO.WalletDAO;

/**
 *
 * @author ivaml
 */
public class WalletUI extends JFrame {
    
   private JButton addWalletButton;
    private JButton viewWalletsButton;
    private JButton updateBalanceButton;
    private JButton deleteWalletButton;
    private JButton addTransactionButton;
    private JButton viewTransactionsButton;
    
    
    public WalletUI() {
        setTitle("Student Wallet UI");
        setSize(500, 400);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new FlowLayout());

        // Buttons
        addWalletButton = new JButton("Add Wallet");
        viewWalletsButton = new JButton("View Wallets");
        updateBalanceButton = new JButton("Update Balance");
        deleteWalletButton = new JButton("Delete Wallet");
        addTransactionButton = new JButton("Add Transaction");
        viewTransactionsButton = new JButton("View Transactions");

        add(addWalletButton);
        add(viewWalletsButton);
        add(updateBalanceButton);
        add(deleteWalletButton);
        add(addTransactionButton);
        add(viewTransactionsButton);
        
         addWalletButton.addActionListener(e -> {
            WalletDAO walletDao = new WalletDAO();
            walletDao.addWallet(1, 500); // Example values
            JOptionPane.showMessageDialog(this, "Wallet created successfully!");
        });

        viewWalletsButton.addActionListener(e -> {
            WalletDAO walletDao = new WalletDAO();
            walletDao.viewWallets(); // Prints to console for now
            JOptionPane.showMessageDialog(this, "Wallets listed in console.");
        });

        updateBalanceButton.addActionListener(e -> {
            WalletDAO walletDao = new WalletDAO();
            walletDao.updateBalance(1, 750); // Example values
            JOptionPane.showMessageDialog(this, "Balance updated!");
        });
        deleteWalletButton.addActionListener(e -> {
            WalletDAO walletDao = new WalletDAO();
            walletDao.deleteWallet(1); // Example wallet_id
            JOptionPane.showMessageDialog(this, "Wallet deleted!");
        });

        addTransactionButton.addActionListener(e -> {
            TransactionDAO txDao = new TransactionDAO();
            txDao.addTransaction(1, 1, "Groceries", 250.0, "2026-09-22", "Expense");
            JOptionPane.showMessageDialog(this, "Transaction added successfully!");
        });

        viewTransactionsButton.addActionListener(e -> {
            TransactionDAO txDao = new TransactionDAO();
            txDao.viewTransactions(1); // Example wallet_id
            JOptionPane.showMessageDialog(this, "Transactions listed in console.");
        });
    }
}
    
