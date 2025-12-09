package com.shoppingmallcoco.project.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class WebController implements ErrorController {

    // React SPA 라우팅을 위한 fallback - 모든 경로를 index.html로 리다이렉트
    @RequestMapping(value = {
        "/",
        "/login",
        "/login/naver/callback",
        "/signup/terms",
        "/signup/info",
        "/find-account",
        "/kakao/additional-info",
        "/mypage",
        "/cart",
        "/order",
        "/order-history",
        "/order-detail/**",
        "/products/**",
        "/product",
        "/comate/**",
        "/my-comate",
        "/reviews/**",
        "/update-reviews/**",
        "/write-review/**",
        "/admin",
        "/admin/**",
        "/payment",
        "/order-success",
        "/order-fail",
        "/terms/**",
        "/notices",
        "/event",
        "/account-settings",
        "/profile-edit",
        "/error/**",
        "/error/403",
        "/product-stopped",
        "/purchased-product"
    })
    public String index() {
        // Spring Boot가 React의 index.html 파일을 반환하도록 설정
        // index.html은 /resources/static에 위치
        return "forward:/index.html";
    }

    // 에러 페이지도 index.html로 처리 (404 등)
    @GetMapping("/error")
    public String handleError() {
        return "forward:/index.html";
    }
}

