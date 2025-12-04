package com.shoppingmallcoco.project;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/images/uploads/**") // 웹 접근 경로
            .addResourceLocations("file:///C:/coco/uploads/"); // 로컬 파일 경로 (끝에 '/' 필수)
    }

}