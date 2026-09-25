/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package za.ac.cput.edufinanceapp.WalletDAO;

/**
 *
 * @author ivaml
 */
public class Wallet {
    private int walletId;
    private int userId;
    private double balance;

    public Wallet(int walletId, int userId, double balance) {
    this.walletId = walletId;
    this.userId = userId;
    this.balance = balance;
}
    
    public Wallet(int userId, double balance) {
        this.userId = userId;
        this.balance = balance;
    }


    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }

}
