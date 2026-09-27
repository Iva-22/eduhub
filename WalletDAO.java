/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package za.ac.cput.edufinanceapp.WalletDAO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Repository;
import za.ac.cput.edufinanceapp.DBConnection.DBConnection;

/**
 *
 * @author ivaml
 */
@Repository
public class WalletDAO {
   public Wallet addWallet(int userId, double balance) {
       
       Wallet wallet = new Wallet(userId, balance);
       
       String sql = "INSERT INTO Wallet(user_id, balance)VALUES(?, ?)";
       try(Connection conn = DBConnection.getConnection();
       PreparedStatement stmt = conn.prepareStatement(sql)){
           stmt.setInt(1, userId);
           stmt.setDouble(2, balance);
           stmt.executeUpdate();
           System.out.println("Wallet create successfully");
       }catch (SQLException e) {
           e.printStackTrace();
           
       }
       return wallet;
   } 
  public List<Wallet> viewWallets() {
    List<Wallet> wallets = new ArrayList<>();

    String sql = "SELECT * FROM Wallet";
    try (Connection conn = DBConnection.getConnection();
         Statement stmt = conn.createStatement();
         ResultSet rs = stmt.executeQuery(sql)) {

        while (rs.next()) {
            int walletId = rs.getInt("wallet_id");
            int userId = rs.getInt("user_id");
            double balance = rs.getDouble("balance");

            wallets.add(new Wallet(walletId, userId, balance)); 
        }
    } catch (SQLException e) {
        e.printStackTrace();
    }
    return wallets; 
}

      
   public void updateBalance(int walletId, double newBalance) {
        String sql = "UPDATE Wallet SET balance = ? WHERE wallet_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setDouble(1, newBalance);
            stmt.setInt(2, walletId);
            stmt.executeUpdate();
            System.out.println("Balance updated");
        } catch (SQLException e) {
            e.printStackTrace();
   
}
   }
 public void deleteWallet(int walletId) {
    String deleteTransactions = "DELETE FROM Transactions WHERE wallet_id = ?";
    String deleteWallet = "DELETE FROM Wallet WHERE wallet_id = ?";
    try (Connection conn = DBConnection.getConnection()) {
        
        try (PreparedStatement stmt = conn.prepareStatement(deleteTransactions)) {
            stmt.setInt(1, walletId);
            stmt.executeUpdate();
        }
        
        try (PreparedStatement stmt = conn.prepareStatement(deleteWallet)) {
            stmt.setInt(1, walletId);
            stmt.executeUpdate();
            System.out.println(" Wallet deleted ");
        }
    } catch (SQLException e) {
        e.printStackTrace();
    }
}

   
}
  


