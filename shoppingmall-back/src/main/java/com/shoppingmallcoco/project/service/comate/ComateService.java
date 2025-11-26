package com.shoppingmallcoco.project.service.comate;

import com.shoppingmallcoco.project.dto.comate.MiniProfileDTO;
import com.shoppingmallcoco.project.dto.comate.ProfileDTO;
import com.shoppingmallcoco.project.entity.auth.Member;
import com.shoppingmallcoco.project.entity.comate.Follow;
import com.shoppingmallcoco.project.repository.auth.MemberRepository;
import com.shoppingmallcoco.project.repository.comate.FollowRepository;
import com.shoppingmallcoco.project.repository.review.LikeRepository;
import com.shoppingmallcoco.project.repository.review.ReviewRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ComateService {

    private final MemberRepository memberRepository;
    private final FollowRepository followRepository;
    private final ReviewRepository reviewRepository;
    private final LikeRepository likeRepository;
    
    private final FollowService followService;
    private final CM_ReviewService reviewService;

    // 프로필 기본 정보 조회
    public ProfileDTO getProfile(Long currentMemNo, Long targetMemNo) {
    	
    	Member member = memberRepository.findById(targetMemNo)
    			.orElseThrow(() -> new RuntimeException("존재하지 않는 회원입니다."));
    	
    	boolean isMine = currentMemNo.equals(targetMemNo);

    	int likedCount = likeRepository.countByMember_MemNo(targetMemNo);
        int followerCount = followRepository.countByFollowing_MemNo(targetMemNo);
        int followingCount = followRepository.countByFollower_MemNo(targetMemNo);
        
        boolean isFollowing = followRepository
  			   .existsByFollowerMemNoAndFollowingMemNo(currentMemNo, targetMemNo);
        
        return ProfileDTO.builder()
                .memNo(member.getMemNo())
                .memName(member.getMemName())
                .memNickname(member.getMemNickname())
                .likedCount(likedCount)
                .followerCount(followerCount)
                .followingCount(followingCount)
                .isFollowing(isFollowing)
                .isMine(isMine)
                .build();
    }
    
    // 메인용 - 전체 회원 목록 조회
    public List<MiniProfileDTO> getAllComates() {
    	List<Member> members = memberRepository.findAll();
    	return members.stream().map(member -> {
    		
    		int followerCount = followRepository.countByFollowing_MemNo(member.getMemNo());
    		int reviewCount = reviewRepository.countByOrderItem_Order_Member_MemNo(member.getMemNo());
    		
    		// 피부타입 아직 구현안됨 (추가예정)
    		// MiniProfileDTO skinTypes 주석 지워야함
    		// List<String> skinTypes = member.getSkinTypes();
    		
    		return MiniProfileDTO.builder()
    				.memNo(member.getMemNo())
    				.memNickname(member.getMemNickname())
    				//.skinTypes(skinTypes)
    				.followerCount(followerCount)
    				.reviewCount(reviewCount)
    				.build();
    	}).toList();
    }
  
}
