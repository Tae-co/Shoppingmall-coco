package com.shoppingmallcoco.project.controller;

import com.shoppingmallcoco.project.dto.mypage.SkinProfileRequestDto;
import com.shoppingmallcoco.project.dto.mypage.SkinProfileResponseDto;
import com.shoppingmallcoco.project.entity.auth.Member;
import com.shoppingmallcoco.project.repository.auth.MemberRepository;
import com.shoppingmallcoco.project.service.mypage.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coco/members/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final MemberRepository memberRepository;

    @PutMapping("/{memNo}")
    public ResponseEntity<?> updateProfile(
            @PathVariable("memNo") Long memNo,
            @RequestBody SkinProfileRequestDto dto,
            Authentication authentication) {

        // 인증 체크
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("인증이 필요합니다.");
        }

        // 현재 로그인한 사용자 정보 조회
        Member currentMember = memberRepository.findByMemId(authentication.getName())
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

        // 본인의 프로필만 수정 가능하도록 권한 체크
        if (!currentMember.getMemNo().equals(memNo)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("본인의 프로필만 수정할 수 있습니다.");
        }

        profileService.updateProfile(memNo, dto);
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/{memNo}")
    public ResponseEntity<?> getProfile(
            @PathVariable("memNo") Long memNo,
            Authentication authentication) {

        // 인증 체크
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("인증이 필요합니다.");
        }

        // 현재 로그인한 사용자 정보 조회
        Member currentMember = memberRepository.findByMemId(authentication.getName())
                .orElseThrow(() -> new RuntimeException("회원을 찾을 수 없습니다."));

        // 본인의 프로필만 조회 가능하도록 권한 체크
        if (!currentMember.getMemNo().equals(memNo)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("본인의 프로필만 조회할 수 있습니다.");
        }

        SkinProfileResponseDto profile = profileService.getProfile(memNo);
        return ResponseEntity.ok(profile);
    }
}
