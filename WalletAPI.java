/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package za.ac.cput.edufinanceapp.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import za.ac.cput.edufinanceapp.WalletDAO.Wallet;
import za.ac.cput.edufinanceapp.WalletDAO.WalletDAO;


/**
 *
 * @author ivaml
 */

@RestController
@RequestMapping("/api/wallets")
public class WalletAPI {

    @Autowired
    private final WalletDAO walletDao;

    public WalletAPI(WalletDAO walletDao) {
        this.walletDao = walletDao;
    }

    @GetMapping
    public List<Wallet> getWallets() {
        return walletDao.viewWallets();
    }

    @PostMapping
    public ResponseEntity<Wallet> createWallet(@RequestParam int userId,
                                               @RequestParam double balance) {
        Wallet wallet = walletDao.addWallet(userId, balance);
        return ResponseEntity.status(HttpStatus.CREATED).body(wallet);
    }
}
