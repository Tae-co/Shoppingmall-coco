package com.shoppingmallcoco.project.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 업로드된 이미지 파일 서빙
        registry.addResourceHandler("/images/**")
            .addResourceLocations("file:///" + uploadDir);
        
        // React 정적 리소스 서빙 (CSS, JS, 이미지 등)
        registry.addResourceHandler("/static/**")
            .addResourceLocations("classpath:/static/static/");
        
        // index.js 및 기타 정적 파일들 서빙 (WAR 파일 내부에서도 작동하도록)
        registry.addResourceHandler("/index.js", "/favicon.ico", "/manifest.json", "/logo*.png", "/robots.txt", "/asset-manifest.json", "/prd_placeholder.png")
            .addResourceLocations("classpath:/static/", "classpath:/META-INF/resources/");
    }
}