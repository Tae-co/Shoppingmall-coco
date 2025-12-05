package com.shoppingmallcoco.project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class ShoppingmallCocoApplication extends SpringBootServletInitializer {

// properties 연결 필요

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(ShoppingmallCocoApplication.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(ShoppingmallCocoApplication.class, args);
    }
}
