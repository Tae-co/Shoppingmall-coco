package com.shoppingmallcoco.project.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.http.CacheControl;
import java.util.concurrent.TimeUnit;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 업로드된 이미지 파일 서빙
        registry.addResourceHandler("/images/**")
            .addResourceLocations("file:///" + uploadDir)
        	.setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS) // 1년간 캐싱
        	.cachePublic() // 공용 네트워크(CDN 등)에서도 캐싱 허용
        	.immutable()); // "이 파일은 기간 동안 절대 내용이 안 바뀜" 명시
    }
}