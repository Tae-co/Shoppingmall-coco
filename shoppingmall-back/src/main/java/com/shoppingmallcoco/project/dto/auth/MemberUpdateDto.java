package com.shoppingmallcoco.project.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 회원 정보 수정 DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberUpdateDto {
    private String memNickname;
    private String memName;
    private String memMail;
    private String memHp;
    private String memZipcode;
    private String memAddress1;
    private String memAddress2;
}

