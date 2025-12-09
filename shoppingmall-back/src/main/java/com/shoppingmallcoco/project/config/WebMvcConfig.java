package com.shoppingmallcoco.project.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

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
        // 이미지 파일 경로 설정
        registry.addResourceHandler("/images/**") // 웹 접근 경로
            .addResourceLocations("file:///" + uploadDir);

        // React 빌드 파일 서빙 설정
        registry.addResourceHandler("/**")
            .addResourceLocations("classpath:/static/")
            .resourceChain(true)
            .addResolver(new PathResourceResolver() {
                @Override
                protected Resource getResource(String resourcePath, Resource location) throws IOException {
                    Resource requestedResource = location.createRelative(resourcePath);
                    
                    // 요청된 리소스가 존재하고 파일인 경우 반환
                    if (requestedResource.exists() && requestedResource.isReadable()) {
                        return requestedResource;
                    }
                    
                    // API 경로는 제외 (실제 API 요청인 경우)
                    if (resourcePath.startsWith("api/")) {
                        return null;
                    }
                    
                    // 그 외 모든 경로는 index.html로 fallback (SPA 라우팅 지원)
                    return new ClassPathResource("/static/index.html");
                }
            });
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