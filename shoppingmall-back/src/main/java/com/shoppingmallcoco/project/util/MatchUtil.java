package com.shoppingmallcoco.project.util;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class MatchUtil {
	
	/* 각 항목 가중치 부여 */
	private static final int SKIN_TYPE = 30;
	private static final int SKIN_CONCERN = 50;
	private static final int PERSONAL_COLOR = 20;

	public static int calculate(
			String typeA, List<String> concernA, String colorA,
			String typeB, List<String> concernB, String colorB
	) {
		int score = 0;
		int total_weight = 0;
		
		/* 피부타입 매칭 (30점) */
		if (typeA != null && !typeA.isEmpty() 
				&& typeB != null && !typeB.isEmpty()) {
			
			total_weight += SKIN_TYPE;
			
			if (typeA.equals(typeB)) {
				score += SKIN_TYPE;
			}
		}
		
		
		/* 피부고민 매칭 (50점) */
		if (concernA != null && concernB != null) {
			if (!concernA.isEmpty() || !concernB.isEmpty()) {
				total_weight += SKIN_CONCERN;
			
				if (!concernA.isEmpty() && !concernB.isEmpty()) {
					Set<String> setA = new HashSet<>(concernA);
					Set<String> setB = new HashSet<>(concernB);
					
					setA.retainAll(setB);
					int commonCount = setA.size();
					
					int maxCount = Math.max(concernA.size(), concernB.size());
					score += (int) ((double) commonCount /  maxCount * 	SKIN_CONCERN);
				}
			}
		}
		
		/* 퍼스널컬러 매칭 (20점) */
		if (colorA != null && !colorA.isEmpty()
				&& colorB != null && !colorB.isEmpty()) {
			
			total_weight += PERSONAL_COLOR;
			
			if (colorA.equals(colorB)) {
				score += PERSONAL_COLOR;
			}
		}
		
		// 선택한 항목이 존재하지 않는 경우 0점 처리
		if (total_weight == 0)	return 0;
		// 선택 항목 기준으로 비율 계산
		return (int) Math.round((double) score / total_weight * 100);
	}
}
