package com.shoppingmallcoco.project.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}") // 프로퍼티 값 주입
    private String uploadDir;
    
    private final String[] ALLOWED_ORIGINS = {
            "http://13.231.28.89:3000",
            "http://13.231.28.89",
            "http://13.231.28.89:18080" 
        };

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // file:/// 접두사를 붙여서 경로 설정
        registry.addResourceHandler("/images/**") // 웹 접근 경로
            .addResourceLocations("file:///" + uploadDir);
    }
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 경로에 대해
                .allowedOrigins(ALLOWED_ORIGINS) // 허용할 프론트엔드 도메인
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 허용할 HTTP 메서드
                .allowedHeaders("*") // 모든 헤더 허용
                .allowCredentials(true); // 인증 정보(쿠키, 토큰 등) 허용
    }
}