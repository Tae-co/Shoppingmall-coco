package com.shoppingmallcoco.project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class ShoppingmallCocoApplication {

	public static void main(String[] args) {
		SpringApplication.run(ShoppingmallCocoApplication.class, args);
	}
}
