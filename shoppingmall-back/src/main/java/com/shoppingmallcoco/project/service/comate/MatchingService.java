package com.shoppingmallcoco.project.service.comate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shoppingmallcoco.project.entity.mypage.SkinProfile;
import com.shoppingmallcoco.project.repository.mypage.SkinRepository;
import com.shoppingmallcoco.project.util.MatchUtil;

import lombok.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchingService {
	
	private final SkinRepository skinRepository;
	
	/* A 유저와 B 유저 매칭률을 매번 계산하지 않고 캐싱-> DB 조회량 감소 (병목현상) */
	// memNo1 + memNo2 조합으로 캐싱
	private final Map<String, Integer> matchingCache = new ConcurrentHashMap<>();
	
	/* 로그인 유저와 다른 사용자 매칭 */
	public int getUserMatch(Long loginMemNo, Long targetMemNo) {
		
		if (loginMemNo == null) return -1;
		
		String cacheKey = loginMemNo < targetMemNo ? loginMemNo + "-" + targetMemNo : targetMemNo + "-" + loginMemNo;
				 
		// 캐시가 존재하면 바로 반환-> 성능 개선
		if (matchingCache.containsKey(cacheKey)) {
			return matchingCache.get(cacheKey);
		}
		
		// 스킨 프로필 조회
		SkinProfile loginSkin = skinRepository.findByMember_MemNo(loginMemNo).orElse(null);
		SkinProfile targetSkin = skinRepository.findByMember_MemNo(targetMemNo).orElse(null);
		
		// 스킨 정보 없으면 매칭률 0
		if (loginSkin == null || targetSkin == null) {
			matchingCache.put(cacheKey, 0);
			return 0;
		}
		
		String typeA = loginSkin.getSkinType() != null ? loginSkin.getSkinType() : "";
		String typeB = targetSkin.getSkinType() != null ? targetSkin.getSkinType() : "";
		
		List<String> concernA = Optional.ofNullable(loginSkin.getSkinConcern())
				.filter(s -> !s.isBlank())
				.map(s -> Arrays.stream(s.split(","))
						.map(String::trim)
						.toList())
				.orElse(List.of());
		
		List<String> concernB = Optional.ofNullable(targetSkin.getSkinConcern())
				.filter(s -> !s.isBlank())
				.map(s -> Arrays.stream(s.split(","))
						.map(String::trim)
						.toList())
				.orElse(List.of());
		
		String colorA = loginSkin.getPersonalColor() != null ? loginSkin.getPersonalColor() : "";
		String colorB = targetSkin.getPersonalColor() != null ? targetSkin.getPersonalColor() : "";
		
		int rate = MatchUtil.calculate(typeA, concernA, colorA, typeB, concernB, colorB);
		matchingCache.put(cacheKey,  rate);
		
		return rate;
		
	}
	
	/* 특정 사용자와 관련된 캐시 무효화 (피부 프로필 업데이트) */
	public void invalidateCacheForUser(Long memNo) {
		matchingCache.keySet().removeIf(key -> key.startsWith(memNo + "-") || key.endsWith("-" + memNo));
	}
	
	/* 매칭 결과 캐시 초기화 */
	public void clearCache() {
		matchingCache.clear();
	}
	
}
