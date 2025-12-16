package com.shoppingmallcoco.project.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 네이버 로그인 요청 DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NaverLoginDto {
    private String code;  // 네이버 인증 코드
    private String state; // CSRF 방지를 위한 상태값
}

