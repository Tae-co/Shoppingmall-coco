package com.shoppingmallcoco.project.dto.comate;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MemberSearchDTO {
	private Long memNo;
	private String memNickname;
}
