package com.shoppingmallcoco.project.controller;

import com.shoppingmallcoco.project.dto.mypage.ProfileUpdateRequestDto;
import com.shoppingmallcoco.project.dto.mypage.SkinProfileResponseDto;
import com.shoppingmallcoco.project.service.mypage.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coco/members/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PutMapping("/{memNo}")
    public ResponseEntity<?> updateProfile(
            @PathVariable("memNo") Long memNo,
            @RequestBody ProfileUpdateRequestDto dto) {

        profileService.updateProfile(memNo, dto);
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/{memNo}")
    public SkinProfileResponseDto getProfile(@PathVariable("memNo") Long memNo) {
        return profileService.getProfile(memNo);
    }
}
