/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 */

package za.ac.cput.edufinanceapp;

import java.sql.Connection;
import za.ac.cput.edufinanceapp.DBConnection.DBConnection;
import za.ac.cput.edufinanceapp.UI.WalletUI;
import za.ac.cput.edufinanceapp.WalletDAO.TransactionDAO;
import za.ac.cput.edufinanceapp.WalletDAO.WalletDAO;

/**
 *
 * @author ivaml
 */
public class EduFinanceApp {

    public static void main(String[] args) {
      javax.swing.SwingUtilities.invokeLater(() -> {
            new WalletUI().setVisible(true); // or DashboardUI, or MainMenu
        });  
   WalletDAO walletDao = new WalletDAO();
        walletDao.addWallet(1, 500);
        walletDao.viewWallets();
        walletDao.updateBalance(1, 750);
        walletDao.deleteWallet(1);

        TransactionDAO txDao = new TransactionDAO();
        txDao.viewTransactions(1);
        double foodTotal = txDao.getTotalByCategory(1, "Food");
        System.out.println("Total Food spend: R" + foodTotal);
        txDao.deleteTransaction(2);

        Connection conn = DBConnection.getConnection();
        if (conn != null) {
            System.out.println("Connected to StudentWalletDB");
        } else {
            System.out.println("Connection failed");
        }     
        
        
    }
}

    
