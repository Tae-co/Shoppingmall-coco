package com.shoppingmallcoco.project.controller;

import com.shoppingmallcoco.project.dto.auth.*;
import com.shoppingmallcoco.project.service.auth.EmailVerificationService;
import com.shoppingmallcoco.project.service.auth.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class MemberController {

    private final MemberService memberService;
    private final EmailVerificationService emailVerificationService;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody MemberSignupDto signupDto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(memberService.signup(signupDto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody MemberLoginDto loginDto) {
        try {
            return ResponseEntity.ok(memberService.login(loginDto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    // 중복 확인 공통 메서드
    private ResponseEntity<Map<String, Object>> checkDuplicate(boolean isDuplicate, String type) {
        Map<String, Object> response = new HashMap<>();
        response.put("available", !isDuplicate);
        response.put("message", isDuplicate ?
                "이미 사용 중인 " + type + "입니다." :
                "사용 가능한 " + type + "입니다.");
        return ResponseEntity.ok(response);
    }

    // 아이디 중복 확인
    @GetMapping("/check-id/{memId}")
    public ResponseEntity<Map<String, Object>> checkIdDuplicate(@PathVariable String memId) {
        return checkDuplicate(memberService.checkIdDuplicate(memId), "아이디");
    }

    // 닉네임 중복 확인
    @GetMapping("/check-nickname/{memNickname}")
    public ResponseEntity<Map<String, Object>> checkNicknameDuplicate(@PathVariable String memNickname) {
        return checkDuplicate(memberService.checkNicknameDuplicate(memNickname), "닉네임");
    }

    // 이메일 중복 확인
    @GetMapping("/check-email/{memMail}")
    public ResponseEntity<Map<String, Object>> checkEmailDuplicate(@PathVariable String memMail) {
        return checkDuplicate(memberService.checkEmailDuplicate(memMail), "이메일");
    }

    // 이메일 인증번호 전송
    @PostMapping("/email/send")
    public ResponseEntity<Map<String, Object>> sendEmailVerificationCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "이메일을 입력해주세요."));
        }

        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "올바른 이메일 형식을 입력해주세요."));
        }

        try {
            emailVerificationService.generateVerificationCode(email);
            return ResponseEntity.ok(Map.of("success", true, "message", "인증번호가 이메일로 전송되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "인증번호 전송 중 오류가 발생했습니다."));
        }
    }

    // 이메일 인증번호 검증
    @PostMapping("/email/verify")
    public ResponseEntity<Map<String, Object>> verifyEmailCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        if (email == null || code == null || email.trim().isEmpty() || code.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "이메일과 인증번호를 입력해주세요."));
        }

        boolean isValid = emailVerificationService.verifyCode(email, code);

        if (isValid) {
            return ResponseEntity.ok(Map.of("success", true, "message", "인증이 완료되었습니다."));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "인증번호가 일치하지 않거나 만료되었습니다."));
        }
    }

    // 아이디 찾기 - 인증번호 전송
    @PostMapping("/find-id/send")
    public ResponseEntity<Map<String, Object>> sendFindIdVerificationCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "이메일을 입력해주세요."));
        }
        try {
            memberService.sendFindIdVerificationCode(email);
            return ResponseEntity.ok(Map.of("success", true, "message", "인증번호가 이메일로 전송되었습니다."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // 아이디 찾기 - 인증번호 검증 후 아이디 반환
    @PostMapping("/find-id/verify")
    public ResponseEntity<Map<String, Object>> findId(@RequestBody FindIdDto findIdDto) {
        try {
            String memId = memberService.findId(findIdDto);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("memId", memId);
            response.put("message", "아이디 찾기가 완료되었습니다.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // 비밀번호 찾기 - 인증번호 전송
    @PostMapping("/find-password/send")
    public ResponseEntity<Map<String, Object>> sendResetPasswordVerificationCode(@RequestBody Map<String, String> request) {
        String memId = request.get("memId");
        String email = request.get("email");

        if (memId == null || memId.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "아이디를 입력해주세요."));
        }
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "이메일을 입력해주세요."));
        }
        try {
            memberService.sendResetPasswordVerificationCode(memId, email);
            return ResponseEntity.ok(Map.of("success", true, "message", "인증번호가 이메일로 전송되었습니다."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // 비밀번호 재설정
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody ResetPasswordDto resetPasswordDto) {
        String newPassword = resetPasswordDto.getNewPassword();
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "새 비밀번호를 입력해주세요."));
        }
        if (newPassword.length() < 8) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "비밀번호는 8자 이상이어야 합니다."));
        }
        try {
            memberService.resetPassword(resetPasswordDto);
            return ResponseEntity.ok(Map.of("success", true, "message", "비밀번호가 재설정되었습니다."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }


    // 카카오 로그인
    @PostMapping("/kakao/login")
    public ResponseEntity<?> kakaoLogin(@RequestBody KakaoLoginDto kakaoLoginDto) {
        try {
            if (kakaoLoginDto.getAccessToken() == null || kakaoLoginDto.getAccessToken().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "카카오 액세스 토큰이 필요합니다."));
            }

            MemberResponseDto response = memberService.kakaoLogin(kakaoLoginDto.getAccessToken());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // 네이버 로그인
    @PostMapping("/naver/login")
    public ResponseEntity<?> naverLogin(@RequestBody NaverLoginDto naverLoginDto) {
        try {
            if (naverLoginDto.getCode() == null || naverLoginDto.getCode().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "네이버 인증 코드가 필요합니다."));
            }
            if (naverLoginDto.getState() == null || naverLoginDto.getState().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "상태값이 필요합니다."));
            }

            MemberResponseDto response = memberService.naverLogin(
                    naverLoginDto.getCode(),
                    naverLoginDto.getState()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // 구글 로그인
    @PostMapping("/google/login")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginDto googleLoginDto) {
        try {
            if (googleLoginDto.getAccessToken() == null || googleLoginDto.getAccessToken().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "구글 액세스 토큰이 필요합니다."));
            }

            MemberResponseDto response = memberService.googleLogin(googleLoginDto.getAccessToken());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // 현재 로그인한 회원 정보 조회
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentMember(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "인증이 필요합니다."));
        }
        try {
            MemberResponseDto member = memberService.getMemberByMemId(authentication.getName());
            return ResponseEntity.ok(member);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    // 관리자용: 전체 회원 목록 조회 (페이징, 검색, 필터)
    @GetMapping("/admin/list")
    public ResponseEntity<?> getAllMembers(
            Authentication authentication,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "searchTerm", required = false) String searchTerm,
            @RequestParam(value = "role", required = false) String role) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "인증이 필요합니다."));
        }
        try {
            // 관리자 권한 체크
            MemberResponseDto currentMember = memberService.getMemberByMemId(authentication.getName());
            if (currentMember.getRole() == null ||
                    (!currentMember.getRole().equals("ADMIN") && !currentMember.getRole().equals("admin"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "관리자 권한이 필요합니다."));
            }

            Map<String, Object> result = memberService.getAllMembers(page, size, searchTerm, role);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    // 회원 정보 수정 (카카오 로그인 후 추가 정보 입력용)
    @PutMapping("/update")
    public ResponseEntity<?> updateMember(Authentication authentication, @RequestBody MemberUpdateDto updateDto) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "인증이 필요합니다."));
        }
        try {
            // 현재 로그인한 사용자 정보 조회
            MemberResponseDto currentMember = memberService.getMemberByMemId(authentication.getName());

            // 회원 정보 업데이트
            MemberResponseDto updatedMember = memberService.updateMember(currentMember.getMemNo(), updateDto);
            return ResponseEntity.ok(updatedMember);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    // 비밀번호 변경 (로그인한 사용자용)
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication authentication, @RequestBody ChangePasswordDto changePasswordDto) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "인증이 필요합니다."));
        }
        try {
            if (changePasswordDto.getCurrentPassword() == null || changePasswordDto.getCurrentPassword().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "현재 비밀번호를 입력해주세요."));
            }
            if (changePasswordDto.getNewPassword() == null || changePasswordDto.getNewPassword().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "새 비밀번호를 입력해주세요."));
            }
            if (changePasswordDto.getNewPassword().length() < 8) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "비밀번호는 8자 이상이어야 합니다."));
            }

            memberService.changePassword(authentication.getName(), changePasswordDto);
            return ResponseEntity.ok(Map.of("success", true, "message", "비밀번호가 성공적으로 변경되었습니다."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // 계정 삭제 (로그인한 사용자)
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteAccount(Authentication authentication, @RequestBody DeleteAccountDto deleteAccountDto) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "인증이 필요합니다."));
        }
        try {
            memberService.deleteAccount(authentication.getName(), deleteAccountDto);
            return ResponseEntity.ok(Map.of("success", true, "message", "계정이 삭제되었습니다."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

}


