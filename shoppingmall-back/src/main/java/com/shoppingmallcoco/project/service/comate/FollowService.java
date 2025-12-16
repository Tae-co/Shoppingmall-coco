package com.shoppingmallcoco.project.service.comate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.shoppingmallcoco.project.dto.comate.FollowInfoDTO;
import com.shoppingmallcoco.project.entity.auth.Member;
import com.shoppingmallcoco.project.entity.comate.Follow;
import com.shoppingmallcoco.project.entity.mypage.SkinProfile;
import com.shoppingmallcoco.project.repository.auth.MemberRepository;
import com.shoppingmallcoco.project.repository.comate.FollowRepository;
import com.shoppingmallcoco.project.repository.mypage.SkinRepository;

import jakarta.transaction.Transactional;
import lombok.*;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final MemberRepository memberRepository;
    private final FollowRepository followRepository;
    private final SkinRepository skinRepository;
    
    private final MatchingService matchingService;

    /* 팔로워 목록 조회 */
    public List<FollowInfoDTO> getFollowers(Long targetMemNo, Long currentMemNo) {
        List<FollowInfoDTO> list = followRepository.findFollowerInfo(targetMemNo);
        
        list.forEach(item -> {
        	// skinTag
        	SkinProfile skinProfile = skinRepository.findByMember_MemNo(item.getMemNo()).orElse(null);
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
        	item.setSkinTags(skinTags);
        	
        	// isFollowing
        	boolean isFollowing = followRepository
        			.existsByFollowerMemNoAndFollowingMemNo(currentMemNo, item.getMemNo());
     	   	item.setFollowing(isFollowing);
     	   	
     	   	// 매칭률
       		int matchRate = (currentMemNo != null)
       				? matchingService.getUserMatch(currentMemNo, item.getMemNo())
       				: -1;
       		item.setMatchingRate(matchRate);
        });
        
        return list;
    }

    /* 팔로잉 목록 조회 */
    public List<FollowInfoDTO> getFollowings(Long targetMemNo, Long currentMemNo) {
    	List<FollowInfoDTO> list = followRepository.findFollowingInfo(targetMemNo);
       
       	list.forEach(item -> {
	    	// skinTag
	       	SkinProfile skinProfile = skinRepository.findByMember_MemNo(item.getMemNo()).orElse(null);
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
	       	item.setSkinTags(skinTags);
       	
       		// isFollowing
       		boolean isFollowing = followRepository
       				.existsByFollowerMemNoAndFollowingMemNo(currentMemNo, item.getMemNo());
       		item.setFollowing(isFollowing);
       		
       		// 매칭률
       		int matchRate = (currentMemNo != null)
       				? matchingService.getUserMatch(currentMemNo, item.getMemNo())
       				: -1;
       		item.setMatchingRate(matchRate);
       });
       
       return list;
    }
    
    /* 팔로우 */
    @Transactional
    public void follow(Long followerNo, Long followingNo) {
        if (followerNo.equals(followingNo)) {
        	throw new RuntimeException("자기 자신을 팔로우할 수 없니다. ");
        }
        
        boolean exists = followRepository.existsByFollowerMemNoAndFollowingMemNo(followerNo, followingNo);
        if (exists) {
        	throw new RuntimeException("이미 팔로우 중 입니다.");
        }
        
        Member follower = memberRepository.findById(followerNo)
        		.orElseThrow(() -> new RuntimeException("존재하지 않는 회원입니다."));
        Member following = memberRepository.findById(followingNo)
        		.orElseThrow(() -> new RuntimeException("존재하지 않는 회원입니다."));
        
        Follow follow = Follow.builder()
        		.follower(follower)
        		.following(following)
        		.build();
        
        followRepository.save(follow);
    }

    /* 언팔로우 */
    @Transactional
    public void unfollow(Long followerNo, Long followingNo) {
    	boolean exists = followRepository.existsByFollowerMemNoAndFollowingMemNo(followerNo, followingNo);
        if (!exists) {
            throw new RuntimeException("팔로우하지 않은 사용자입니다.");
        }

        followRepository.deleteByFollowerMemNoAndFollowingMemNo(followerNo, followingNo);
    }

}
