package com.shoppingmallcoco.project.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController implements ErrorController {

    @GetMapping("/{path:[^\\.]*}")
    public String redirect() {
        return "index.html";
    }
}
