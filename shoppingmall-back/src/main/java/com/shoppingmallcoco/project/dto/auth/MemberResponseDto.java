package com.shoppingmallcoco.project.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberResponseDto {

    private Long memNo;
    private String memId;
    private String memNickname;
    private String memName;
    private String memMail;
    private String memHp;
    private String memZipcode;
    private String memAddress1;
    private String memAddress2;
    private LocalDateTime memJoindate;
    private String role;
    private Long point;
    private String loginType; // "일반", "카카오", "네이버", "구글"
    private String token;  // JWT 토큰
    private Boolean needsAdditionalInfo;  // 추가 정보 입력 필요 여부 (카카오 로그인용)
}

