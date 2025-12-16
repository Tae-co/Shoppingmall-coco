package com.shoppingmallcoco.project.controller;

import com.shoppingmallcoco.project.dto.mypage.MyPageResponseDto;
import com.shoppingmallcoco.project.service.mypage.MyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageService myPageService;

    @GetMapping("/api/mypage")
    public MyPageResponseDto getMyPage() {
        return myPageService.getMyPage();
    }
}