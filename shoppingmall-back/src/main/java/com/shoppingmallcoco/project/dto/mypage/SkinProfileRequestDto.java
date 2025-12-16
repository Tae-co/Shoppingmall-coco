package com.shoppingmallcoco.project.dto.mypage;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SkinProfileRequestDto {
    private String skinType;
    private List<String> concerns;
    private String personalColor;
}
