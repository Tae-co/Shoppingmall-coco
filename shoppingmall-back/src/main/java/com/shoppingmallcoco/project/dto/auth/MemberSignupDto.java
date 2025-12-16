package com.shoppingmallcoco.project.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberSignupDto {

    private String memId;           // 아이디
    private String memPwd;          // 비밀번호
    private String memNickname;     // 닉네임
    private String memName;         // 이름
    private String memMail;         // 이메일
    private String memHp;           // 전화번호
    private String memZipcode;      // 우편번호
    private String memAddress1;     // 기본주소
    private String memAddress2;     // 상세주소
}


