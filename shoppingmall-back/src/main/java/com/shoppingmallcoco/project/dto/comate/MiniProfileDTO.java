package com.shoppingmallcoco.project.dto.comate;

import java.util.List;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
public class MiniProfileDTO {
	private Long memNo;
	private String memNickname;
	// private List<String> skinTypes;
	private int followerCount;
	private int reviewCount;
	
}
