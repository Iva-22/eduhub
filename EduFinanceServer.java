/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package za.ac.cput.edufinanceapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;

/**
 *
 * @author ivaml
 */

@SpringBootApplication
@ServletComponentScan  
public class EduFinanceServer {
    public static void main(String[] args) {
        SpringApplication.run(EduFinanceServer.class, args);
    }
}

  
    

