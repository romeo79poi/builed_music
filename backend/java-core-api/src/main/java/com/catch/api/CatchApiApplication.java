package com.catch.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableFeignClients
@EnableAsync
@EnableTransactionManagement
public class CatchApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(CatchApiApplication.class, args);
    }
}
