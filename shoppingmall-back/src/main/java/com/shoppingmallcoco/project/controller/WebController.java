package com.shoppingmallcoco.project.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping({
        "/",                 // Home
        "/login",
        "/signup/terms",
        "/signup/info",
        "/find-account",
        "/kakao/additional-info",
        "/product",          // 상품 리스트
        "/products/{id}",    // 상품 상세
        "/cart",
        "/order",
        "/payment",
        "/order-success",
        "/order-fail",
        "/mypage",
        "/profile-edit",
        "/order-history",
        "/account-settings",
        "/my-comate",
        "/order-detail/{orderNo}",
        "/write-review/{orderItemNo}",
        "/update-reviews/{reviewNo}",
        "/comate/me/{tab}",
        "/comate/user/{memNo}/{tab}",
        "/terms/{type}",
        "/notices",
        "/event"
    })
    public String forwardSPA() {
        return "index.html";
    }
}
