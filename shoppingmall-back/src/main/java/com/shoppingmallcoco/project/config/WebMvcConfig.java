package com.shoppingmallcoco.project.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}") // 프로퍼티 값 주입
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // file:/// 접두사를 붙여서 경로 설정
        registry.addResourceHandler("/images/**") // 웹 접근 경로
            .addResourceLocations("file:///" + uploadDir);
    }
}