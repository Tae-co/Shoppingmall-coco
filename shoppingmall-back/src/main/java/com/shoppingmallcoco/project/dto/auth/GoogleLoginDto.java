package com.shoppingmallcoco.project.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 구글 로그인 요청 DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleLoginDto {
    private String accessToken; // 구글 ID 토큰 (credential)
}

