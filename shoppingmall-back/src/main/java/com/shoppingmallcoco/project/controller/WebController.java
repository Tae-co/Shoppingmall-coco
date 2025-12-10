package com.shoppingmallcoco.project.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class WebController implements ErrorController {

    @GetMapping("/")
    public String viewIndex() {
        return "forward:/index.js";
    }

    @RequestMapping("/error")
    public String errorHandle(HttpServletRequest request) {
        String returnView = "";
        Object statusCode = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);

        if (statusCode != null && statusCode.toString().equals("404")) {
            returnView = "forward:/index.js";
        }

        return returnView;

    }
}

