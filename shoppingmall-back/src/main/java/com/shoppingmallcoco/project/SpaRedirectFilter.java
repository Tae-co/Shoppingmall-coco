package com.shoppingmallcoco.project;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

@WebFilter("/*")
public class SpaRedirectFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
        throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        String path = request.getRequestURI();

        // 1) API, 정적 파일, 에러 페이지 등은 그대로 통과
        if (path.startsWith("/api") ||
            path.startsWith("/static") ||
            path.startsWith("/assets") ||
            path.startsWith("/images") ||
            path.contains(".")          // .js, .css, .png, .ico 등
        ) {
            chain.doFilter(req, res);
            return;
        }

        // 2) 나머지(리액트 라우트)는 index.html로 포워드
        request.getRequestDispatcher("/index.html").forward(req, res);
    }
}
