package com.shoppingmallcoco.project.dto.comate;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.shoppingmallcoco.project.entity.auth.Member;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
public class ProfileDTO {
	// 사용자 기본 정보
    private Long memNo;
    private String memName;
    private String memNickname;
    
    // 좋아요 누른 리뷰 개수
    private int likedCount;
    
    // 팔로잉 관련 정보
    private int followerCount;
    private int followingCount;
    // 팔로잉 여부 확인
    private boolean isFollowing;

    // 현재 사용자 확인
    private boolean isMine;

}
