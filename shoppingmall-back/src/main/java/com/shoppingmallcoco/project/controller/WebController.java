package com.shoppingmallcoco.project.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController implements ErrorController {

    @GetMapping({
        "/",            // 메인
        "/product",     // /product
        "/product/{id}",// /product/1 같은 상세
        "/reviews",
        "/reviews/**",  // 필요에 따라 추가
        "/mypage/**"
    })
    public String redirect() {
        return "index.html"; // static/index.html
    }
}
