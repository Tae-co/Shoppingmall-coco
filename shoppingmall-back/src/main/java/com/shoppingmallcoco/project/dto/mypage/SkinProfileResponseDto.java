package com.shoppingmallcoco.project.dto.mypage;

import com.shoppingmallcoco.project.entity.mypage.SkinProfile;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkinProfileResponseDto {

    private String skinType;         // 피부 타입
    private String[] concerns;       // 피부 고민 배열
    private String personalColor;    // 퍼스널 컬러

    public static SkinProfileResponseDto fromEntity(SkinProfile entity) {
        if (entity == null) {
            return SkinProfileResponseDto.builder()
                    .skinType("")
                    .concerns(new String[]{})
                    .personalColor("")
                    .build();
        }

        return SkinProfileResponseDto.builder()
                .skinType(entity.getSkinType())
                .concerns(entity.getSkinConcern() != null && !entity.getSkinConcern().isEmpty()
                        ? entity.getSkinConcern().split(",")
                        : new String[]{})
                .personalColor(entity.getPersonalColor())
                .build();
    }
}
