/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package za.ac.cput.edufinanceapp.WalletDAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import za.ac.cput.edufinanceapp.DBConnection.DBConnection;

/**
 *
 * @author ivaml
 *
 **/

public class TransactionDAO {

    // Add Transaction
    public void addTransaction(int walletId, int categoryId, String description, double amount, String date, String type) {
        String sql = "INSERT INTO Transactions (wallet_id, category_id, description, amount, date, type) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, walletId);
            stmt.setInt(2, categoryId);
            stmt.setString(3, description);
            stmt.setDouble(4, amount);
            stmt.setString(5, date);
            stmt.setString(6, type);

            stmt.executeUpdate();
            System.out.println("Transaction added successfully!");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // View Transactions
    public void viewTransactions(int walletId) {
    String sql = "SELECT tx_id, category_id, description, amount, tx_date, type FROM Transactions WHERE wallet_id = ?";
    try (Connection conn = DBConnection.getConnection();
         PreparedStatement stmt = conn.prepareStatement(sql)) {

        stmt.setInt(1, walletId);
        ResultSet rs = stmt.executeQuery();

        System.out.println("Transactions for Wallet #" + walletId + ":");
        while (rs.next()) {
            System.out.println("Transaction ID: " + rs.getInt("tx_id") +
                               ", Category ID: " + rs.getInt("category_id") +
                               ", Description: " + rs.getString("description") +
                               ", Amount: R" + rs.getDouble("amount") +
                               ", Date: " + rs.getDate("tx_date") +
                               ", Type: " + rs.getString("type"));
        }
    } catch (SQLException e) {
        e.printStackTrace();
    }
}


    
    public double getTotalByCategory(int walletId, String categoryName) {
    double total = 0;
    String sql = "SELECT SUM(t.amount) AS total " +
                 "FROM Transactions t " +
                 "JOIN BudgetCategory c ON t.category_id = c.category_id " +
                 "WHERE t.wallet_id = ? AND c.name = ?";

    try (Connection conn = DBConnection.getConnection();
         PreparedStatement stmt = conn.prepareStatement(sql)) {

        stmt.setInt(1, walletId);
        stmt.setString(2, categoryName);

        ResultSet rs = stmt.executeQuery();
        if (rs.next()) {
            total = rs.getDouble("total");
        }
    } catch (SQLException e) {
        e.printStackTrace();
    }
    return total;
}

   
    public void deleteTransaction(int txId) {
        String sql = "DELETE FROM Transactions WHERE tx_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, txId);
            int rows = stmt.executeUpdate();

            if (rows > 0) {
                System.out.println("Transaction deleted successfully!");
            } else {
                System.out.println("No transaction found with ID: " + txId);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
