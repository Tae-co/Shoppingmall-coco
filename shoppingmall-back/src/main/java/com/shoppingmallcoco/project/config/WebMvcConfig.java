package com.shoppingmallcoco.project.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    // 로컬 디스크에 저장된 이미지를 웹 브라우저에서 URL로 접근할 수 있게 매핑
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 브라우저 URL: http://localhost:8080/images/uploads/파일명.jpg
        // 실제 저장 경로: C:/coco/uploads/파일명.jpg
        
        registry.addResourceHandler("/images/uploads/**") // 웹 접근 경로
                .addResourceLocations("file:///C:/coco/uploads/"); // 로컬 파일 경로 (끝에 '/' 필수)
    }
}