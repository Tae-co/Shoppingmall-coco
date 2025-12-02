package com.shoppingmallcoco.project.service.comate;

import com.shoppingmallcoco.project.dto.comate.FollowInfoDTO;
import com.shoppingmallcoco.project.dto.comate.MiniProfileDTO;
import com.shoppingmallcoco.project.dto.comate.ProfileDTO;
import com.shoppingmallcoco.project.entity.auth.Member;
import com.shoppingmallcoco.project.entity.mypage.SkinProfile;
import com.shoppingmallcoco.project.repository.auth.MemberRepository;
import com.shoppingmallcoco.project.repository.comate.FollowRepository;
import com.shoppingmallcoco.project.repository.mypage.SkinRepository;
import com.shoppingmallcoco.project.repository.review.LikeRepository;
import com.shoppingmallcoco.project.repository.review.ReviewRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComateService {

    private final MemberRepository memberRepository;
    private final FollowRepository followRepository;
    private final ReviewRepository reviewRepository;
    private final LikeRepository likeRepository;
    private final SkinRepository skinRepository;
    
    private final MatchingService matchingService;

    // 프로필 기본 정보 조회
    public ProfileDTO getProfile(Long currentMemNo, Long targetMemNo) {
    	
    	Member member = memberRepository.findById(targetMemNo)
    			.orElseThrow(() -> new RuntimeException("존재하지 않는 회원입니다."));
    	
    	SkinProfile skinProfile = skinRepository.findByMember_MemNo(targetMemNo).orElse(null);
    	List<String> skinTags = new ArrayList<>();
    	if (skinProfile != null) {
    		if (skinProfile.getSkinType() != null) skinTags.add(skinProfile.getSkinType());
    		if (skinProfile.getSkinConcern() != null) {
       			skinTags.addAll(Arrays.stream(skinProfile.getSkinConcern().split(","))
       					.map(String::trim)
       					.collect(Collectors.toList()));
       		}
    		if (skinProfile.getPersonalColor() != null) skinTags.add(skinProfile.getPersonalColor());
    	}
    	
    	boolean isMine = currentMemNo != null && currentMemNo.equals(targetMemNo);

    	int likedCount = likeRepository.countByMember_MemNo(targetMemNo);
        int followerCount = followRepository.countByFollowing_MemNo(targetMemNo);
        int followingCount = followRepository.countByFollower_MemNo(targetMemNo);
        
        boolean isFollowing = currentMemNo != null && 
        						followRepository.existsByFollowerMemNoAndFollowingMemNo(currentMemNo, targetMemNo);
        
        // 매칭률
   		int matchRate = (currentMemNo != null)
   				? matchingService.getUserMatch(currentMemNo, targetMemNo)
   				: -1;
        
        return ProfileDTO.builder()
                .memNo(member.getMemNo())
                .memName(member.getMemName())
                .memNickname(member.getMemNickname())
                .skinTags(skinTags)
                .likedCount(likedCount)
                .followerCount(followerCount)
                .followingCount(followingCount)
                .isFollowing(isFollowing)
                .isMine(isMine)
                .matchingRate(matchRate)
                .build();
    }
    
    // 메인용 - 전체 회원 목록 조회
    public List<MiniProfileDTO> getAllComates(Long currentMemNo) {
    	
    	List<Member> members = (currentMemNo == null)
    			? memberRepository.findAll()
    			:followRepository.findAllMembersExcluding(currentMemNo);
    	
    	// 팔로우 중인 회원번호 한번에 조회-> N+1 방지
    	Set<Long> followingList = (currentMemNo != null) 
    			? followRepository.findFollowingInfo(currentMemNo).stream()
    					.map(FollowInfoDTO::getMemNo)
    					.collect(Collectors.toSet())
    			: Set.of();
    	
    	return members.stream().map(member -> {

    		int followerCount = followRepository.countByFollowing_MemNo(member.getMemNo());
    		int reviewCount = reviewRepository.countByOrderItem_Order_Member_MemNo(member.getMemNo());
    	
    		SkinProfile skinProfile = member.getSkin();
        	List<String> skinTags = new ArrayList<>();
        	if (skinProfile != null) {
        		if (skinProfile.getSkinType() != null) skinTags.add(skinProfile.getSkinType());
        		if (skinProfile.getSkinConcern() != null) {
           			skinTags.addAll(Arrays.stream(skinProfile.getSkinConcern().split(","))
           					.map(String::trim)
           					.collect(Collectors.toList()));
           		}
        		if (skinProfile.getPersonalColor() != null) skinTags.add(skinProfile.getPersonalColor());
        	}
    		
    		boolean isFollowing = currentMemNo != null &&
    							followingList.contains(member.getMemNo());
    		
    		int matchRate = (currentMemNo != null && !currentMemNo.equals(member.getMemNo()))
       				? matchingService.getUserMatch(currentMemNo, member.getMemNo())
       				: -1;
    		
    		return MiniProfileDTO.builder()
    				.memNo(member.getMemNo())
    				.memNickname(member.getMemNickname())
    				.skinTags(skinTags)
    				.followerCount(followerCount)
    				.reviewCount(reviewCount)
    				.isFollowing(isFollowing)
    				.matchingRate(matchRate)
    				.build();
    	}).toList();
    }
  
}
