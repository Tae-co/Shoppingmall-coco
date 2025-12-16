package com.shoppingmallcoco.project.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 카카오 로그인 요청 DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KakaoLoginDto {
    private String accessToken; // 카카오 액세스 토큰
}

