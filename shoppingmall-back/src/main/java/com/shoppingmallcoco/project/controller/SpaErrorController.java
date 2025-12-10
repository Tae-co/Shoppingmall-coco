package com.shoppingmallcoco.project.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * SPA(Single Page Application) 라우팅을 위한 에러 컨트롤러
 * API 경로가 아닌 모든 요청을 프론트엔드로 리다이렉트하여
 * React Router가 클라이언트 사이드 라우팅을 처리할 수 있도록 함
 * 자동으로 프론트엔드로 리다이렉트
 */
@Slf4j
@Controller
public class SpaErrorController implements ErrorController {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    /**
     * 404 에러 및 기타 에러를 처리하여 프론트엔드로 리다이렉트
     * API 경로(/api/**)가 아닌 요청은 모두 프론트엔드로 전달
     */
    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        
        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());
            
            // 404 에러인 경우
            if (statusCode == HttpStatus.NOT_FOUND.value()) {
                String requestURI = (String) request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
                
                if (requestURI == null) {
                    requestURI = request.getRequestURI();
                }
                
                // API 경로나 이미지 경로가 아닌 경우에만 프론트엔드로 리다이렉트
                if (!requestURI.startsWith("/api/") && !requestURI.startsWith("/images/")) {
                    log.info("SPA 라우팅: {} 경로를 프론트엔드로 리다이렉트", requestURI);
                    
                    // 프론트엔드 URL로 리다이렉트
                    // allowedOrigins에서 첫 번째 도메인을 사용
                    String frontendUrl = allowedOrigins.split(",")[0].trim();
                    return "redirect:" + frontendUrl + requestURI;
                }
            }
        }
        
        // 기타 에러는 기본 에러 페이지로
        return "error";
    }
}

