package com.shoppingmallcoco.project.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shoppingmallcoco.project.dto.comate.FollowInfoDTO;
import com.shoppingmallcoco.project.dto.comate.LikedReviewDTO;
import com.shoppingmallcoco.project.dto.comate.MiniProfileDTO;
import com.shoppingmallcoco.project.dto.comate.MyReviewDTO;
import com.shoppingmallcoco.project.dto.comate.ProfileDTO;
import com.shoppingmallcoco.project.entity.auth.Member;
import com.shoppingmallcoco.project.repository.auth.MemberRepository;
import com.shoppingmallcoco.project.service.comate.CM_ReviewService;
import com.shoppingmallcoco.project.service.comate.ComateService;
import com.shoppingmallcoco.project.service.comate.FollowService;
import com.shoppingmallcoco.project.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/comate")
@RequiredArgsConstructor
public class ComateController {

    private final ComateService comateService;
    private final FollowService followService;
    private final CM_ReviewService reviewService;
    
    private final JwtUtil jwtUtil;
    private final MemberRepository memberRepository;
    
    /* JWT 에서 현재 로그인 memNo 가져오기 */
    // 현재 동작 방식은 memNo-> DB에서 서치 
    // JWT User 사용하는 방법이 정석적인 방법 
    private Long getCurrentMemNo(HttpServletRequest request) {
    	
    	String bearerToken = request.getHeader("Authorization");
    	if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
    		throw new RuntimeException("JWT 토큰이 없습니다.");
    	}
    	
    	String token = bearerToken.substring(7);
    	
    	if (!jwtUtil.validateToken(token)) {
    		throw new RuntimeException("유효하지 않은 JWT 토큰입니다.");
    	}
    	
    	Long memNo = jwtUtil.getMemNoFromToken(token);
    
    	//Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    	//if (auth == null || auth.getName() == null) {
    	//	throw new RuntimeException("인증된 사용자가 없습니다.");
    	//}
    	
    	//String memId = auth.getPrincipal().toString();
    	//System.out.println(memId);
    	
    	//Member member = memberRepository.findByMemId(memId)
    	//		.orElseThrow(()-> new RuntimeException("회원 정보를 찾을 수 없습니다."));
    	
    	return memNo;
    }

    /* 프로필 조회 */
    @GetMapping("/user/{memNo}")
    public ProfileDTO getProfile(@PathVariable("memNo") Long memNo, HttpServletRequest request) {
        Long currentMemNo = getCurrentMemNo(request);
        
        System.out.println("로그인 사용자: " + currentMemNo);
        System.out.println("프로필: " + memNo);
        
        return comateService.getProfile(currentMemNo, memNo);
    }

    // 팔로워 목록 조회
    @GetMapping("/follow/followers/{memNo}")
    public List<FollowInfoDTO> getFollowers(@PathVariable("memNo") Long memNo,  HttpServletRequest request) {
    	Long currentMemNo = getCurrentMemNo(request);
    	return followService.getFollowers(memNo, currentMemNo);
    }
    
    // 팔로잉 목록 조회
    @GetMapping("/follow/followings/{memNo}")
    public List<FollowInfoDTO> getFollowings(@PathVariable("memNo") Long memNo, HttpServletRequest request) {
    	Long currentMemNo = getCurrentMemNo(request);
    	return followService.getFollowings(memNo, currentMemNo);
    }

    // 팔로우
    @PostMapping("/follow/{targetMemNo}")
    public ResponseEntity<String> follow(
            @PathVariable("targetMemNo") Long targetMemNo,
            HttpServletRequest request) {
    	Long currentMemNo = getCurrentMemNo(request);
        followService.follow(currentMemNo, targetMemNo);
        return ResponseEntity.ok("팔로우 완료");
    }

    // 언팔로우
    @DeleteMapping("/unfollow/{targetMemNo}")
    public ResponseEntity<String> unfollow(
            @PathVariable("targetMemNo") Long targetMemNo,
            HttpServletRequest request) {
    	Long currentMemNo = getCurrentMemNo(request);
        followService.unfollow(currentMemNo, targetMemNo);
        return ResponseEntity.ok("언팔로우 완료");
    }
    
    // 사용자가 작성한 리뷰 목록
    @GetMapping("/review/{targetMemNo}")
    public List<MyReviewDTO> getMyReviews(
    		@PathVariable("targetMemNo") Long targetMemNo,
    		@RequestParam(value="sort", defaultValue="latest") String sort,
    		HttpServletRequest request) {
  
    	Long currentMemNo = getCurrentMemNo(request);
        return reviewService.getMyReviews(targetMemNo, currentMemNo, sort);
    }
    
    // 사용자가 좋아요 누른 리뷰 목록
    @GetMapping("/like/{memNo}")
    public List<LikedReviewDTO> getLikedReviews(
    		@PathVariable("memNo") Long targetMemNo,
    		@RequestParam(value = "sort", defaultValue = "latest") String sort,
    		HttpServletRequest request) {
    	
    	Long currentMemNo = getCurrentMemNo(request);
        return reviewService.getLikedReviews(targetMemNo, currentMemNo, sort);
    }

    // 메인용 - 전체 회원 목록 조회
    @GetMapping("/users")
    public ResponseEntity<List<MiniProfileDTO>> getAllComates() {
    	return ResponseEntity.ok(comateService.getAllComates());
    }
}
