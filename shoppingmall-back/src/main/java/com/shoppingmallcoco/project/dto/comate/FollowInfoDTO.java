package com.shoppingmallcoco.project.dto.comate;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FollowInfoDTO {
    private Long memNo;
    private String nickname;
    private boolean isFollowing;
    
    public FollowInfoDTO(Long memNo, String nickname) {
        this.memNo = memNo;
        this.nickname = nickname;
    }
}
