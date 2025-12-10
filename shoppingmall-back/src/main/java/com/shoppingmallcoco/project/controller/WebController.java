package com.shoppingmallcoco.project.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class WebController implements ErrorController {

    // 에러 페이지 처리 (404 등) - WebMvcConfig에서 처리되지 않은 경우에만 여기로 옴
    // /api/**, /images/**, /css/**, /js/** 등은 제외하고 나머지는 전부 index.html로
    @RequestMapping(value = {
        "/{path:^(?!api|images|css|js|webjars|favicon\\.ico$).*$}",
        "/**/{path:^(?!api|images|css|js|webjars).*$}"
    })
    public String forwardSpa() {
        return "forward:/index.html";
    }
}

